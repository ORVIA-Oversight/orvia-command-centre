import { NextRequest, NextResponse } from 'next/server';
import { authenticateAgentGateway } from '@/lib/agent-gateway';
import { getServerSupabase } from '@/lib/supabase-server';

export const dynamic='force-dynamic';

export async function POST(req:NextRequest,{params}:{params:{id:string}}){
  const identity=authenticateAgentGateway(req);
  if(!identity)return NextResponse.json({ok:false,error:'Unauthorised'},{status:401});
  const supabase=getServerSupabase();
  if(!supabase)return NextResponse.json({ok:false,error:'Live work state unavailable'},{status:503});

  const now=new Date().toISOString();
  const {data,error}=await supabase.from('admin_brain_jobs')
    .update({heartbeat_at:now,worker_id:identity.workerCode})
    .eq('id',params.id)
    .eq('selected_agent_code',identity.workerCode)
    .eq('status','running')
    .select('id,status,heartbeat_at')
    .maybeSingle();

  if(error)return NextResponse.json({ok:false,error:error.message},{status:500});
  if(!data)return NextResponse.json({ok:false,error:'Running task not found'},{status:404});
  return NextResponse.json({ok:true,task:data});
}
