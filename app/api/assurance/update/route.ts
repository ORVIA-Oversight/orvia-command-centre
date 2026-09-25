import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

export const dynamic='force-dynamic';

function addDays(from:Date,days:number){
  const d=new Date(from);
  d.setUTCDate(d.getUTCDate()+days);
  return d.toISOString();
}

export async function PATCH(req:NextRequest){
  const supabase=getServerSupabase();
  if(!supabase) return NextResponse.json({ok:false,error:'Live data unavailable'},{status:503});

  let body:any;
  try{body=await req.json();}catch{return NextResponse.json({ok:false,error:'Invalid request'},{status:400});}

  const id=String(body?.id||'');
  const action=String(body?.action||'');
  const evidence=String(body?.evidence_reference||'').trim();
  const note=String(body?.note||'').trim();
  const actor=req.headers.get('x-orvia-user')||'Authenticated Command user';

  if(!id||!['advance','fail'].includes(action)){
    return NextResponse.json({ok:false,error:'Unsupported verification update'},{status:400});
  }

  const found=await supabase.from('admin_verification_checks')
    .select('id,entity_type,entity_key,title,verification_stage,status,next_recheck_at,history')
    .eq('id',id).maybeSingle();

  if(found.error||!found.data) return NextResponse.json({ok:false,error:'Verification check not found'},{status:404});
  const check:any=found.data;
  const now=new Date();

  if(action==='advance'){
    if(!evidence) return NextResponse.json({ok:false,error:'Evidence or a verification reference is required.'},{status:400});
    if(check.status==='failed'||check.status==='closed') return NextResponse.json({ok:false,error:'This verification check is not open.'},{status:409});

    if(check.verification_stage!=='implemented'&&check.next_recheck_at&&new Date(check.next_recheck_at).getTime()>now.getTime()){
      return NextResponse.json({ok:false,error:`The next VERA recheck is not due until ${new Date(check.next_recheck_at).toLocaleDateString('en-GB')}.`},{status:409});
    }

    const transitions:Record<string,{stage:string;days:number|null;status:string}>={
      implemented:{stage:'verified',days:30,status:'open'},
      verified:{stage:'effective',days:90,status:'open'},
      effective:{stage:'sustained',days:180,status:'open'},
      sustained:{stage:'sustained',days:null,status:'passed'}
    };
    const next=transitions[check.verification_stage];
    if(!next) return NextResponse.json({ok:false,error:'Unknown verification stage'},{status:400});

    const history=Array.isArray(check.history)?check.history:[];
    history.push({
      at:now.toISOString(),
      actor,
      action:'advance',
      from:check.verification_stage,
      to:next.stage,
      evidence_reference:evidence,
      note:note||null
    });

    const update=await supabase.from('admin_verification_checks').update({
      verification_stage:next.stage,
      status:next.status,
      evidence_reference:evidence,
      verified_by:actor,
      verified_at:now.toISOString(),
      next_recheck_at:next.days===null?null:addDays(now,next.days),
      notes:note||check.notes||null,
      history,
      updated_at:now.toISOString()
    }).eq('id',id).select('id,verification_stage,status,next_recheck_at').single();

    if(update.error) return NextResponse.json({ok:false,error:update.error.message},{status:500});
    return NextResponse.json({ok:true,check:update.data});
  }

  if(!note) return NextResponse.json({ok:false,error:'Record why verification failed.'},{status:400});
  const history=Array.isArray(check.history)?check.history:[];
  history.push({
    at:now.toISOString(),
    actor,
    action:'fail',
    stage:check.verification_stage,
    evidence_reference:evidence||null,
    note
  });

  const update=await supabase.from('admin_verification_checks').update({
    status:'failed',
    evidence_reference:evidence||check.evidence_reference||null,
    verified_by:actor,
    verified_at:now.toISOString(),
    next_recheck_at:null,
    notes:note,
    history,
    updated_at:now.toISOString()
  }).eq('id',id);

  if(update.error) return NextResponse.json({ok:false,error:update.error.message},{status:500});

  const followUp=await supabase.from('admin_work_queue').insert({
    work_type:'vera_follow_up',
    title:`VERA failure — ${check.title}`,
    detail:`[VERA] Verification failed at ${check.verification_stage}. Reason: ${note}${evidence?` Evidence/reference: ${evidence}`:''}`,
    status:'review_required',
    priority:'high',
    assigned_to:'IRIS',
    approval_required:true,
    source_system:'VERA',
    source_reference:`${check.entity_type}:${check.entity_key}`
  }).select('id').single();

  if(followUp.error) return NextResponse.json({ok:false,error:'Verification was marked failed, but the follow-up work item could not be created.'},{status:500});

  return NextResponse.json({ok:true,followUpId:followUp.data.id});
}
