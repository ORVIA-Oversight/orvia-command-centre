import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

export const dynamic='force-dynamic';

export async function GET(){
 const supabase=getServerSupabase();
 if(!supabase) return NextResponse.json({
   source:'unavailable',
   openWork:null,
   approvals:null,
   estate:null,
   estateReview:null,
   systemIssues:null,
   clients:null,
   recentWork:[],
   warning:'Live Supabase environment variables are not configured.'
 });

 const [tasks,queue,assets,integrations,clients]=await Promise.all([
  supabase.from('admin_tasks').select('id,title,status,priority,approval_required,updated_at').order('updated_at',{ascending:false}).limit(100),
  supabase.from('admin_work_queue').select('id,title,status,priority,approval_required,assigned_to,source_system,source_reference,created_at,updated_at').order('created_at',{ascending:false}).limit(100),
  supabase.from('orvia_asset_registry').select('asset_key,display_name,estate_disposition,verification_status,canonical_domain,updated_at').order('display_name',{ascending:true}),
  supabase.from('admin_integrations').select('code,name,category,status,updated_at').order('updated_at',{ascending:false}).limit(100),
  supabase.from('admin_organisations').select('id,metadata').limit(500)
 ]);

 const taskRows=tasks.data??[];
 const queueRows=queue.data??[];
 const assetRows=assets.data??[];
 const integrationRows=integrations.data??[];
 const clientRows=clients.data??[];
 const clientCount=clientRows.filter((x:any)=>!(x.metadata&&x.metadata.internal_orvia===true)).length;

 const active=(x:any)=>!['completed','closed','done','cancelled'].includes(String(x.status||'').toLowerCase());
 const activeTasks=taskRows.filter(active);
 const activeQueue=queueRows.filter(active);
 const approvals=[...activeTasks,...activeQueue].filter((x:any)=>x.approval_required===true);
 const currentAssets=assetRows.filter((x:any)=>['keep','rename','temporary','hold'].includes(String(x.estate_disposition||'').toLowerCase()));
 const estateReview=currentAssets.filter((x:any)=>String(x.estate_disposition||'').toLowerCase()!=='keep'||!/verified/i.test(String(x.verification_status||'')));
 const systemIssues=integrationRows.filter((x:any)=>!['connected','configured','ready','live verified','verified'].includes(String(x.status||'').toLowerCase()));

 return NextResponse.json({
   source:'live',
   openWork:activeTasks.length+activeQueue.length,
   approvals:approvals.length,
   estate:currentAssets.length,
   estateReview:estateReview.length,
   systemIssues:systemIssues.length,
   clients:clientCount,
   recentWork:activeQueue.slice(0,6).map((x:any)=>({
     id:x.id,title:x.title,status:x.status,priority:x.priority,approval_required:x.approval_required,
     source_reference:x.source_reference,created_at:x.created_at
   })),
   errors:[tasks.error?.message,queue.error?.message,assets.error?.message,integrations.error?.message,clients.error?.message].filter(Boolean)
 });
}
