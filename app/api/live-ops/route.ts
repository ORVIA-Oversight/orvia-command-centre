import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

export const dynamic='force-dynamic';

const LIVE=['open','assigned','in_progress','processing','running'];
const BLOCKED=['blocked','failed','needs_human','review_required'];
const COMPLETE=['completed','closed','done'];

export async function GET(){
 const supabase=getServerSupabase();
 if(!supabase) return NextResponse.json({source:'unavailable',jobs:[],agents:[],updatedAt:new Date().toISOString()},{status:503});
 const [jobs,agents]=await Promise.all([
   supabase.from('admin_work_queue')
    .select('id,work_type,title,detail,status,priority,assigned_to,approval_required,source_system,source_reference,created_at,updated_at')
    .order('updated_at',{ascending:false}).limit(120),
   supabase.from('admin_agents')
    .select('code,display_name,agent_type,purpose,active,metadata')
    .eq('active',true).order('code',{ascending:true})
 ]);
 const rows=jobs.data??[];
 const keep=rows.filter((j:any)=>{
   const s=String(j.status||'').toLowerCase();
   if(LIVE.includes(s)||BLOCKED.includes(s)) return true;
   if(COMPLETE.includes(s)){
     const t=new Date(j.updated_at||j.created_at||0).getTime();
     return Date.now()-t < 1000*60*60*12;
   }
   return false;
 }).slice(0,60);
 return NextResponse.json({
   source:'live',
   jobs:keep.map((j:any)=>({
     ...j,
     state:LIVE.includes(String(j.status||'').toLowerCase())?'live':BLOCKED.includes(String(j.status||'').toLowerCase())?'blocked':'delivered'
   })),
   agents:agents.data??[],
   updatedAt:new Date().toISOString(),
   errors:[jobs.error?.message,agents.error?.message].filter(Boolean)
 });
}
