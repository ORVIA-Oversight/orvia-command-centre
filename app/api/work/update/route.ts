import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

export const dynamic='force-dynamic';

const allowedKinds=['task','work'] as const;
const allowedActions=['approve','hold','complete','reopen'] as const;

export async function PATCH(req:NextRequest){
  const supabase=getServerSupabase();
  if(!supabase) return NextResponse.json({ok:false,error:'Live data unavailable'},{status:503});

  let body:any;
  try{body=await req.json();}catch{return NextResponse.json({ok:false,error:'Invalid request'},{status:400});}

  const kind=String(body?.kind||'');
  const id=String(body?.id||'');
  const action=String(body?.action||'');
  if(!allowedKinds.includes(kind as any)||!allowedActions.includes(action as any)||!id){
    return NextResponse.json({ok:false,error:'Unsupported work update'},{status:400});
  }

  const table=kind==='task'?'admin_tasks':'admin_work_queue';
  let patch:Record<string,unknown>={updated_at:new Date().toISOString()};
  if(action==='approve') patch={...patch,approval_required:false,status:'open'};
  if(action==='hold') patch={...patch,status:'blocked'};
  if(action==='complete') patch={...patch,status:'completed',approval_required:false};
  if(action==='reopen') patch={...patch,status:'open'};

  const {data,error}=await supabase.from(table).update(patch).eq('id',id).select('id,title,status,approval_required').maybeSingle();
  if(error||!data) return NextResponse.json({ok:false,error:error?.message||'Work item not found'},{status:500});

  let verificationId:string|undefined;

  if(action==='complete'){
    const check=await supabase.from('admin_verification_checks').upsert({
      entity_type:kind,
      entity_key:id,
      title:`Verify: ${data.title}`,
      verification_stage:'implemented',
      status:'open',
      authority_level:'A3',
      verification_question:'Is the recorded completion actually implemented as intended, and what evidence proves it?',
      next_recheck_at:new Date().toISOString(),
      notes:'Created automatically when Command work was marked completed.',
      updated_at:new Date().toISOString()
    },{onConflict:'entity_type,entity_key'}).select('id').single();

    if(check.error||!check.data){
      await supabase.from(table).update({status:'open',updated_at:new Date().toISOString()}).eq('id',id);
      return NextResponse.json({ok:false,error:'Completion was rolled back because the VERA verification record could not be created.'},{status:500});
    }
    verificationId=check.data.id;
  }

  if(action==='reopen'){
    await supabase.from('admin_verification_checks')
      .update({status:'failed',notes:'Source work was reopened after completion.',updated_at:new Date().toISOString()})
      .eq('entity_type',kind)
      .eq('entity_key',id);
  }

  return NextResponse.json({ok:true,item:data,verificationId});
}
