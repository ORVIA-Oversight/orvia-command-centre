import { getServerSupabase } from '@/lib/supabase-server';

export type ClientOrganisation={
  id:string;
  organisation_type:string|null;
  legal_name:string|null;
  trading_name:string|null;
  company_number:string|null;
  status:string|null;
  primary_email:string|null;
  primary_phone:string|null;
  metadata:Record<string,unknown>|null;
  updated_at:string|null;
};

export async function loadClientRegistry(){
  const supabase=getServerSupabase();
  if(!supabase) return {source:'unavailable' as const,organisations:[],voiceAccounts:[],webCustomers:[],webProjects:[],errors:['Supabase not configured']};

  const [orgs,voice,webCustomers,webProjects]=await Promise.all([
    supabase.from('admin_organisations')
      .select('id,organisation_type,legal_name,trading_name,company_number,status,primary_email,primary_phone,metadata,updated_at')
      .order('updated_at',{ascending:false})
      .limit(250),
    supabase.from('voice_accounts')
      .select('id,organisation_id,status,service_plan,provider,go_live_at,metadata,updated_at')
      .order('updated_at',{ascending:false})
      .limit(250),
    supabase.from('web_customers')
      .select('id,organisation_id,email,name,business,updated_at')
      .order('updated_at',{ascending:false})
      .limit(250),
    supabase.from('web_projects')
      .select('id,customer_id,project_code,package,state,domain,preview_url,live_url,version_label,next_action,orvia_action,updated_at')
      .order('updated_at',{ascending:false})
      .limit(500)
  ]);

  return {
    source:'live' as const,
    organisations:(orgs.data??[]) as ClientOrganisation[],
    voiceAccounts:voice.data??[],
    webCustomers:webCustomers.data??[],
    webProjects:webProjects.data??[],
    errors:[orgs.error?.message,voice.error?.message,webCustomers.error?.message,webProjects.error?.message].filter(Boolean)
  };
}

export function isInternalOrviaOrganisation(org:ClientOrganisation){
  return Boolean(org.metadata && (org.metadata as any).internal_orvia===true);
}

export function organisationName(org:ClientOrganisation){
  return org.trading_name||org.legal_name||org.primary_email||'Unnamed organisation';
}

export function servicesForOrganisation(orgId:string,registry:Awaited<ReturnType<typeof loadClientRegistry>>){
  const voice=registry.voiceAccounts.filter((x:any)=>x.organisation_id===orgId);
  const webCustomers=registry.webCustomers.filter((x:any)=>x.organisation_id===orgId);
  const webCustomerIds=new Set(webCustomers.map((x:any)=>x.id));
  const webProjects=registry.webProjects.filter((x:any)=>webCustomerIds.has(x.customer_id));
  return {voice,webCustomers,webProjects};
}

export async function loadClientOrganisation(id:string){
  const supabase=getServerSupabase();
  if(!supabase) return {source:'unavailable' as const,organisation:null,voiceAccounts:[],webCustomers:[],webProjects:[],errors:['Supabase not configured']};

  const [org,voice,webCustomers]=await Promise.all([
    supabase.from('admin_organisations')
      .select('id,organisation_type,legal_name,trading_name,company_number,status,primary_email,primary_phone,metadata,updated_at')
      .eq('id',id).maybeSingle(),
    supabase.from('voice_accounts')
      .select('id,organisation_id,status,service_plan,provider,go_live_at,metadata,updated_at')
      .eq('organisation_id',id)
      .order('updated_at',{ascending:false}),
    supabase.from('web_customers')
      .select('id,organisation_id,email,name,business,updated_at')
      .eq('organisation_id',id)
      .order('updated_at',{ascending:false})
  ]);

  const customerIds=(webCustomers.data??[]).map((x:any)=>x.id);
  let webProjects:any[]=[];
  let webProjectsError:string|undefined;
  if(customerIds.length){
    const projects=await supabase.from('web_projects')
      .select('id,customer_id,project_code,package,state,domain,preview_url,live_url,version_label,next_action,orvia_action,updated_at')
      .in('customer_id',customerIds)
      .order('updated_at',{ascending:false});
    webProjects=projects.data??[];
    webProjectsError=projects.error?.message;
  }

  return {
    source:'live' as const,
    organisation:(org.data??null) as ClientOrganisation|null,
    voiceAccounts:voice.data??[],
    webCustomers:webCustomers.data??[],
    webProjects,
    errors:[org.error?.message,voice.error?.message,webCustomers.error?.message,webProjectsError].filter(Boolean)
  };
}
