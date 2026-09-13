import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

export async function GET(){
 const supabase=getServerSupabase();
 if(!supabase) return NextResponse.json({source:'review-build',openTasks:8,approvals:7,warning:'Live Supabase environment variables not configured.',outbound:{source:'unavailable',campaigns:[]}});

 const [tasks,approvals,integrations,campaigns,leads,attempts,calls,numbers]=await Promise.all([
  supabase.from('admin_tasks').select('*',{count:'exact',head:true}).neq('status','completed'),
  supabase.from('admin_tasks').select('*',{count:'exact',head:true}).neq('status','completed').eq('approval_required',true),
  supabase.from('admin_integrations').select('code,name,category,status,updated_at').order('updated_at',{ascending:false}).limit(30),
  supabase.from('voice_outbound_campaigns').select('id,name,offer_code,status,target_sector,daily_call_cap,timezone,calling_window,prompt_version,objective,updated_at').order('updated_at',{ascending:false}).limit(12),
  supabase.from('voice_outbound_leads').select('id,campaign_id,status,eligible_to_call,disposition,qualification_score,booking_id,updated_at').limit(500),
  supabase.from('voice_outbound_attempts').select('id,campaign_id,status,disposition,handoff_required,booking_id,started_at,ended_at,updated_at').order('updated_at',{ascending:false}).limit(500),
  supabase.from('voice_calls').select('id,status,outcome,duration_seconds,human_handoff_required,started_at,ended_at,updated_at').eq('direction','outbound').order('updated_at',{ascending:false}).limit(100),
  supabase.from('voice_numbers').select('display_number,e164_number,provider,purpose,status,is_primary,updated_at').order('is_primary',{ascending:false}).limit(5)
 ]);

 const leadRows=leads.data??[];
 const attemptRows=attempts.data??[];
 const campaignRows=(campaigns.data??[]).map((campaign:any)=>{
  const cLeads=leadRows.filter((lead:any)=>lead.campaign_id===campaign.id);
  const cAttempts=attemptRows.filter((attempt:any)=>attempt.campaign_id===campaign.id);
  const answered=cAttempts.filter((attempt:any)=>Boolean(attempt.started_at) && !['queued','scheduled','created'].includes(String(attempt.status||'').toLowerCase())).length;
  const bookings=cAttempts.filter((attempt:any)=>Boolean(attempt.booking_id)).length || cLeads.filter((lead:any)=>Boolean(lead.booking_id)).length;
  const handoffs=cAttempts.filter((attempt:any)=>attempt.handoff_required===true).length;
  const eligible=cLeads.filter((lead:any)=>lead.eligible_to_call===true).length;
  const lastActivity=[campaign.updated_at,...cAttempts.map((a:any)=>a.updated_at),...cLeads.map((l:any)=>l.updated_at)].filter(Boolean).sort().at(-1)??null;
  return {...campaign,metrics:{leads:cLeads.length,eligible,attempts:cAttempts.length,answered,bookings,handoffs,lastActivity}};
 });

 return NextResponse.json({
  source:'live',
  openTasks:tasks.count??0,
  approvals:approvals.count??0,
  integrations:integrations.data??[],
  outbound:{
   source:'live',
   primaryNumber:(numbers.data??[]).find((number:any)=>number.is_primary)??numbers.data?.[0]??null,
   campaigns:campaignRows,
   recentCalls:calls.data??[]
  },
  errors:[tasks.error?.message,approvals.error?.message,integrations.error?.message,campaigns.error?.message,leads.error?.message,attempts.error?.message,calls.error?.message,numbers.error?.message].filter(Boolean)
 });
}
