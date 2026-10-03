import { getServerSupabase } from '@/lib/supabase-server';

export type ReviewMatter = {
  id:string; matter_ref:string; client_name:string; title:string; service_pack:string;
  matter_type:string; status:string; priority:string; scope:string|null; instruction:string|null;
  current_stage:string; next_human_action:string|null; progress_percent:number; is_demo:boolean;
};

export async function loadReviewMatter(ref='ORV-REV-DEMO-001'){
  const supabase=getServerSupabase();
  if(!supabase) return null;
  const matterResult=await supabase.from('review_matters').select('*').eq('matter_ref',ref).maybeSingle();
  const matter=matterResult.data as ReviewMatter|null;
  if(!matter) return null;

  const [evidence,issues,gaps,events,runs,reports]=await Promise.all([
    supabase.from('review_evidence').select('*').eq('matter_id',matter.id).order('evidence_ref'),
    supabase.from('review_issues').select('*').eq('matter_id',matter.id).order('issue_ref'),
    supabase.from('review_gaps').select('*').eq('matter_id',matter.id).order('created_at'),
    supabase.from('review_events').select('*').eq('matter_id',matter.id).order('event_date'),
    supabase.from('review_ai_runs').select('*').eq('matter_id',matter.id).order('created_at',{ascending:false}),
    supabase.from('review_reports').select('*').eq('matter_id',matter.id).order('version',{ascending:false})
  ]);

  return {
    matter,
    evidence:evidence.data??[],
    issues:issues.data??[],
    gaps:gaps.data??[],
    events:events.data??[],
    runs:runs.data??[],
    report:reports.data?.[0]??null
  };
}
