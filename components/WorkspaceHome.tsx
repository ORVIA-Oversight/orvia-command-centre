'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowRight, BellRing, BookOpen, Bot, CheckCircle2, FolderKanban,
  Layers3, RadioTower, Radar, ShieldCheck, Sparkles, Workflow
} from 'lucide-react';

type DashboardState={
  source?:string;
  openTasks?:number;
  approvals?:number;
  outbound?:{campaigns?:Array<{metrics?:{eligible:number}}>}
};

const areas=[
  {href:'/iris',icon:Bot,title:'Ask IRIS',copy:'Use the assistant when you need help, analysis or a decision prepared.'},
  {href:'/production',icon:Workflow,title:'Workflows',copy:'See active work, approvals and operational processes.'},
  {href:'/deploy',icon:RadioTower,title:'Track & deployments',copy:'Field awareness, events, assets, connectivity and deployment readiness.'},
  {href:'/projects',icon:FolderKanban,title:'Services & projects',copy:'Open the ORVIA services, ventures and delivery workspaces.'},
  {href:'/intelligence',icon:Radar,title:'Insights',copy:'Bring signals, evidence and useful intelligence together.'},
  {href:'/library',icon:BookOpen,title:'Files & evidence',copy:'Controlled records, documents and verified material.'},
];

export function WorkspaceHome(){
  const [data,setData]=useState<DashboardState|null>(null);

  useEffect(()=>{
    fetch('/api/dashboard',{cache:'no-store'})
      .then(r=>r.json()).then(setData)
      .catch(()=>setData({source:'unavailable'}));
  },[]);

  const live=data?.source==='live';
  const approvals=live?data?.approvals??0:null;
  const openTasks=live?data?.openTasks??0:null;
  const campaigns=data?.outbound?.campaigns??[];
  const eligible=campaigns.reduce((n,c)=>n+(c.metrics?.eligible??0),0);

  return <div className="workspaceHome">
    <section className="welcomePanel">
      <div>
        <div className="welcomeKicker"><Sparkles size={15}/> ORVIA Command</div>
        <h2>Everything important, in one calm workspace.</h2>
        <p>Command brings together work, evidence, communications, field operations and ORVIA services without forcing every user into the same control-room view.</p>
      </div>
      <Link className="askIrisButton" href="/iris"><Bot size={17}/><span>Ask IRIS</span></Link>
    </section>

    <section className="homeStatGrid">
      <article>
        <div className="statIcon attention"><BellRing size={18}/></div>
        <div><small>Needs attention</small><strong>{approvals===null?'—':approvals}</strong><span>{live?'Items awaiting a decision':'Live state not verified'}</span></div>
      </article>
      <article>
        <div className="statIcon work"><CheckCircle2 size={18}/></div>
        <div><small>Open work</small><strong>{openTasks===null?'—':openTasks}</strong><span>{live?'Active work items':'Live state not verified'}</span></div>
      </article>
      <article>
        <div className="statIcon leads"><FolderKanban size={18}/></div>
        <div><small>Available opportunities</small><strong>{live?eligible:'—'}</strong><span>{live?'Eligible records in connected campaigns':'Live state not verified'}</span></div>
      </article>
      <article>
        <div className="statIcon trust"><ShieldCheck size={18}/></div>
        <div><small>Evidence state</small><strong className="textStat">{live?'CONNECTED':'CHECK'}</strong><span>{live?'Current Command data connected':'Verify data connection'}</span></div>
      </article>
    </section>

    <section className="homeTwoCol">
      <article className="surfaceCard">
        <header className="surfaceHead"><div><small>WORKSPACE</small><h3>Where do you want to go?</h3></div></header>
        <div className="areaGrid">
          {areas.map(({href,icon:Icon,title,copy})=><Link href={href} key={href} className="areaCard">
            <div className="areaIcon"><Icon size={20}/></div>
            <div><b>{title}</b><p>{copy}</p></div>
            <ArrowRight size={16}/>
          </Link>)}
        </div>
      </article>

      <article className="surfaceCard">
        <header className="surfaceHead"><div><small>TODAY</small><h3>A clear starting point</h3></div></header>
        <div className="todayList">
          <div><span className="todayDot teal"/><div><b>Review what needs you</b><p>{approvals===null?'Connection not verified yet.':approvals?approvals+' item'+(approvals===1?'':'s')+' currently need attention.':'Nothing currently requires approval.'}</p></div></div>
          <div><span className="todayDot gold"/><div><b>Continue active work</b><p>{openTasks===null?'Connection not verified yet.':openTasks?openTasks+' work item'+(openTasks===1?' is':'s are')+' active.':'No active work is currently recorded.'}</p></div></div>
          <div><span className="todayDot purple"/><div><b>Use specialist views only when needed</b><p>Track, field maps and technical telemetry live inside the deployment workspace rather than defining the whole product.</p></div></div>
        </div>
      </article>
    </section>

    <section className="homeRoleBanner">
      <div><small>ROLE-ADAPTIVE BY DESIGN</small><h3>One platform. A different view for the person using it.</h3><p>Command can present different language and priorities for organisations, professionals, families, field teams and administrators while keeping one controlled evidence layer underneath.</p></div>
      <Link href="/systems"><Layers3 size={15}/> Platform structure</Link>
    </section>
  </div>;
}
