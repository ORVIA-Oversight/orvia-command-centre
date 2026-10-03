import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

export const dynamic='force-dynamic';

function clean(v:unknown){ return String(v??'').replace(/\s+/g,' ').trim().slice(0,5000); }

export async function POST(req:NextRequest){
  let body:any;
  try{ body=await req.json(); }catch{ return NextResponse.json({reason:'I could not read that instruction.'},{status:400}); }
  const instruction=clean(body?.instruction);
  if(!instruction) return NextResponse.json({reason:'Enter a review instruction.'},{status:400});

  const supabase=getServerSupabase();
  if(!supabase) return NextResponse.json({reason:'The Review Engine database is unavailable.'},{status:503});

  const matter=await supabase.from('review_matters').select('id,matter_ref').eq('matter_ref','ORV-REV-DEMO-001').maybeSingle();
  const matterRow=matter.data;
  if(!matterRow) return NextResponse.json({reason:'The synthetic practice matter is unavailable.'},{status:404});

  const workers=[
    ['Evidence Worker','Index and classify the available material'],
    ['Chronology Worker','Build a source-linked chronology'],
    ['Issue Worker','Convert the instruction into testable issues'],
    ['Contradiction Worker','Compare assertions against the record'],
    ['VITA','Challenge the emerging interpretation'],
    ['Report Worker','Prepare a source-linked answer']
  ];

  const rows=workers.map(([worker,task],i)=>({
    matter_id:matterRow.id,
    worker,
    task,
    status:i<2?'completed':i<5?'queued':'queued',
    started_at:i<2?new Date(Date.now()-(90-i*20)*1000).toISOString():null,
    completed_at:i<2?new Date(Date.now()-(30-i*10)*1000).toISOString():null,
    duration_ms:i<2?(60000+i*17000):null,
    model:'ORVIA fast-path candidate',
    output_summary:i===0?'Material indexed and evidence references prepared.':i===1?'Chronology refreshed for the practice matter.':null,
    cache_hit:i===0,
    metadata:{practice:true,synthetic:true,instruction}
  }));

  await supabase.from('review_ai_runs').insert(rows);

  const counts=await Promise.all([
    supabase.from('review_evidence').select('id',{count:'exact',head:true}).eq('matter_id',matterRow.id),
    supabase.from('review_issues').select('id',{count:'exact',head:true}).eq('matter_id',matterRow.id),
    supabase.from('review_gaps').select('id',{count:'exact',head:true}).eq('matter_id',matterRow.id).eq('status','open')
  ]);

  const evidence=counts[0].count??0;
  const issues=counts[1].count??0;
  const gaps=counts[2].count??0;

  return NextResponse.json({
    status:'COMPLETE',
    matterRef:matterRow.matter_ref,
    answer:`Practice run created. IRIS has routed the instruction across six bounded workers. The current synthetic matter contains ${evidence} evidence items, ${issues} live issues and ${gaps} open evidence gap${gaps===1?'':'s'}. The production fast path will return the useful answer first, then continue deeper verification in parallel instead of making you wait for every worker to finish.`
  });
}
