'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Activity, BarChart3, Bot, CheckCircle2, ChevronRight, FileStack, Globe2,
  Layers3, Link2, MessageSquarePlus, Mic2, Palette, Send, ShieldCheck,
  Sparkles, TriangleAlert, Users, Video, Workflow
} from 'lucide-react';

type WorkItem={
  id:string;
  title:string;
  status:string;
  priority:string;
  approval_required:boolean;
  source_reference?:string|null;
  created_at?:string|null;
};

type DashboardState={
  source?:string;
  openWork?:number|null;
  approvals?:number|null;
  estate?:number|null;
  estateReview?:number|null;
  systemIssues?:number|null;
  clients?:number|null;
  warning?:string;
  recentWork?:WorkItem[];
};

type IrisState={status?:string;answer?:string;reason?:string};

const modules=[
  {href:'/social',label:'Social Studio',desc:'Plan, approve and measure social activity.',icon:Sparkles,tone:'purple'},
  {href:'/production',label:'Media Lab',desc:'Create and manage approved media production.',icon:Video,tone:'gold'},
  {href:'/',label:'IRIS Command',desc:'Ask once. IRIS conducts the work.',icon:Bot,tone:'teal'},
  {href:'/projects',label:'Web & Assets',desc:'Keep the digital estate aligned and controlled.',icon:Layers3,tone:'blue'},
  {href:'/intelligence',label:'Intelligence',desc:'See evidence, signals and operational insight.',icon:Activity,tone:'pink'},
  {href:'/portal/reports',label:'Reports & KPI',desc:'Track outcomes across the ORVIA landscape.',icon:BarChart3,tone:'purple'},
];

function norm(value?:string){return String(value||'').toLowerCase().replace(/[_-]+/g,' ')}
function bucket(item:WorkItem){
  const s=norm(item.status);
  if(/complete|closed|done/.test(s)) return 'done';
  if(/block|fail|hold/.test(s)) return 'blocked';
  if(item.approval_required||/review|approval|waiting/.test(s)) return 'review';
  if(/progress|running|active|started/.test(s)) return 'progress';
  return 'todo';
}

export function DashboardHome(){
  const [dashboard,setDashboard]=useState<DashboardState|null>(null);
  const [command,setCommand]=useState('');
  const [sending,setSending]=useState(false);
  const [irisMessage,setIrisMessage]=useState('');

  useEffect(()=>{
    fetch('/api/dashboard',{cache:'no-store'})
      .then(r=>r.json())
      .then(setDashboard)
      .catch(()=>setDashboard({source:'unavailable',warning:'Live dashboard connection unavailable.'}));
  },[]);

  const live=dashboard?.source==='live';
  const work=dashboard?.recentWork??[];
  const columns=useMemo(()=>({
    todo:work.filter(x=>bucket(x)==='todo'),
    progress:work.filter(x=>bucket(x)==='progress'),
    review:work.filter(x=>bucket(x)==='review'),
    done:work.filter(x=>bucket(x)==='done'),
    blocked:work.filter(x=>bucket(x)==='blocked'),
  }),[work]);

  async function askIris(){
    const question=command.trim();
    if(!question||sending)return;
    setSending(true);setIrisMessage('');
    try{
      const r=await fetch('/api/iris/ask',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question,context:{pathname:'/',role:'founder',lens:'Command'}})});
      const data:IrisState=await r.json().catch(()=>({status:'INCOMPLETE',reason:'IRIS did not return a readable response.'}));
      setIrisMessage(data.status==='COMPLETE'&&data.answer?data.answer:(data.reason||'IRIS could not verify the answer.'));
      setCommand('');
      fetch('/api/dashboard',{cache:'no-store'}).then(x=>x.json()).then(setDashboard).catch(()=>{});
    }catch{setIrisMessage('IRIS connection is not verified right now.');}
    finally{setSending(false);}
  }

  const metrics=[
    {label:'Open work',value:live?dashboard?.openWork:'—',sub:'Live work state',icon:Workflow,tone:'blue'},
    {label:'Needs approval',value:live?dashboard?.approvals:'—',sub:'Human authority retained',icon:ShieldCheck,tone:'purple'},
    {label:'Estate surfaces',value:live?dashboard?.estate:'—',sub:live?`${dashboard?.estateReview??0} need review`:'Not verified',icon:Globe2,tone:'teal'},
    {label:'Client organisations',value:live?dashboard?.clients:'—',sub:'Current live register',icon:Users,tone:'gold'},
    {label:'System issues',value:live?dashboard?.systemIssues:'—',sub:live&&dashboard?.systemIssues===0?'No current issues':'Connections needing attention',icon:Link2,tone:'pink'},
  ];

  return <div className="ovOverview">
    <div className="ovPageHead">
      <div><small>ORVIA OVERSIGHT · UNIFIED OPERATING SYSTEM</small><h2>Overview</h2></div>
      <div className={`ovLivePill ${live?'isLive':'isPending'}`}><span/>{live?'Interface live · synced with modules':'Interface live · data connection pending'}</div>
    </div>

    <div className="ovTabs"><button className="active">Overview</button><Link href="/work">Workflows</Link><Link href="/portal/reports">Performance</Link><Link href="/systems">Connections</Link></div>

    <section className="ovHero">
      <div className="ovHeroCopy">
        <div className="ovHeroEyebrow"><span/> ORVIA COMMAND</div>
        <h1>One system across every ORVIA surface.</h1>
        <p>IRIS keeps work, evidence, brand, media and performance connected so every ORVIA surface works as one.</p>
        <div className="ovHeroActions">
          <button onClick={()=>document.getElementById('ov-iris')?.focus()}><Sparkles size={17}/>Create with IRIS</button>
          <Link href="/projects">Open ORVIA Landscape <ChevronRight size={16}/></Link>
        </div>
      </div>

      <div className="ovOrbit" aria-hidden="true">
        <div className="ovOrbitRing r1"/><div className="ovOrbitRing r2"/><div className="ovOrbitRing r3"/>
        <div className="ovOrbitCore"><span className="orbitMark">O</span><b>ORVIA</b><small>COMMAND</small></div>
        <div className="ovNode n1 purple"><Palette size={17}/><b>Brand</b></div>
        <div className="ovNode n2 gold"><Video size={17}/><b>Media</b></div>
        <div className="ovNode n3 teal"><Mic2 size={17}/><b>Voice</b></div>
        <div className="ovNode n4 blue"><Layers3 size={17}/><b>Web & Assets</b></div>
        <div className="ovNode n5 pink"><Send size={17}/><b>Campaigns</b></div>
      </div>
      <div className="ovHeroNote"><small>A UNIFIED<br/>ORVIA ECOSYSTEM</small><p>Connected modules.<br/>Consistent output.<br/>Human control.</p></div>
    </section>

    <section className="ovMetrics">
      {metrics.map(({label,value,sub,icon:Icon,tone})=><article key={label} className={`ovMetric ${tone}`}>
        <div className="ovMetricIcon"><Icon size={19}/></div><div><strong>{value??'—'}</strong><b>{label}</b><small>{sub}</small></div>
      </article>)}
    </section>

    <section className="ovModules">
      {modules.map(({href,label,desc,icon:Icon,tone})=><Link href={href} key={label} className={`ovModule ${tone}`}>
        <div className="ovModuleIcon"><Icon size={18}/></div><div><b>{label}</b><small>{desc}</small></div><ChevronRight size={16}/>
      </Link>)}
    </section>

    <section className="ovWorkflowPanel">
      <div className="ovPanelHead"><div><small>IRIS · COMMAND</small><h3>Workflows & Actions</h3><p>Live work from the ORVIA queue. No synthetic work items are shown.</p></div><Link href="/work">View all work <ChevronRight size={15}/></Link></div>
      <div className="ovBoard">
        {([
          ['todo','To Do'],['progress','In Progress'],['review','Awaiting Review'],['done','Done'],['blocked','Blocked']
        ] as const).map(([key,label])=><div className={`ovColumn ${key}`} key={key}>
          <header><b>{label}</b><span>{columns[key].length}</span></header>
          <div className="ovCards">
            {columns[key].length?columns[key].slice(0,4).map(item=><article key={item.id}>
              <div className="ovCardTop"><span className="ovCardDot"/><b>{item.title}</b></div>
              <small>{item.priority||'Normal'} · {item.status||'Open'}</small>
            </article>):<div className="ovEmpty">No live items in this state.</div>}
          </div>
        </div>)}
      </div>
    </section>

    <section className="ovBottomGrid">
      <div className="ovIrisBox">
        <div><small>ASK IRIS</small><h3>Command the business from here.</h3><p>Describe the outcome. IRIS handles routing and returns anything requiring human authority.</p></div>
        <div className="ovIrisComposer">
          <input id="ov-iris" value={command} onChange={e=>setCommand(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')askIris()}} placeholder="Tell IRIS what you need…" />
          <button onClick={askIris} disabled={sending||!command.trim()}>{sending?'Working…':<><Send size={16}/>Send</>}</button>
        </div>
        {irisMessage?<div className="ovIrisReply">{irisMessage}</div>:null}
      </div>
      <div className="ovHealthBox">
        <div className="ovPanelHead compact"><div><small>LIVE CONTROL</small><h3>System position</h3></div></div>
        <div className="ovHealthRows">
          <div><span><CheckCircle2 size={15}/>Backend deployment</span><b>Live</b></div>
          <div><span><FileStack size={15}/>Evidence estate</span><b>{live?'Synced':'Pending'}</b></div>
          <div><span><TriangleAlert size={15}/>Connection issues</span><b>{live?dashboard?.systemIssues??0:'—'}</b></div>
        </div>
      </div>
    </section>
  </div>;
}
