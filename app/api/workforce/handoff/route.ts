import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

export const dynamic='force-dynamic';

function clean(value:unknown){
  return String(value??'').replace(/[\r\n]+/g,' ').replace(/\s+/g,' ').trim();
}

export async function POST(req:NextRequest){
  let body:any;
  try{body=await req.json();}
  catch{return NextResponse.json({ok:false,error:'Invalid request'},{status:400});}

  const sourceRef=clean(body?.sourceRef).toUpperCase();
  const targetRef=clean(body?.targetRef).toUpperCase();
  const title=clean(body?.title);
  const detail=clean(body?.detail);
  const approvalRequired=Boolean(body?.approvalRequired);

  if(!sourceRef||!targetRef||!title){
    return NextResponse.json({ok:false,error:'sourceRef, targetRef and title are required'},{status:400});
  }

  const supabase=getServerSupabase();
  if(!supabase)return NextResponse.json({ok:false,error:'Command data layer unavailable'},{status:503});

  const agents=await supabase.from('admin_agents').select('code,display_name,active').in('code',[sourceRef,targetRef]);
  const found=new Set((agents.data??[]).filter((x:any)=>x.active).map((x:any)=>x.code));
  if(!found.has(sourceRef)||!found.has(targetRef)){
    return NextResponse.json({ok:false,error:'Both source and target must be active registered agents'},{status:400});
  }

  const insert=await supabase.from('admin_handoffs').insert({
    source_kind:'agent',
    source_ref:sourceRef,
    target_kind:'agent',
    target_ref:targetRef,
    title,
    detail,
    status:approvalRequired?'review_required':'open',
    approval_required:approvalRequired,
    approval_status:approvalRequired?'pending':'not_required'
  }).select('id,status,source_ref,target_ref,title,created_at').single();

  if(insert.error||!insert.data){
    return NextResponse.json({ok:false,error:'Could not create controlled agent handoff'},{status:500});
  }

  return NextResponse.json({
    ok:true,
    handoff:insert.data,
    message:`${sourceRef} handed the work to ${targetRef}. IRIS retains visibility of the chain.`
  });
}
