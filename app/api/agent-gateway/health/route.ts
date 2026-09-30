import { NextRequest, NextResponse } from 'next/server';
import { authenticateAgentGateway, gatewayConfigured } from '@/lib/agent-gateway';
import { getServerSupabase } from '@/lib/supabase-server';

export const dynamic='force-dynamic';

export async function GET(req:NextRequest){
  if(!gatewayConfigured()){
    return NextResponse.json({ok:false,status:'NOT_CONFIGURED',reason:'Gateway environment secret has not been activated.'},{status:503});
  }
  const identity=authenticateAgentGateway(req);
  if(!identity)return NextResponse.json({ok:false,status:'UNAUTHORISED'},{status:401});
  const supabase=getServerSupabase();
  if(!supabase)return NextResponse.json({ok:false,status:'DATA_UNAVAILABLE'},{status:503});

  const {data,error}=await supabase.from('admin_agents')
    .select('code,display_name,active,metadata')
    .eq('code',identity.workerCode)
    .maybeSingle();

  if(error||!data||data.active!==true){
    return NextResponse.json({ok:false,status:'WORKER_NOT_ACTIVE'},{status:403});
  }

  return NextResponse.json({
    ok:true,
    status:'READY',
    worker:{code:data.code,name:data.display_name},
    contractVersion:'2026-09-30.v1'
  });
}
