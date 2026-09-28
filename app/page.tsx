import './brand-control/brand-control.css';
import { BrandControlClient } from './brand-control/BrandControlClient';
import { getServerSupabase } from '@/lib/supabase-server';

export const dynamic='force-dynamic';
export const revalidate=0;
// Brand Control production deployment trigger: 2026-09-28

async function loadBrandControl(){
  const supabase=getServerSupabase();
  if(!supabase) return {assets:[],work:[],integrations:[]};

  const [assets,work,integrations]=await Promise.all([
    supabase.from('orvia_asset_registry')
      .select('asset_key,display_name,asset_type,canonical_domain,canonical_url,estate_disposition,verification_status,updated_at')
      .order('display_name',{ascending:true}),
    supabase.from('admin_work_queue')
      .select('id,work_type,title,detail,status,priority,approval_required,source_system,source_reference,created_at')
      .eq('assigned_to','BRAND-01')
      .order('created_at',{ascending:false})
      .limit(100),
    supabase.from('admin_integrations')
      .select('code,name,category,connection_mode,status,updated_at,metadata')
      .order('name',{ascending:true})
  ]);

  return {
    assets:assets.data??[],
    work:work.data??[],
    integrations:integrations.data??[]
  };
}

export default async function Page(){
  const data=await loadBrandControl();
  return <BrandControlClient assets={data.assets as any} work={data.work as any} integrations={data.integrations as any}/>;
}
