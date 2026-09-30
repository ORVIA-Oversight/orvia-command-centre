import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { deerFlowConfigured, runDeerFlow } from '@/lib/deerflow';

export const dynamic='force-dynamic';

export async function POST(req:NextRequest){
  let body:any;
  try{body=await req.json();}catch{return NextResponse.json({ok:false,error:'Invalid request'},{status:400});}

  const jobId=String(body?.jobId||'').trim();
  if(!jobId)return NextResponse.json({ok:false,error:'jobId is required'},{status:400});

  const supabase=getServerSupabase();
  if(!supabase)return NextResponse.json({ok:false,error:'Command data layer unavailable'},{status:503});

  const {data:job,error}=await supabase.from('admin_brain_jobs')
    .select('id,user_request,status,risk_level,approval_required,approval_status,input_context,permitted_sources,verification_required,selected_agent_code')
    .eq('id',jobId)
    .single();

  if(error||!job)return NextResponse.json({ok:false,error:'Job not found'},{status:404});
  if(job.approval_required&&job.approval_status!=='approved'){
    return NextResponse.json({ok:false,status:'held_for_human',error:'Human approval is required before this job can enter the DeerFlow work floor.'},{status:409});
  }
  if(!deerFlowConfigured()){
    return NextResponse.json({ok:false,status:'not_configured',error:'DeerFlow runtime is not connected yet.'},{status:503});
  }

  const result=await runDeerFlow({
    taskId:job.id,
    objective:job.user_request,
    context:{...job.input_context,orvia_agent:job.selected_agent_code||'IRIS'},
    allowedSources:job.permitted_sources||[],
    verificationRequired:job.verification_required!==false
  });

  await supabase.from('admin_brain_job_events').insert({
    job_id:job.id,
    event_type:result.ok?'deerflow_dispatched':'deerflow_failed',
    tool_code:'DEERFLOW',
    agent_code:job.selected_agent_code||'IRIS',
    summary:result.ok?'Job entered DeerFlow work floor':'DeerFlow dispatch failed',
    payload:{run_id:result.runId||null,status:result.status,error:result.error||null}
  });

  if(result.ok){
    await supabase.from('admin_brain_jobs').update({
      status:'running',
      external_ref:result.runId||job.id,
      last_heartbeat_at:new Date().toISOString()
    }).eq('id',job.id);
  }

  return NextResponse.json(result,{status:result.ok?200:502});
}
