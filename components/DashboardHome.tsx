'use client';
import { useState } from 'react';
import { ArrowRight, CheckCircle2, Database, FileCheck2, Send } from 'lucide-react';
import { integrations } from '@/lib/data';
import { MethodRail } from './MethodRail';
import { MetricCard } from './MetricCard';
import { StatusBadge } from './StatusBadge';

export function DashboardHome(){
 const [command,setCommand]=useState('Run my launch-critical review from current verified evidence only.');
 const [sent,setSent]=useState(false);
 return <div className="pageWrap">
  <section className="commandHero">
   <div className="commandHeroTop"><div><div className="eyebrow">COMMAND ORVIA</div><h2>Ask once. Route the work. Record the evidence.</h2><p>IRIS coordinates the instruction across the workspace. VERA preserves the evidence trail. Consequential decisions remain with the human owner.</p></div><MethodRail/></div>
   <div className="commandComposer"><input value={command} onChange={e=>setCommand(e.target.value)} aria-label="Command"/><button onClick={()=>setSent(true)}><Send size={16}/> Send to IRIS</button></div>
   {sent && <div className="commandNotice"><CheckCircle2 size={16}/> Command staged for review. This review build does not execute consequential actions.</div>}
  </section>
  <section className="metricsGrid"><MetricCard label="OPEN WORK" value={8} detail="Current admin task baseline" tone="gold"/><MetricCard label="HUMAN APPROVALS" value={7} detail="Held for consequential review" tone="purple"/><MetricCard label="CONTROLLED REGISTER" value={3} detail="Existing master-register records" tone="teal"/><MetricCard label="BRAND RISK" value="—" detail="No fabricated live metric" tone="orange"/></section>
  <section className="twoCol">
   <article className="panel"><div className="panelHead"><div><span>VISIBILITY · CURRENT CONNECTION PICTURE</span><h3>Connected systems</h3></div><ArrowRight size={18}/></div><div className="panelBody systemsGrid">{integrations.map(x=><div className="systemRow" key={x.name}><div><b>{x.name}</b><small>{x.note}</small></div><StatusBadge status={x.state}/></div>)}</div></article>
   <article className="panel"><div className="panelHead"><div><span>ACCOUNTABILITY · AUDIT TRAIL</span><h3>Recent controlled activity</h3></div><Database size={18}/></div><div className="panelBody activityList"><div><FileCheck2/><p><b>Command Centre package prepared</b><small>GitHub/Vercel-ready review build</small></p></div><div><FileCheck2/><p><b>Master controlled template reconciled</b><small>Evidence gaps and Human Reality retained</small></p></div><div><FileCheck2/><p><b>SharePoint register retained as source</b><small>No duplicate approval state created</small></p></div></div></article>
  </section>
 </div>
}
