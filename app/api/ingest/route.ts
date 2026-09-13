import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
export async function POST(req:NextRequest){
 const expected=process.env.INGEST_API_KEY;
 const supplied=req.headers.get('authorization')?.replace(/^Bearer\s+/i,'');
 if(!expected || supplied!==expected) return NextResponse.json({error:'Unauthorized'},{status:401});
 const supabase=getServerSupabase(); if(!supabase) return NextResponse.json({error:'Supabase not configured'},{status:503});
 const body=await req.json();
 const event={event_type:String(body.event_type??'external_event'),source:String(body.source??'external'),severity:String(body.severity??'info'),payload:body.payload??body,occurred_at:body.occurred_at??new Date().toISOString()};
 const {data,error}=await supabase.from('command_telemetry_events').insert(event).select('id').single();
 if(error) return NextResponse.json({error:error.message},{status:500});
 return NextResponse.json({ok:true,id:data.id},{status:201});
}
