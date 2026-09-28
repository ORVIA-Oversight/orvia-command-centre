import { headers } from 'next/headers';
import { getServerSupabase } from '@/lib/supabase-server';
import { modulesForContext, type PlatformMode } from './platform-modules';

export type PlatformContext={
  mode:PlatformMode;
  email:string|null;
  role:string|null;
  organisation:string|null;
  organisationId:string|null;
  services:string[];
  modules:ReturnType<typeof modulesForContext>;
  source:'session'|'live'|'unavailable';
};

function unique(values:string[]){
  return Array.from(new Set(values.map(x=>x.trim().toLowerCase()).filter(Boolean)));
}

function metadataServices(metadata:unknown){
  if(!metadata||typeof metadata!=='object') return [];
  const m=metadata as Record<string,unknown>;
  const raw=[m.services,m.service_codes,m.products].flatMap(v=>Array.isArray(v)?v:typeof v==='string'?[v]:[]);
  return raw.map(String);
}

export async function getPlatformContext():Promise<PlatformContext>{
  const h=headers();
  const email=h.get('x-orvia-user');
  const sessionRole=h.get('x-orvia-role');
  const supabase=getServerSupabase();

  if(!supabase||!email){
    const mode:PlatformMode=['founder','admin','internal','employee','director','manager'].includes(String(sessionRole||'').toLowerCase())?'internal':'customer';
    const services:string[]=[];
    return {mode,email,role:sessionRole,organisation:null,organisationId:null,services,modules:modulesForContext(mode,services),source:supabase?'session':'unavailable'};
  }

  const person=await supabase.from('admin_people')
    .select('id,organisation_id,email,role_title,status,metadata')
    .ilike('email',email)
    .maybeSingle();

  const personId=person.data?.id??null;
  const organisationId=person.data?.organisation_id??null;

  const access=personId
    ? await supabase.from('admin_user_access').select('access_level,status,metadata').eq('person_id',personId).eq('status','active').maybeSingle()
    : {data:null,error:null};

  const role=access.data?.access_level||sessionRole||person.data?.role_title||'customer';
  const internal=['founder','admin','internal','employee','director','manager'].includes(String(role).toLowerCase());
  const mode:PlatformMode=internal?'internal':'customer';

  let organisation:string|null=null;
  let orgMetadata:unknown=null;
  if(organisationId){
    const org=await supabase.from('admin_organisations')
      .select('legal_name,trading_name,metadata,status')
      .eq('id',organisationId)
      .maybeSingle();
    organisation=org.data?.trading_name||org.data?.legal_name||null;
    orgMetadata=org.data?.metadata??null;
  }

  const services:string[]=[...metadataServices(person.data?.metadata),...metadataServices(access.data?.metadata),...metadataServices(orgMetadata)];

  if(organisationId){
    const [voice,web,onboarding]=await Promise.all([
      supabase.from('voice_accounts').select('id,status').eq('organisation_id',organisationId).limit(1),
      supabase.from('web_customers').select('id').eq('organisation_id',organisationId).limit(1),
      supabase.from('admin_onboarding_cases').select('service_code,status').eq('organisation_id',organisationId).neq('status','cancelled').limit(50)
    ]);
    if((voice.data??[]).length) services.push('voice');
    if((web.data??[]).length) services.push('web');
    for(const row of onboarding.data??[]) if(row.service_code) services.push(String(row.service_code));
  }

  const finalServices=unique(services);
  return {
    mode,email,role,organisation,organisationId,
    services:finalServices,
    modules:modulesForContext(mode,finalServices),
    source:'live'
  };
}
