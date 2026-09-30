import { NextRequest, NextResponse } from 'next/server';
import { authenticateAgentGateway, publicJob } from '@/lib/agent-gateway';
import { getServerSupabase } from '@/lib/supabase-server';

export const dynamic='force-dynamic';

export async function GET(req:NextRequest,{params}:{params:{id:string}}){
  const identity=authenticateAgentGateway(req);
  if(!identity)return NextResponse.json({ok:false,error:'Unauthorised'},{status:401});
  const supabase=getServerSupabase();
  if(!supabase)return NextResponse.json({ok:false,error:'Live work state unavailable'},{status:503});

  const {data,error}=await supabase.from('admin_brain_jobs')
    .select('id,user_request,interpreted_intent,selected_agent_code,status,risk_level,approval_required,approval_status,input_context,requested_outputs,permitted_sources,verification_required,due_at,created_at,started_at,heartbeat_at,result_summary,completion_evidence')
    .eq('id',params.id)
    .eq('selected_agent_code',identity.workerCode)
    .maybeSingle();

  if(error)return NextResponse.json({ok:false,error:error.message},{status:500});
  if(!data)return NextResponse.json({ok:false,error:'Task not found'},{status:404});
  return NextResponse.json({ok:true,task:publicJob(data)});
}
