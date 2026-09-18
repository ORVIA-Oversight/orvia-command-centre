import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

function numberInRange(value:unknown,min:number,max:number){
  const n=Number(value); return Number.isFinite(n)&&n>=min&&n<=max?n:null;
}

export async function POST(req:NextRequest){
  const expected=process.env.INGEST_API_KEY;
  const supplied=req.headers.get('authorization')?.replace(/^Bearer\s+/i,'');
  if(!expected||supplied!==expected)return NextResponse.json({error:'Unauthorized'},{status:401});
  const supabase=getServerSupabase();
  if(!supabase)return NextResponse.json({error:'Supabase not configured'},{status:503});
  const body=await req.json();
  const assetId=String(body.asset_id??body.id??'').trim();
  if(!assetId)return NextResponse.json({error:'asset_id is required'},{status:400});
  const lat=body.lat==null?null:numberInRange(body.lat,-90,90);
  const lon=body.lon==null?null:numberInRange(body.lon,-180,180);
  if(body.lat!=null&&lat==null)return NextResponse.json({error:'Invalid lat'},{status:400});
  if(body.lon!=null&&lon==null)return NextResponse.json({error:'Invalid lon'},{status:400});
  const battery=body.battery==null?null:numberInRange(body.battery,0,100);
  const payload={
    asset_id:assetId,
    callsign:String(body.callsign??assetId),
    kind:String(body.kind??'PERSON').toUpperCase(),
    status:String(body.status??'LIVE').toUpperCase(),
    team:String(body.team??'Unassigned'),
    battery,
    network:String(body.network??body.transport??'Unknown'),
    detail:String(body.detail??'Field telemetry'),
    lat,lon,
    x:body.x==null?null:numberInRange(body.x,0,100),
    y:body.y==null?null:numberInRange(body.y,0,100),
    provider:String(body.provider??body.source??'field-gateway'),
    raw:body.raw??null
  };
  const event={event_type:'deploy_asset_position',source:String(body.source??'deploy-gateway'),severity:payload.status==='EMERGENCY'?'critical':'info',payload,occurred_at:body.occurred_at??new Date().toISOString()};
  const {data,error}=await supabase.from('command_telemetry_events').insert(event).select('id').single();
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({ok:true,id:data.id,asset_id:assetId},{status:201});
}