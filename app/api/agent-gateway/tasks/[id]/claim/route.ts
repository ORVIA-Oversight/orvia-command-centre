import { NextRequest, NextResponse } from 'next/server';
import { authenticateAgentGateway } from '@/lib/agent-gateway';
import { getServerSupabase } from '@/lib/supabase-server';

export const dynamic='force-dynamic';

export async function POST(req:NextRequest,{params}:{params:{id:string}}){
  const identity=authenticateAgentGateway(req);
  if(!identity)return NextResponse.json({ok:false,error:'Unauthorised'},{status:401});
  const supabase=getServerSupabase();
  if(!supabase)return NextResponse.json({ok:false,error:'Live work state unavailable'},{status:503});

  const {data:current,error:readError}=await supabase.from('admin_brain_jobs')
    .select('id,status,approval_required,approval_status,attempt_count')
    .eq('id',params.id)
    .eq('selected_agent_code',identity.workerCode)
    .maybeSingle();

  if(readError)return NextResponse.json({ok:false,error:readError.message},{status:500});
  if(!current)return NextResponse.json({ok:false,error:'Task not found'},{status:404});
  if(current.approval_required&&current.approval_status!=='approved'){
    return NextResponse.json({ok:false,error:'Human approval is required before this task can be claimed.'},{status:409});
  }
  if(!['queued','running'].includes(current.status)){
    return NextResponse.json({ok:false,error:`Task cannot be claimed from state ${current.status}`},{status:409});
  }

  const now=new Date().toISOString();
  const patch:any={
    status:'running',
    worker_id:identity.workerCode,
    heartbeat_at:now,
    attempt_count:Number(current.attempt_count||0)+1
  };
  if(current.status==='queued')patch.started_at=now;

  const {data,error}=await supabase.from('admin_brain_jobs')
    .update(patch)
    .eq('id',params.id)
    .eq('selected_agent_code',identity.workerCode)
    .select('id,status,started_at,heartbeat_at,attempt_count')
    .single();

  if(error)return NextResponse.json({ok:false,error:error.message},{status:500});

  await supabase.from('admin_brain_job_events').insert({
    job_id:params.id,
    event_type:'claimed',
    agent_code:identity.workerCode,
    summary:'External worker claimed controlled task.',
    payload:{worker:identity.workerCode}
  });

  return NextResponse.json({ok:true,task:data});
}
