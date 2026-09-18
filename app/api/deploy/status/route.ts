import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

export const dynamic='force-dynamic';

export async function GET(){
  const supabase=getServerSupabase();
  if(!supabase)return NextResponse.json({source:'not_configured',assets:[]});
  const {data,error}=await supabase.from('command_telemetry_events').select('payload,occurred_at').eq('event_type','deploy_asset_position').order('occurred_at',{ascending:false}).limit(250);
  if(error)return NextResponse.json({source:'unavailable',assets:[],error:error.message},{status:503});
  const latest=new Map<string,any>();
  for(const row of data??[]){
    const p=row.payload as any; const id=String(p?.asset_id??'').trim();
    if(!id||latest.has(id))continue;
    const age=Math.max(0,Date.now()-new Date(row.occurred_at).getTime());
    const sec=Math.round(age/1000);
    const lastSeen=sec<60?sec+' sec':sec<3600?Math.round(sec/60)+' min':Math.round(sec/3600)+' hr';
    latest.set(id,{id,callsign:p.callsign,kind:p.kind,status:p.status,team:p.team,battery:p.battery,network:p.network,detail:p.detail,lat:p.lat,lon:p.lon,x:p.x,y:p.y,lastSeen});
  }
  return NextResponse.json({source:latest.size?'live':'empty',assets:[...latest.values()]});
}