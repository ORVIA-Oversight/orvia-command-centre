'use client';
import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Database, ExternalLink, FileCheck2, Send, TriangleAlert } from 'lucide-react';
import { integrations } from '@/lib/data';
import { MethodRail } from './MethodRail';
import { MetricCard } from './MetricCard';
import { StatusBadge } from './StatusBadge';

type DashboardState={source?:string;openTasks?:number;approvals?:number;integrations?:Array<{name:string;status:string}>;warning?:string};
type SiteState={ok?:boolean;homepage?:{ok:boolean;status:number;ms:number};sitemap?:{ok:boolean;status:number;ms:number};stats?:{ok:boolean;status:number;ms:number};checkedAt?:string};
type IrisState={status?:string;answer?:string;reason?:string;model?:string};

export function DashboardHome(){
 const [command,setCommand]=useState('Run my launch-critical review from current verified evidence only.');
 const [iris,setIris]=useState<IrisState|null>(null);
 const [sending,setSending]=useState(false);
 const [dashboard,setDashboard]=useState<DashboardState|null>(null);
 const [site,setSite]=useState<SiteState|null>(null);

 useEffect(()=>{
  fetch('/api/dashboard',{cache:'no-store'}).then(r=>r.json()).then(setDashboard).catch(()=>setDashboard({source:'unavailable'}));
  fetch('/api/site',{cache:'no-store'}).then(r=>r.json()).then(setSite).catch(()=>setSite({ok:false}));
 },[]);

 async function sendToIris(){
  setSending(true); setIris(null);
  try{
   const r=await fetch('https://workspace.orvia.org.uk/api/ask',{
    method:'POST',
    credentials:'include',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({question:command,context:{pathname:'/command',role:'founder',lens:'Command Centre'}})
   });
   const data=await r.json().catch(()=>({status:'INCOMPLETE',reason:`IRIS returned HTTP ${r.status}`}));
   if(r.status===401) data.reason='IRIS is live but your Workspace session is not active. Open Workspace, sign in, then return here and send again.';
   setIris(data);
  }catch{setIris({status:'INCOMPLETE',reason:'IRIS could not be reached from Command. The connection remains unverified.'});}
  finally{setSending(false);}
 }

 const openTasks=dashboard?.source==='live'?dashboard.openTasks??0:'—';
 const approvals=dashboard?.source==='live'?dashboard.approvals??0:'—';
 const siteLabel=site?.ok?'LIVE':'—';

 return <div className="pageWrap">
  <section className="commandHero">
   <div className="commandHeroTop"><div><div className="eyebrow">COMMAND ORVIA</div><h2>Ask once. Route the work. Record the evidence.</h2><p>IRIS coordinates the instruction across the Workspace. VERA preserves the evidence trail. Consequential decisions remain with the human owner.</p></div><MethodRail/></div>
   <div className="commandComposer"><input value={command} onChange={e=>setCommand(e.target.value)} aria-label="Command"/><button onClick={sendToIris} disabled={sending}><Send size={16}/> {sending?'Sending…':'Send to IRIS'}</button></div>
   {iris?.status==='COMPLETE' && <div className="commandNotice"><CheckCircle2 size={16}/><div><b>IRIS · {iris.model||'live response'}</b><div>{iris.answer}</div></div></div>}
   {iris && iris.status!=='COMPLETE' && <div className="commandNotice"><TriangleAlert size={16}/><div><b>IRIS connection not accepted</b><div>{iris.reason||'No verified response was returned.'} <a href="https://workspace.orvia.org.uk" target="_blank" rel="noreferrer">Open Workspace <ExternalLink size={12}/></a></div></div></div>}
  </section>
  <section className="metricsGrid"><MetricCard label="OPEN WORK" value={openTasks} detail={dashboard?.source==='live'?'Live Hive / admin_tasks':'Awaiting live Supabase configuration'} tone="gold"/><MetricCard label="HUMAN APPROVALS" value={approvals} detail={dashboard?.source==='live'?'Live approval-required tasks':'Awaiting live Supabase configuration'} tone="purple"/><MetricCard label="PUBLIC SITE" value={siteLabel} detail={site?.ok?'orvia.org.uk health check passed':'Live health check unavailable'} tone="teal"/><MetricCard label="BRAND RISK" value="—" detail="Shown only from verified monitoring feed" tone="orange"/></section>
  <section className="twoCol">
   <article className="panel"><div className="panelHead"><div><span>VISIBILITY · CURRENT CONNECTION PICTURE</span><h3>Connected systems</h3></div><ArrowRight size={18}/></div><div className="panelBody systemsGrid">{integrations.map(x=><div className="systemRow" key={x.name}><div><b>{x.name}</b><small>{x.note}</small></div><StatusBadge status={x.state}/></div>)}</div></article>
   <article className="panel"><div className="panelHead"><div><span>ACCOUNTABILITY · LIVE ESTATE</span><h3>Current evidence</h3></div><Database size={18}/></div><div className="panelBody activityList"><div><FileCheck2/><p><b>Hive / Supabase</b><small>{dashboard?.source==='live'?'LIVE VERIFIED by /api/dashboard':dashboard?.warning||'Not yet verified from this deployment'}</small></p></div><div><FileCheck2/><p><b>Public ORVIA site</b><small>{site?.ok?`LIVE VERIFIED · homepage ${site.homepage?.status} · sitemap ${site.sitemap?.status}`:'Not verified'}</small></p></div><div><FileCheck2/><p><b>IRIS / Workspace</b><small>{iris?.status==='COMPLETE'?'LIVE VERIFIED by authenticated response':'Connection built; send a command after signing into Workspace to verify'}</small></p></div></div></article>
  </section>
 </div>
}
