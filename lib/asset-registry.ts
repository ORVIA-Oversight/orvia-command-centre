import { getServerSupabase } from '@/lib/supabase-server';

export type OrviaAsset = {
  asset_key: string;
  display_name: string;
  asset_type: string;
  parent_asset_key: string | null;
  canonical_domain: string | null;
  canonical_url: string | null;
  github_repo: string | null;
  production_branch: string | null;
  deployment_project_name: string | null;
  desired_deployment_project_name: string | null;
  accent_key: string | null;
  accent_hex: string | null;
  lifecycle_status: string;
  verification_status: string;
  authority_level: string;
  sensitivity_class: string;
  public_surface: boolean;
  automation_enabled: boolean;
  estate_disposition: 'keep'|'rename'|'temporary'|'retire_candidate'|'hold'|string;
  notes: string | null;
  updated_at?: string | null;
};

export async function loadOrviaAssets(){
  const supabase = getServerSupabase();
  if(!supabase) return {source:'unavailable' as const, assets:[] as OrviaAsset[], error:'Supabase not configured'};
  const {data,error}=await supabase
    .from('orvia_asset_registry')
    .select('asset_key,display_name,asset_type,parent_asset_key,canonical_domain,canonical_url,github_repo,production_branch,deployment_project_name,desired_deployment_project_name,accent_key,accent_hex,lifecycle_status,verification_status,authority_level,sensitivity_class,public_surface,automation_enabled,estate_disposition,notes,updated_at')
    .order('display_name',{ascending:true});
  return {source:error?'error' as const:'live' as const, assets:(data??[]) as OrviaAsset[], error:error?.message??null};
}

export function isCurrentAsset(asset:OrviaAsset){
  return ['keep','rename','temporary','hold'].includes(asset.estate_disposition);
}

export function isLegacyAsset(asset:OrviaAsset){
  return ['retire_candidate'].includes(asset.estate_disposition) || asset.lifecycle_status?.startsWith('legacy');
}

export function assetHref(asset:OrviaAsset){
  return '/projects/'+asset.asset_key;
}
