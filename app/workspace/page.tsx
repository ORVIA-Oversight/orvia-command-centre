import Link from 'next/link';
import { ArrowRight, Building2, CheckCircle2, CircleAlert, Clock3, ShieldCheck, Users } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Topbar } from '@/components/Topbar';
import { loadOrviaAssets, isCurrentAsset, isLegacyAsset } from '@/lib/asset-registry';
import { getServerSupabase } from '@/lib/supabase-server';
import { isInternalOrviaOrganisation, loadClientRegistry, organisationName, servicesForOrganisation } from '@/lib/client-registry';

export const dynamic='force-dynamic';
export const revalidate=0;

async function loadWorkspace(){
 const supabase=getServerSupabase();
 const [assetState,clientRegistry]=await Promise.all([loadOrviaAssets(),loadClientRegistry()]);
 if(!supabase) return {source:'review-build',tasks:[],queue:[],assets:assetState.assets,assetSource:assetState.source,clientRegistry};
 const [tasks,queue]=await Promise.all([
  supabase.from('admin_tasks').select('id,title,status,priority,owner,due_at,approval_required,updated_at').order('updated_at',{ascending:false}).limit(60),
  supabase.from('admin_work_queue').select('id,title,status,priority,assigned_to,approval_required,source_system,updated_at').order('updated_at',{ascending:false}).limit(60)
 ]);
 return {source:'live',tasks:tasks.data??[],queue:queue.data??[],assets:assetState.assets,assetSource:assetState.source,clientRegistry};
}

function accentClass(key:string|null){
 return key==='r'?'visual-teal':key==='v'?'visual-gold':key==='i'?'visual-purple':key==='a'?'visual-orange':'visual-navy';
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

 return <Shell><Topbar title="My Workspace" eyebrow="ORVIA OVERSIGHT LTD · FOUNDER WORKSPACE"/><div className="pageWrap founderWorkspace">
  <section className="workspaceHero">
   <div><div className="eyebrow">TELL ORVIA ONCE</div><h2>Everything you are running, in one place.</h2><p>Live ORVIA estate, work, clients and decisions from the controlled backend. No separate static project list.</p></div>
   <Link href="/" className="workspaceIrisCta">Talk to IRIS <ArrowRight size={16}/></Link>
  </section>

  <section className="workspaceBuckets" aria-label="Founder work status">
   <article className="workspaceBucket needs"><CircleAlert size={19}/><small>NEEDS JOHN</small><strong>{approvalItems.length}</strong><span>Authority or decision required</span></article>
   <article className="workspaceBucket review"><ShieldCheck size={19}/><small>FOR REVIEW</small><strong>{reviewCount}</strong><span>Estate or work requiring reconciliation</span></article>
   <article className="workspaceBucket progress"><Clock3 size={19}/><small>IN PROGRESS</small><strong>{inProgress.length}</strong><span>Work continuing in the system</span></article>
   <article className="workspaceBucket blocked"><CircleAlert size={19}/><small>BLOCKED</small><strong>{blocked.length}</strong><span>Cannot proceed safely yet</span></article>
   <article className="workspaceBucket complete"><CheckCircle2 size={19}/><small>COMPLETED</small><strong>{completed.length}</strong><span>Recorded complete</span></article>
  </section>

  <section className="workspaceColumns">
   <article className="workspacePanel">
    <header><div><small>LIVE ORVIA LANDSCAPE</small><h3>Current estate</h3></div><Link href="/projects">View estate <ArrowRight size={14}/></Link></header>
    <div className="workspaceProjectGrid">{currentAssets.map(asset=><Link href={'/projects/'+asset.asset_key} className={'workspaceProject '+accentClass(asset.accent_key)} key={asset.asset_key}><span>{(asset.accent_key||'o').toUpperCase()}</span><strong>{asset.display_name}</strong><small>{asset.estate_disposition.toUpperCase()} · {asset.verification_status.replaceAll('_',' ')}</small></Link>)}</div>
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