import { NextRequest, NextResponse } from 'next/server';
import { authenticateAgentGateway } from '@/lib/agent-gateway';
import { getServerSupabase } from '@/lib/supabase-server';

export const dynamic='force-dynamic';

type ResultBody={
  outcome?:'complete'|'verification_required'|'blocked'|'failed';
  summary?:string;
  completionEvidence?:unknown[];
  artifacts?:unknown[];
  uncertainties?:unknown[];
  nextAction?:string;
  externalRef?:string;
};

function clean(v:unknown,max=8000){
  return String(v??'').trim().slice(0,max);
}

export async function POST(req:NextRequest,{params}:{params:{id:string}}){
  const identity=authenticateAgentGateway(req);
  if(!identity)return NextResponse.json({ok:false,error:'Unauthorised'},{status:401});
  const supabase=getServerSupabase();
  if(!supabase)return NextResponse.json({ok:false,error:'Live work state unavailable'},{status:503});

  let body:ResultBody;
  try{body=await req.json();}catch{return NextResponse.json({ok:false,error:'Invalid JSON body'},{status:400});}

  const outcome=body.outcome;
  if(!outcome||!['complete','verification_required','blocked','failed'].includes(outcome)){
    return NextResponse.json({ok:false,error:'Unsupported outcome'},{status:400});
  }

  const {data:job,error:readError}=await supabase.from('admin_brain_jobs')
    .select('id,status,selected_agent_code,verification_required')
    .eq('id',params.id)
    .eq('selected_agent_code',identity.workerCode)
    .maybeSingle();

  if(readError)return NextResponse.json({ok:false,error:readError.message},{status:500});
  if(!job)return NextResponse.json({ok:false,error:'Task not found'},{status:404});
  if(!['running','queued','blocked'].includes(job.status)){
    return NextResponse.json({ok:false,error:`Task cannot accept a result from state ${job.status}`},{status:409});
  }

  const now=new Date().toISOString();
  const shouldVerify=outcome==='verification_required'||(outcome==='complete'&&job.verification_required===true);
  const finalStatus=shouldVerify?'verification_required':outcome;
  const completionEvidence=Array.isArray(body.completionEvidence)?body.completionEvidence:[];
  const artifacts=Array.isArray(body.artifacts)?body.artifacts:[];
  const uncertainties=Array.isArray(body.uncertainties)?body.uncertainties:[];
  const summary=clean(body.summary,12000);
  const nextAction=clean(body.nextAction,2000);

  const patch:any={
    status:finalStatus,
    result_summary:summary||null,
    completion_evidence:completionEvidence,
    external_ref:clean(body.externalRef,1000)||null,
    heartbeat_at:now
  };
  if(['complete','verification_required','failed'].includes(finalStatus))patch.completed_at=now;
  if(finalStatus==='blocked')patch.error_detail=nextAction||'External worker reported a blocker.';
  if(finalStatus==='failed')patch.error_detail=summary||nextAction||'External worker reported failure.';

  const {data,error}=await supabase.from('admin_brain_jobs')
    .update(patch)
    .eq('id',params.id)
    .eq('selected_agent_code',identity.workerCode)
    .select('id,status,result_summary,completed_at,verification_required')
    .single();

  if(error)return NextResponse.json({ok:false,error:error.message},{status:500});

  await supabase.from('admin_brain_job_events').insert({
    job_id:params.id,
    event_type:'external_result',
    agent_code:identity.workerCode,
    summary:summary||`External worker returned ${finalStatus}.`,
    payload:{outcome:finalStatus,artifacts,uncertainties,nextAction,completionEvidence}
  });

  if(shouldVerify){
    await supabase.from('admin_verification_checks').insert({
      entity_type:'brain_job',
      entity_key:params.id,
      title:`Verify external-worker result: ${params.id}`,
      verification_stage:'implemented',
      status:'open',
      authority_level:'A3',
      verification_question:'Does the submitted result match the assigned task, permitted evidence and claimed completion status?',
      evidence_reference:JSON.stringify({worker:identity.workerCode,artifacts,completionEvidence}),
      notes:nextAction||null
    });
  }

  return NextResponse.json({ok:true,task:data,verificationQueued:shouldVerify});
}
