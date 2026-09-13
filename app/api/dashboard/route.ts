import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
export async function GET(){
 const supabase=getServerSupabase();
 if(!supabase) return NextResponse.json({source:'review-build',openTasks:8,approvals:7,warning:'Live Supabase environment variables not configured.'});
 const [tasks,approvals,integrations]=await Promise.all([
  supabase.from('admin_tasks').select('*',{count:'exact',head:true}).neq('status','completed'),
  supabase.from('admin_tasks').select('*',{count:'exact',head:true}).neq('status','completed').eq('approval_required',true),
  supabase.from('admin_integrations').select('code,name,category,status,updated_at').order('updated_at',{ascending:false}).limit(30)
 ]);
 return NextResponse.json({source:'live',openTasks:tasks.count??0,approvals:approvals.count??0,integrations:integrations.data??[],errors:[tasks.error?.message,approvals.error?.message,integrations.error?.message].filter(Boolean)});
}
