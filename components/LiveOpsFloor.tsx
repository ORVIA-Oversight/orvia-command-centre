'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bot, CirclePause, CirclePlay, ChevronDown, ChevronUp, CheckCircle2, CircleAlert, Clock3, RadioTower } from 'lucide-react';

type Job={
 id:string;work_type?:string|null;title:string;detail?:string|null;status:string;priority?:string|null;assigned_to?:string|null;
 approval_required?:boolean;source_system?:string|null;source_reference?:string|null;created_at?:string|null;updated_at?:string|null;
 state:'live'|'blocked'|'delivered'
};
type Agent={code:string;display_name:string;purpose?:string|null};
type FloorState={source?:string;jobs:Job[];agents:Agent[];updatedAt?:string};

function elapsed(job:Job){
 const start=new Date(job.created_at||job.updated_at||Date.now()).getTime();
 const ms=Math.max(0,Date.now()-start);
 const mins=Math.floor(ms/60000);
 if(mins<1)return '<1m';
 if(mins<60)return `${mins}m`;
 const h=Math.floor(mins/60),m=mins%60;
 return `${h}h ${m}m`;
}
function label(code:string|null|undefined,agents:Agent[]){
 if(!code)return 'Unassigned';
 return agents.find(a=>a.code===code)?.display_name||code;
}
function short(code:string|null|undefined){
 if(!code)return '—';
 if(code==='IRIS')return 'IRIS';
 return code.replace('-01','').replace('OUT_','');
}

export function LiveOpsFloor(){
 const [data,setData]=useState<FloorState>({jobs:[],agents:[]});
 const [paused,setPaused]=useState(false);
 const [open,setOpen]=useState<string|null>(null);
 const [now,setNow]=useState(Date.now());

 useEffect(()=>{
  let dead=false;
  async function load(){
   try{
    const r=await fetch('/api/live-ops',{cache:'no-store'});
    const j=await r.json();
    if(!dead&&!paused)setData(j);
   }catch{}
  }
  load();
  const id=setInterval(load,5000);
  return ()=>{dead=true;clearInterval(id)};
 },[paused]);

 useEffect(()=>{
  const id=setInterval(()=>setNow(Date.now()),1000);
  return ()=>clearInterval(id);
 },[]);

 const live=useMemo(()=>data.jobs.filter(j=>j.state==='live'),[data.jobs]);
 const blocked=useMemo(()=>data.jobs.filter(j=>j.state==='blocked'),[data.jobs]);
 const delivered=useMemo(()=>data.jobs.filter(j=>j.state==='delivered'),[data.jobs]);

 return <section className="liveOps">
   <header className="liveOpsHead">
     <div>
       <small>LIVE OPERATIONS FLOOR</small>
       <h3>What ORVIA is doing right now</h3>
       <p>Real queue activity only. No synthetic bot movement.</p>
     </div>
     <div className="liveOpsControls">
       <span className={paused?'paused':'live'}><i/>{paused?'VIEW PAUSED':'LIVE'}</span>
       <button onClick={()=>setPaused(v=>!v)}>{paused?<><CirclePlay size={15}/>Resume</>:<><CirclePause size={15}/>Pause view</>}</button>
     </div>
   </header>

   <div className="opsMap">
     <div className="irisHub">
       <div className="irisPulse"><RadioTower size={20}/></div>
       <b>IRIS</b>
       <span>SOLE CONDUCTOR</span>
       <small>{live.length} active · {blocked.length} blocked</small>
     </div>

     <div className="opsLane liveLane">
       <header><span className="laneDot"/><b>IN MOTION</b><strong>{live.length}</strong></header>
       <div className="opsCards">
       {live.map((job,i)=><article className="opsJob liveJob" key={job.id}>
         <div className="botTrack"><div className={"movingBot "+(paused?'freeze':'')} style={{animationDelay:`${(i%8)*-.55}s`}}><Bot size={15}/><span>{short(job.assigned_to)}</span></div></div>
         <button className="opsJobMain" onClick={()=>setOpen(open===job.id?null:job.id)}>
           <div className="jobTop"><span>{job.priority||'normal'}</span><small><Clock3 size={11}/>{elapsed(job)}</small></div>
           <b>{job.title}</b>
           <p>{label(job.assigned_to,data.agents)}</p>
           <footer><span>{job.source_system||'ORVIA'}</span><span>{job.status}</span>{open===job.id?<ChevronUp size={13}/>:<ChevronDown size={13}/>}</footer>
         </button>
         {open===job.id&&<div className="opsDetail"><p>{job.detail||'No further job detail recorded.'}</p><small>Work type: {job.work_type||'—'} · Ref: {job.source_reference||'—'} · Approval: {job.approval_required?'Required':'No gate recorded'}</small></div>}
       </article>)}
       {!live.length&&<div className="opsEmpty">No active queue jobs are evidenced right now.</div>}
       </div>
     </div>

     <div className="opsLane blockedLane">
       <header><CircleAlert size={14}/><b>STOPPED / BLOCKED</b><strong>{blocked.length}</strong></header>
       <div className="opsCards">
       {blocked.map(job=><article className="opsJob blockedJob" key={job.id}>
         <button className="opsJobMain" onClick={()=>setOpen(open===job.id?null:job.id)}>
           <div className="jobTop"><span>{job.priority||'normal'}</span><small>STOPPED</small></div>
           <b>{job.title}</b><p>{label(job.assigned_to,data.agents)}</p>
           <footer><span>{job.source_system||'ORVIA'}</span><span>{job.status}</span>{open===job.id?<ChevronUp size={13}/>:<ChevronDown size={13}/>}</footer>
         </button>
         {open===job.id&&<div className="opsDetail"><p>{job.detail||'No further blocker detail recorded.'}</p><small>Ref: {job.source_reference||'—'}</small></div>}
       </article>)}
       {!blocked.length&&<div className="opsEmpty">No blocked queue jobs.</div>}
       </div>
     </div>

     <div className="opsLane deliveredLane">
       <header><CheckCircle2 size={14}/><b>RECENTLY DELIVERED</b><strong>{delivered.length}</strong></header>
       <div className="opsCards compact">
       {delivered.slice(0,10).map(job=><article className="opsJob deliveredJob" key={job.id}>
         <button className="opsJobMain" onClick={()=>setOpen(open===job.id?null:job.id)}>
           <b>{job.title}</b><p>{label(job.assigned_to,data.agents)}</p>
           <footer><span>{job.source_system||'ORVIA'}</span><span>{job.status}</span></footer>
         </button>
         {open===job.id&&<div className="opsDetail"><p>{job.detail||'Delivered.'}</p></div>}
       </article>)}
       {!delivered.length&&<div className="opsEmpty">No completed queue jobs in the last 12 hours.</div>}
       </div>
     </div>
   </div>
 </section>;
}
