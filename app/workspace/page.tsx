import Link from 'next/link';
import { ArrowRight, Building2, CheckCircle2, CircleAlert, Clock3, FolderKanban, ShieldCheck, Users } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Topbar } from '@/components/Topbar';
import { projects } from '@/lib/project-registry';
import { getServerSupabase } from '@/lib/supabase-server';

async function loadWorkspace(){
 const supabase=getServerSupabase();
 if(!supabase) return {source:'review-build',tasks:[],queue:[],clients:[],webProjects:[]};
 const [tasks,queue,clients,webProjects]=await Promise.all([
  supabase.from('admin_tasks').select('id,title,status,priority,owner,due_at,approval_required,updated_at').order('updated_at',{ascending:false}).limit(60),
  supabase.from('admin_work_queue').select('id,title,status,priority,assigned_to,approval_required,source_system,updated_at').order('updated_at',{ascending:false}).limit(60),
  supabase.from('web_customers').select('id,name,business,email,updated_at').order('updated_at',{ascending:false}).limit(50),
  supabase.from('web_projects').select('id,customer_id,project_code,state,domain,preview_url,live_url,version_label,next_action,orvia_action,updated_at').order('updated_at',{ascending:false}).limit(100)
 ]);
 return {source:'live',tasks:tasks.data??[],queue:queue.data??[],clients:clients.data??[],webProjects:webProjects.data??[]};
}

export default async function WorkspacePage(){
 const data=await loadWorkspace();
 const currentProjects=projects.filter(p=>!['PLANNED ONLY'].includes(p.status));
 const approvalItems=[...data.tasks,...data.queue].filter((x:any)=>x.approval_required===true && !['completed','closed'].includes(String(x.status||'').toLowerCase()));
 const inProgress=[...data.tasks,...data.queue].filter((x:any)=>['active','in_progress','processing','running','assigned','open'].includes(String(x.status||'').toLowerCase()));
 const blocked=[...data.tasks,...data.queue].filter((x:any)=>['blocked','failed','needs_human','review_required'].includes(String(x.status||'').toLowerCase()));
 const completed=[...data.tasks,...data.queue].filter((x:any)=>['completed','closed','done'].includes(String(x.status||'').toLowerCase()));
 return <Shell><Topbar title="My Workspace" eyebrow="ORVIA OVERSIGHT LTD · FOUNDER WORKSPACE"/><div className="pageWrap founderWorkspace">
  <section className="workspaceHero">
   <div><div className="eyebrow">TELL ORVIA ONCE</div><h2>Everything you are running, in one place.</h2><p>This is your operating workspace across ORVIA. Open current projects, see client work, review genuine decisions and let IRIS carry the transport work underneath.</p></div>
   <Link href="/" className="workspaceIrisCta">Talk to IRIS <ArrowRight size={16}/></Link>
  </section>
  <section className="workspaceBuckets" aria-label="Founder work status">
   <article className="workspaceBucket needs"><CircleAlert size={19}/><small>NEEDS JOHN</small><strong>{approvalItems.length}</strong><span>Authority or decision required</span></article>
   <article className="workspaceBucket review"><ShieldCheck size={19}/><small>FOR REVIEW</small><strong>{projects.filter(p=>p.status==='REVIEW REQUIRED').length}</strong><span>Prepared work awaiting review</span></article>
   <article className="workspaceBucket progress"><Clock3 size={19}/><small>IN PROGRESS</small><strong>{inProgress.length}</strong><span>Work continuing in the system</span></article>
   <article className="workspaceBucket blocked"><CircleAlert size={19}/><small>BLOCKED</small><strong>{blocked.length}</strong><span>Cannot proceed safely yet</span></article>
   <article className="workspaceBucket complete"><CheckCircle2 size={19}/><small>COMPLETED</small><strong>{completed.length}</strong><span>Verified or recorded complete</span></article>
  </section>
  <section className="workspaceColumns">
   <article className="workspacePanel">
    <header><div><small>ORVIA LANDSCAPE</small><h3>Current projects & ventures</h3></div><Link href="/projects">View all <ArrowRight size={14}/></Link></header>
    <div className="workspaceProjectGrid">{currentProjects.slice(0,12).map(project=><Link href={'/projects/'+project.slug} className={'workspaceProject visual-'+project.visual} key={project.slug}><span>{project.shortName}</span><strong>{project.name}</strong><small>{project.status}</small></Link>)}</div>
   </article>
   <article className="workspacePanel">
    <header><div><small>CLIENT WORKSPACES</small><h3>Customer and client work</h3></div><Link href="/clients">Open clients <ArrowRight size={14}/></Link></header>
    {data.clients.length?<div className="workspaceClientList">{data.clients.slice(0,8).map((client:any)=>{
      const count=data.webProjects.filter((p:any)=>p.customer_id===client.id).length;
      return <Link href={'/clients/'+client.id} key={client.id}><Building2 size={17}/><span><b>{client.business||client.name}</b><small>{count} active/recorded project{count===1?'':'s'}</small></span><ArrowRight size={14}/></Link>
    })}</div>:<div className="workspaceEmpty"><Users size={22}/><b>No verified client records returned</b><span>Client workspaces will appear here from the controlled customer/project records.</span></div>}
   </article>
  </section>
  <section className="workspacePanel workspaceAccess">
   <header><div><small>ACCESS MODEL</small><h3>One workspace system, different visibility</h3></div></header>
   <div className="workspaceAccessGrid"><div><b>Founder</b><p>All ORVIA projects, clients, evidence, systems, decisions and IRIS access.</p></div><div><b>Client</b><p>Their organisation, projects, actions, approvals and shared evidence only.</p></div><div><b>Future employee</b><p>The same workspace shell, filtered by role, assignment and authority — no separate platform.</p></div></div>
  </section>
 </div></Shell>
}