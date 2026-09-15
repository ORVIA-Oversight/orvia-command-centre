'use client';
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, PoundSterling, Send, ShieldCheck, Target, TriangleAlert, Volume2, VolumeX } from 'lucide-react';
import { MetricCard } from './MetricCard';

type Campaign={id:string;name:string;status:string;target_sector?:string;metrics?:{leads:number;eligible:number;attempts:number;answered:number;bookings:number;handoffs:number}};
type DashboardState={source?:string;openTasks?:number;approvals?:number;warning?:string;outbound?:{source?:string;primaryNumber?:{display_number?:string}|null;campaigns?:Campaign[]}};
type SiteState={ok?:boolean};
type IrisState={status?:string;answer?:string;reason?:string};

export function DashboardHome(){
 const [command,setCommand]=useState('What actually needs my attention today?');
 const [iris,setIris]=useState<IrisState|null>(null);
 const [sending,setSending]=useState(false);
 const [voiceOn,setVoiceOn]=useState(true);
 const [dashboard,setDashboard]=useState<DashboardState|null>(null);
 const [site,setSite]=useState<SiteState|null>(null);

 useEffect(()=>{
  fetch('/api/dashboard',{cache:'no-store'}).then(r=>r.json()).then(setDashboard).catch(()=>setDashboard({source:'unavailable'}));
  fetch('/api/site',{cache:'no-store'}).then(r=>r.json()).then(setSite).catch(()=>setSite({ok:false}));
 },[]);

 function speak(text:string){
  if(!voiceOn || typeof window==='undefined' || !('speechSynthesis' in window) || !text) return;
  window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(text);
  utterance.rate=1;
  utterance.pitch=1;
  const voices=window.speechSynthesis.getVoices();
  const preferred=voices.find(v=>/en-GB/i.test(v.lang) && /female|susan|sonia|libby|hazel|aria/i.test(v.name)) || voices.find(v=>/en-GB/i.test(v.lang)) || voices[0];
  if(preferred) utterance.voice=preferred;
  window.speechSynthesis.speak(utterance);
 }

 async function sendToIris(){
  setSending(true); setIris(null);
  try{
   const r=await fetch('/api/iris/ask',{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({question:command,context:{pathname:'/command',role:'founder',lens:'Command Centre'}})
   });
   const data=await r.json().catch(()=>({status:'INCOMPLETE',reason:'IRIS could not complete that request.'}));
   setIris(data);
   if(data?.status==='COMPLETE' && data?.answer) speak(data.answer);
  }catch{setIris({status:'INCOMPLETE',reason:'IRIS is unavailable right now. I need to verify the connection before answering reliably.'});}
  finally{setSending(false);}
 }

 const campaigns=dashboard?.outbound?.campaigns??[];
 const activeCampaign=campaigns.find(c=>['ready','active','running'].includes(String(c.status||'').toLowerCase())) || campaigns[0];
 const totalEligible=campaigns.reduce((sum,c)=>sum+(c.metrics?.eligible??0),0);
 const totalAttempts=campaigns.reduce((sum,c)=>sum+(c.metrics?.attempts??0),0);
 const totalBookings=campaigns.reduce((sum,c)=>sum+(c.metrics?.bookings??0),0);
 const openTasks=dashboard?.source==='live'?dashboard.openTasks??0:'—';
 const approvals=dashboard?.source==='live'?dashboard.approvals??0:'—';
 const everythingOnTrack=dashboard?.source==='live' && (dashboard.approvals??0)===0;

 const attentionText=useMemo(()=>{
  if(dashboard?.source!=='live') return 'I still need a verified live work feed before I can give you a reliable daily picture.';
  const approvalCount=dashboard.approvals??0;
  if(approvalCount>0) return `${approvalCount} item${approvalCount===1?' needs':'s need'} your decision. Routine work can stay in the background.`;
  return 'Nothing currently needs your approval. Keep the routine work moving in the background.';
 },[dashboard]);

 return <div className="pageWrap">
  <section className="commandHero">
   <div className="eyebrow">ORVIA COMMAND</div>
   <h2>Good evening John. Here is what matters.</h2>
   <p>{attentionText}</p>

   <div className="commandComposer">
    <input value={command} onChange={e=>setCommand(e.target.value)} aria-label="Ask IRIS" placeholder="Ask IRIS anything about ORVIA…" />
    <button type="button" onClick={()=>{setVoiceOn(v=>!v); if(voiceOn && typeof window!=='undefined') window.speechSynthesis?.cancel();}} title={voiceOn?'Voice reply on':'Voice reply off'}>{voiceOn?<Volume2 size={16}/>:<VolumeX size={16}/>} {voiceOn?'Voice on':'Voice off'}</button>
    <button onClick={sendToIris} disabled={sending||!command.trim()}><Send size={16}/> {sending?'Working…':'Ask IRIS'}</button>
   </div>

   {iris?.status==='COMPLETE' && <div className="commandNotice"><CheckCircle2 size={16}/><div><b>IRIS</b><div>{iris.answer}</div></div></div>}
   {iris && iris.status!=='COMPLETE' && <div className="commandNotice"><TriangleAlert size={16}/><div><b>IRIS needs to verify something first</b><div>{iris.reason||'I do not have enough verified information to answer that reliably.'}</div></div></div>}
  </section>

  <section className="metricsGrid">
   <MetricCard label="NEEDS YOU" value={approvals} detail={dashboard?.source==='live'?'Decisions or approvals waiting for you':'Awaiting verified live work state'} tone="purple"/>
   <MetricCard label="OPEN WORK" value={openTasks} detail={dashboard?.source==='live'?'Active work across ORVIA':'Awaiting verified live work state'} tone="gold"/>
   <MetricCard label="SALES" value={totalEligible||'—'} detail={totalEligible?'Eligible prospects in current outbound campaigns':'No verified eligible prospect count yet'} tone="teal"/>
   <MetricCard label="LIVE SERVICES" value={site?.ok?'ON':'—'} detail={site?.ok?'Public ORVIA service responding':'Service health not yet verified'} tone="orange"/>
  </section>

  <section className="twoCol spaced">
   <article className="panel">
    <div className="panelHead"><div><span>TODAY</span><h3>What needs attention</h3></div><Clock3 size={18}/></div>
    <div className="panelBody activityList">
     <div><ShieldCheck/><p><b>{everythingOnTrack?'Nothing needs you right now':`${approvals} decision${approvals===1?'':'s'} waiting`}</b><small>{everythingOnTrack?'Routine work can continue without interruption.':'Open the approvals view when you are ready to decide.'}</small></p></div>
     <div><Target/><p><b>{activeCampaign?activeCampaign.name:'Sales campaign not yet verified'}</b><small>{activeCampaign?`${String(activeCampaign.status||'unknown').toUpperCase()} · ${totalEligible} eligible · ${totalAttempts} attempts · ${totalBookings} bookings`:'IRIS will show sales only when the live campaign feed is available.'}</small></p></div>
     <div><PoundSterling/><p><b>Money view</b><small>Keep financial truth read-only from Stripe until the finance connection is verified in Command.</small></p></div>
    </div>
   </article>

   <article className="panel">
    <div className="panelHead"><div><span>HOW COMMAND WORKS</span><h3>One conversation. Everything else behind it.</h3></div><ShieldCheck size={18}/></div>
    <div className="panelBody activityList">
     <div><CheckCircle2/><p><b>IRIS coordinates</b><small>You ask once. IRIS routes the work to the right division.</small></p></div>
     <div><CheckCircle2/><p><b>VERA verifies</b><small>Facts are checked before they are presented as confirmed.</small></p></div>
     <div><CheckCircle2/><p><b>CRUCIBLE challenges</b><small>Consequential work is independently challenged before release.</small></p></div>
     <div><CheckCircle2/><p><b>You decide</b><small>Money, contracts, publication, safeguarding and other consequential actions stay with you.</small></p></div>
    </div>
   </article>
  </section>
 </div>
}
