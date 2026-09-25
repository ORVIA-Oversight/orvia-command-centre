import { CheckCircle2, CircleAlert, Clock3, ShieldCheck } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Topbar } from '@/components/Topbar';
import { getServerSupabase } from '@/lib/supabase-server';
import { WorkItemActions } from '@/components/WorkItemActions';

export const dynamic='force-dynamic';
export const revalidate=0;

type WorkRow={id:string;title:string;status:string;priority:string|null;approval_required:boolean|null;owner?:string|null;assigned_to?:string|null;source_system?:string|null;source_reference?:string|null;updated_at?:string|null;created_at?:string|null;kind:'task'|'work'};

async function loadWork(){
 const supabase=getServerSupabase();
 if(!supabase)return {source:'unavailable',rows:[] as WorkRow[]};
 const [tasks,queue]=await Promise.all([
  supabase.from('admin_tasks').select('id,title,status,priority,owner,approval_required,updated_at').order('updated_at',{ascending:false}).limit(150),
  supabase.from('admin_work_queue').select('id,title,status,priority,assigned_to,approval_required,source_system,source_reference,created_at,updated_at').order('created_at',{ascending:false}).limit(150)
 ]);
 const rows:WorkRow[]=[
  ...(tasks.data??[]).map((x:any)=>({...x,kind:'task' as const})),
  ...(queue.data??[]).map((x:any)=>({...x,kind:'work' as const}))
 ].sort((a,b)=>String(b.updated_at||b.created_at||'').localeCompare(String(a.updated_at||a.created_at||'')));
 return {source:'live',rows};
}

function done(status:string){return ['completed','closed','done','cancelled'].includes(status.toLowerCase());}
function blocked(status:string){return ['blocked','failed','error','needs_human','review_required'].includes(status.toLowerCase());}
function active(status:string){return !done(status)&&!blocked(status);}

export default async function WorkPage(){
 const data=await loadWork();
 const approvals=data.rows.filter(x=>!done(x.status)&&x.approval_required===true);
 const review=data.rows.filter(x=>blocked(x.status)&&x.approval_required!==true);
 const progress=data.rows.filter(x=>active(x.status)&&x.approval_required!==true);
 const complete=data.rows.filter(x=>done(x.status));

 const columns=[
  {key:'needs',title:'NEEDS JOHN',icon:CircleAlert,rows:approvals},
  {key:'review',title:'FOR REVIEW / BLOCKED',icon:ShieldCheck,rows:review},
  {key:'progress',title:'IN PROGRESS',icon:Clock3,rows:progress},
  {key:'complete',title:'COMPLETED',icon:CheckCircle2,rows:complete}
 ];

 return <Shell><Topbar title="Work" eyebrow="ORVIA · LIVE WORK STATE"/><div className="pageWrap">
  <section className="pageIntro"><div className="eyebrow">ONE QUEUE</div><h2>Work moves through ORVIA once.</h2><p>Tasks and IRIS-routed work are shown together. Read-only questions do not create work items. Consequential actions remain visible until a human authority decision is recorded.</p></section>
  <section className="workBoard">
   {columns.map(({key,title,icon:Icon,rows})=><article className={'workColumn '+key} key={key}>
    <header><div><Icon size={17}/><b>{title}</b></div><span>{rows.length}</span></header>
    <div className="workCards">
     {rows.slice(0,30).map(row=><div className="workCard" key={row.kind+'-'+row.id}>
      <small>{row.kind==='task'?'TASK':'IRIS WORK'} · {(row.priority||'normal').toUpperCase()}</small>
      <strong>{row.title}</strong>
      <p>{row.source_reference||row.source_system||row.owner||row.assigned_to||'ORVIA'}</p>
      <footer><span>{String(row.status).replaceAll('_',' ')}</span>{row.approval_required&&<em>Approval required</em>}</footer>
      <WorkItemActions id={row.id} kind={row.kind} status={row.status} approvalRequired={row.approval_required===true}/>
     </div>)}
     {!rows.length&&<div className="workEmpty">Nothing here.</div>}
    </div>
   </article>)}
  </section>
 </div></Shell>
}
