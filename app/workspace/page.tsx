import Link from 'next/link';
import { ArrowRight, Building2, CheckCircle2, CircleAlert, Clock3, ExternalLink, ShieldCheck, Users } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Topbar } from '@/components/Topbar';
import { LiveOpsFloor } from '@/components/LiveOpsFloor';
import { loadOrviaAssets, isCurrentAsset, isLegacyAsset } from '@/lib/asset-registry';
import { getServerSupabase } from '@/lib/supabase-server';
import { isInternalOrviaOrganisation, loadClientRegistry, organisationName, servicesForOrganisation } from '@/lib/client-registry';

export const dynamic='force-dynamic';
export const revalidate=0;

async function loadWorkspace(){
 const supabase=getServerSupabase();
 const [assetState,clientRegistry]=await Promise.all([loadOrviaAssets(),loadClientRegistry()]);
 if(!supabase) return {source:'review-build',tasks:[],queue:[],assets:assetState.assets,assetSource:assetState.source,clientRegistry,readiness:[],agents:[]};
 const [tasks,queue,readiness,agents]=await Promise.all([
  supabase.from('admin_tasks').select('id,title,status,priority,owner,due_at,approval_required,updated_at').order('updated_at',{ascending:false}).limit(60),
  supabase.from('admin_work_queue').select('id,title,status,priority,assigned_to,approval_required,source_system,updated_at').order('updated_at',{ascending:false}).limit(60),
  supabase.from('web_project_readiness_summary').select('project_code,domain,live_url,preview_url,github_repo,deployment_project,state,completion_percent,rag_status,critical_blocker_count,outstanding_dimensions').order('completion_percent',{ascending:false}),
  supabase.from('admin_agents').select('code,display_name,purpose,active,metadata').eq('active',true).order('code',{ascending:true})
 ]);
 return {source:'live',tasks:tasks.data??[],queue:queue.data??[],assets:assetState.assets,assetSource:assetState.source,clientRegistry,readiness:readiness.data??[],agents:agents.data??[]};
}

function accentClass(key:string|null){
 return key==='r'?'visual-teal':key==='v'?'visual-gold':key==='i'?'visual-purple':key==='a'?'visual-orange':'visual-navy';
}
function ragClass(rag:string|null|undefined){return rag==='GREEN'?'green':rag==='AMBER'?'amber':'red';}
function pretty(code:string){return String(code||'').replaceAll('_',' ').replaceAll('-',' ');}
function commercialName(code:string){
 const map:Record<string,string>={
  'ORVIA-WITNESS-INTERNAL':'Witness Room',
  'ORVIA-THRESHOLD-INTERNAL':'Threshold',
  'ORVIA-MIA-INTERNAL':'MIA Legacy',
  'ORVIA-WEB-INTERNAL':'ORVIA Web',
  'ORVIA-BUSINESS-INTERNAL':'ORVIA Business',
  'ORVIA-SECURITY-INTERNAL':'Security & Intelligence',
  'ORVIA-BRAND-INTERNAL':'Brand Control',
  'ORVIA-VOICE-INTERNAL':'ORVIA Voice',
  'VANGUARD-TACTICAL-INTERNAL':'Vanguard Tactical',
  'ORVIA-OVERSIGHT-MASTER':'ORVIA Marketplace'
 };
 return map[code]||pretty(code);
}

export default async function WorkspacePage(){
 const data=await loadWorkspace();
 const currentAssets=data.assets.filter(isCurrentAsset).filter(a=>!isLegacyAsset(a));
 const approvalItems=[...data.tasks,...data.queue].filter((x:any)=>x.approval_required===true && !['completed','closed','done'].includes(String(x.status||'').toLowerCase()));
 const inProgress=[...data.tasks,...data.queue].filter((x:any)=>['active','in_progress','processing','running','assigned','open'].includes(String(x.status||'').toLowerCase()));
 const blocked=[...data.tasks,...data.queue].filter((x:any)=>['blocked','failed','needs_human','review_required'].includes(String(x.status||'').toLowerCase()));
 const completed=[...data.tasks,...data.queue].filter((x:any)=>['completed','closed','done'].includes(String(x.status||'').toLowerCase()));
 const reviewCount=currentAssets.filter(a=>['rename','temporary','hold'].includes(a.estate_disposition)||!/verified/i.test(a.verification_status||'')).length;
 const clients=data.clientRegistry.organisations.filter(org=>!isInternalOrviaOrganisation(org));
 const readiness=(data.readiness as any[]).filter((p:any)=>!['ORVIA-HEALTHCARE-LEGACY','ORVIA-WORKSPACE-TEMP'].includes(p.project_code));
 const commercial=readiness.filter((p:any)=>[
   'ORVIA-OVERSIGHT-MASTER','ORVIA-VOICE-INTERNAL','ORVIA-WEB-INTERNAL','ORVIA-WITNESS-INTERNAL','ORVIA-MIA-INTERNAL',
   'ORVIA-THRESHOLD-INTERNAL','ORVIA-BUSINESS-INTERNAL','ORVIA-SECURITY-INTERNAL','ORVIA-BRAND-INTERNAL','VANGUARD-TACTICAL-INTERNAL'
 ].includes(p.project_code));
 const heldDomains=currentAssets.filter(a=>a.asset_type==='domain_asset'&&a.estate_disposition==='hold');
 const controlAgents=(data.agents as any[]).filter((a:any)=>['IRIS','VERA-01','VITA-01','IT-01','LEGAL-01','SALES-01','RECORDS-01'].includes(a.code));
 const iris=controlAgents.find((a:any)=>a.code==='IRIS');

 return <Shell><Topbar title="My Workspace" eyebrow="ORVIA OVERSIGHT LTD · FOUNDER WORKSPACE"/><div className="pageWrap founderWorkspace">
  <section className="workspaceHero">
   <div><div className="eyebrow">TELL ORVIA ONCE</div><h2>Everything you are running, in one place.</h2><p>Live estate, commercial products, internal control layers, readiness and decisions from the controlled backend.</p></div>
   <Link href="/" className="workspaceIrisCta">Talk to IRIS <ArrowRight size={16}/></Link>
  </section>

  <section className="workspaceBuckets" aria-label="Founder work status">
   <article className="workspaceBucket needs"><CircleAlert size={19}/><small>NEEDS JOHN</small><strong>{approvalItems.length}</strong><span>Authority or decision required</span></article>
   <article className="workspaceBucket review"><ShieldCheck size={19}/><small>FOR REVIEW</small><strong>{reviewCount}</strong><span>Estate or work requiring reconciliation</span></article>
   <article className="workspaceBucket progress"><Clock3 size={19}/><small>IN PROGRESS</small><strong>{inProgress.length}</strong><span>Work continuing in the system</span></article>
   <article className="workspaceBucket blocked"><CircleAlert size={19}/><small>BLOCKED</small><strong>{blocked.length}</strong><span>Cannot proceed safely yet</span></article>
   <article className="workspaceBucket complete"><CheckCircle2 size={19}/><small>COMPLETED</small><strong>{completed.length}</strong><span>Recorded complete</span></article>
  </section>

  <section className="workspacePanel">
   <header><div><small>LIVE ORVIA LANDSCAPE</small><h3>Commercial products & public surfaces</h3><p>Product-first domains externally. ORVIA remains the marketplace and operating system behind them.</p></div><Link href="/projects">Full estate <ArrowRight size={14}/></Link></header>
   <div className="workspaceProjectGrid">{commercial.map((p:any)=><article className={'workspaceProject '+ragClass(p.rag_status)} key={p.project_code}>
     <span>{p.rag_status==='GREEN'?'G':p.rag_status==='AMBER'?'A':'R'}</span>
     <strong>{commercialName(p.project_code)}</strong>
     <small>{Number(p.completion_percent||0).toFixed(0)}% COMPLETE · {p.rag_status} · {p.critical_blocker_count||0} BLOCKER{Number(p.critical_blocker_count||0)===1?'':'S'}</small>
     <small>{p.domain||'DOMAIN TO VERIFY'}</small>
     <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:8}}>
       {p.preview_url&&<a href={p.preview_url} target="_blank" rel="noreferrer">Current live <ExternalLink size={12}/></a>}
       {p.live_url&&p.live_url!==p.preview_url&&<a href={p.live_url} target="_blank" rel="noreferrer">New domain <ExternalLink size={12}/></a>}
     </div>
   </article>)}</div>
  </section>

  <LiveOpsFloor />

  <section className="workspaceColumns">
   <article className="workspacePanel">
    <header><div><small>INTERNAL CONTROL LAYERS</small><h3>IRIS-led operating system</h3><p>{iris?'IRIS is the sole canonical conductor.':'IRIS status needs verification.'} Specialist agents work inside their bounded roles; they do not become parallel controllers.</p></div></header>
    <div className="workspaceClientList">{controlAgents.map((agent:any)=><div key={agent.code}><ShieldCheck size={17}/><span><b>{agent.display_name}</b><small>{agent.code==='IRIS'?'SOLE CONDUCTOR':agent.code==='VERA-01'?'VERIFICATION':agent.code==='VITA-01'?'INDEPENDENT CHALLENGE':'SPECIALIST LAYER'} · ACTIVE</small></span></div>)}</div>
   </article>

   <article className="workspacePanel">
    <header><div><small>CONTROLLED DOMAIN RESERVE</small><h3>Owned, held and not duplicated</h3><p>Protected domains stay parked until a genuine product/vertical needs them.</p></div></header>
    <div className="workspaceClientList">{heldDomains.map(asset=><div key={asset.asset_key}><Building2 size={17}/><span><b>{asset.canonical_domain||asset.display_name}</b><small>HOLD · {asset.display_name}</small></span></div>)}</div>
   </article>
  </section>

  <section className="workspaceColumns">
   <article className="workspacePanel">
    <header><div><small>CURRENT ESTATE</small><h3>All controlled assets</h3></div><Link href="/projects">View estate <ArrowRight size={14}/></Link></header>
    <div className="workspaceProjectGrid">{currentAssets.filter(a=>a.asset_type!=='domain_asset').map(asset=><Link href={'/projects/'+asset.asset_key} className={'workspaceProject '+accentClass(asset.accent_key)} key={asset.asset_key}><span>{(asset.accent_key||'o').toUpperCase()}</span><strong>{asset.display_name}</strong><small>{asset.estate_disposition.toUpperCase()} · {asset.verification_status.replaceAll('_',' ')}</small></Link>)}</div>
   </article>

   <article className="workspacePanel">
    <header><div><small>CLIENT WORKSPACES</small><h3>Customer and client work</h3></div><Link href="/clients">Open clients <ArrowRight size={14}/></Link></header>
    {clients.length?<div className="workspaceClientList">{clients.slice(0,8).map(org=>{
      const services=servicesForOrganisation(org.id,data.clientRegistry);
      const serviceNames=[services.voice.length?'Voice':null,(services.webCustomers.length||services.webProjects.length)?'Web':null].filter(Boolean);
      const count=services.voice.length+services.webProjects.length;
      return <Link href={'/clients/'+org.id} key={org.id}><Building2 size={17}/><span><b>{organisationName(org)}</b><small>{serviceNames.length?serviceNames.join(' · '):'No service attached yet'} · {count} service/project record{count===1?'':'s'}</small></span><ArrowRight size={14}/></Link>
    })}</div>:<div className="workspaceEmpty"><Users size={22}/><b>No external client organisations recorded yet</b><span>The internal ORVIA organisation is excluded. New clients will appear from the master organisation register.</span></div>}
   </article>
  </section>

  <section className="workspacePanel workspaceAccess">
   <header><div><small>ACCESS MODEL</small><h3>One workspace system, different visibility</h3></div></header>
   <div className="workspaceAccessGrid"><div><b>Founder</b><p>All ORVIA projects, clients, evidence, systems, decisions and IRIS access.</p></div><div><b>Client</b><p>Their organisation, projects, actions, approvals and shared evidence only.</p></div><div><b>Future employee</b><p>The same workspace shell, filtered by role, assignment and authority.</p></div></div>
  </section>
 </div></Shell>
}