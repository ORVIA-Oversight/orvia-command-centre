import { getServerSupabase } from '@/lib/supabase-server';

export type AccessAccount={
  id:string;
  service_name:string;
  category:string|null;
  current_login_email:string|null;
  target_orvia_email:string|null;
  migration_status:string;
  owner_name:string|null;
  mfa_state:string|null;
  recovery_method:string|null;
  vault_reference:string|null;
  secret_location:string|null;
  sso_candidate:boolean;
  contains_material_data:boolean;
  current_state:string|null;
  action_required:string|null;
  last_verified_on:string|null;
  notes:string|null;
  legacy_healthcare:boolean;
  source_file_name:string;
  source_file_path:string|null;
  source_row_number:number|null;
  updated_at:string;
};

export async function loadAccessRegister(){
 const supabase=getServerSupabase();
 if(!supabase) return {source:'unavailable' as const,accounts:[] as AccessAccount[],error:'Supabase not configured'};
 const {data,error}=await supabase
   .from('admin_access_accounts')
   .select('id,service_name,category,current_login_email,target_orvia_email,migration_status,owner_name,mfa_state,recovery_method,vault_reference,secret_location,sso_candidate,contains_material_data,current_state,action_required,last_verified_on,notes,legacy_healthcare,source_file_name,source_file_path,source_row_number,updated_at')
   .order('legacy_healthcare',{ascending:true})
   .order('service_name',{ascending:true});
 return {source:error?'error' as const:'live' as const,accounts:(data??[]) as AccessAccount[],error:error?.message??null};
}

export function accessSummary(accounts:AccessAccount[]){
 return {
   total:accounts.length,
   verify:accounts.filter(x=>x.migration_status==='VERIFY').length,
   keep:accounts.filter(x=>x.migration_status==='KEEP').length,
   review:accounts.filter(x=>x.migration_status==='REVIEW').length,
   planned:accounts.filter(x=>x.migration_status==='PLANNED').length,
   legacy:accounts.filter(x=>x.legacy_healthcare).length,
   mfaUnknown:accounts.filter(x=>!x.legacy_healthcare && ['TBD','','UNKNOWN'].includes(String(x.mfa_state||'').toUpperCase())).length,
   vaultUnassigned:accounts.filter(x=>!x.legacy_healthcare && ['TBD','','UNKNOWN'].includes(String(x.vault_reference||'').toUpperCase())).length
 };
}
