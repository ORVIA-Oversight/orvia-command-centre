import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(){
  const supabase = getServerSupabase();
  if(!supabase){
    return NextResponse.json({
      source:'unavailable',
      sources:0,
      signals:0,
      interpretationsPending:0,
      campaignsDraft:0,
      approvals:0,
      recentSignals:[],
      recentCampaigns:[],
      warning:'Supabase is not configured.'
    });
  }

  const [sources, signals, interpretations, campaigns, content] = await Promise.all([
    supabase.from('pulse_sources').select('id,status',{count:'exact'}),
    supabase.from('pulse_signals').select('id,signal_type,topic,source_url,observed_text,observed_at,evidence_state').order('observed_at',{ascending:false}).limit(12),
    supabase.from('pulse_interpretations').select('id,human_review_status',{count:'exact'}),
    supabase.from('pulse_campaigns').select('id,campaign_code,title,status,approval_required,approved_at,primary_product,created_at').order('created_at',{ascending:false}).limit(12),
    supabase.from('pulse_content_items').select('id,status,human_approved',{count:'exact'})
  ]);

  const interpretationRows = interpretations.data ?? [];
  const campaignRows = campaigns.data ?? [];
  const contentRows = content.data ?? [];

  return NextResponse.json({
    source:'live',
    sources:sources.count ?? (sources.data?.length ?? 0),
    signals:signals.data?.length ?? 0,
    interpretationsPending:interpretationRows.filter((x:any)=>String(x.human_review_status).toLowerCase()!=='approved').length,
    campaignsDraft:campaignRows.filter((x:any)=>String(x.status).toLowerCase()==='draft').length,
    approvals:contentRows.filter((x:any)=>!x.human_approved && ['draft','review','ready'].includes(String(x.status).toLowerCase())).length,
    recentSignals:signals.data ?? [],
    recentCampaigns:campaignRows,
    errors:[sources.error?.message,signals.error?.message,interpretations.error?.message,campaigns.error?.message,content.error?.message].filter(Boolean)
  });
}
