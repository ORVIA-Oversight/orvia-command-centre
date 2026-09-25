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

  const {data,error}=await supabase.from(table).update(patch).eq('id',id).select('id,status,approval_required').maybeSingle();
  if(error||!data) return NextResponse.json({ok:false,error:error?.message||'Work item not found'},{status:500});

  return NextResponse.json({ok:true,item:data});
}
