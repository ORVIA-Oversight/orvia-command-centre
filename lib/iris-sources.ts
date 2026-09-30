import { getServerSupabase } from '@/lib/supabase-server';

export const DEFAULT_ORVIA_SHAREPOINT_SITE_ID =
  'orviahealthcare.sharepoint.com,86cca674-fd9e-4b13-849f-7005f7b5a8de,17dcd28b-20c1-485d-b458-baba412ed5ad';
export const DEFAULT_ORVIA_SHAREPOINT_DRIVE_ID =
  'b!dKbMhp79E0uEn3AF97Wo3ovS3BfBIF1ItFi6ukEu1a0T6a2QF8MgQINUhy9q6I-V';
export const DEFAULT_IRIS_INGEST_FOLDER = 'IRIS Ingest';

function graphConfig(){
  const tenant=process.env.MICROSOFT_TENANT_ID;
  const clientId=process.env.MICROSOFT_CLIENT_ID;
  const clientSecret=process.env.MICROSOFT_CLIENT_SECRET;
  if(!tenant||!clientId||!clientSecret) throw new Error('Microsoft Graph app credentials are not configured');
  return {
    tenant,clientId,clientSecret,
    siteId:process.env.ORVIA_SHAREPOINT_SITE_ID||DEFAULT_ORVIA_SHAREPOINT_SITE_ID,
    driveId:process.env.ORVIA_SHAREPOINT_DRIVE_ID||DEFAULT_ORVIA_SHAREPOINT_DRIVE_ID,
    folder:process.env.ORVIA_SHAREPOINT_INGEST_FOLDER||DEFAULT_IRIS_INGEST_FOLDER
  };
}

export async function graphAppToken(){
  const cfg=graphConfig();
  const body=new URLSearchParams({
    client_id:cfg.clientId,
    client_secret:cfg.clientSecret,
    grant_type:'client_credentials',
    scope:'https://graph.microsoft.com/.default'
  });
  const r=await fetch(`https://login.microsoftonline.com/${encodeURIComponent(cfg.tenant)}/oauth2/v2.0/token`,{
    method:'POST',
    headers:{'content-type':'application/x-www-form-urlencoded'},
    body,
    cache:'no-store'
  });
  const data=await r.json().catch(()=>({}));
  if(!r.ok||!data.access_token) throw new Error(data.error_description||data.error||'Microsoft Graph token request failed');
  return {token:String(data.access_token),cfg};
}

function cleanFileName(value:string){
  return String(value||'file')
    .replace(/[\\/:*?"<>|#%]/g,'_')
    .replace(/\s+/g,' ')
    .trim()
    .slice(0,180)||'file';
}

function encodeGraphPath(path:string){
  return path.split('/').filter(Boolean).map(encodeURIComponent).join('/');
}

export function assetTypeFor(name:string,mimeType?:string){
  const mime=String(mimeType||'').toLowerCase();
  const lower=name.toLowerCase();
  if(mime.startsWith('video/')||/\.(mp4|mov|m4v|webm|avi|mkv)$/i.test(lower)) return 'video';
  if(mime.startsWith('image/')||/\.(png|jpe?g|webp|gif|svg|heic)$/i.test(lower)) return 'image';
  if(mime.startsWith('audio/')||/\.(mp3|wav|m4a|ogg|aac|flac)$/i.test(lower)) return 'other';
  if(mime.includes('pdf')||mime.includes('word')||mime.includes('text')||mime.includes('sheet')||mime.includes('presentation')||/\.(pdf|docx?|xlsx?|pptx?|txt|md|csv|rtf)$/i.test(lower)) return 'document';
  return 'other';
}

export async function createSharePointUploadSession(fileName:string){
  const {token,cfg}=await graphAppToken();
  const safe=cleanFileName(fileName);
  const stamped=`${new Date().toISOString().replace(/[:.]/g,'-')}_${crypto.randomUUID().slice(0,8)}_${safe}`;
  const path=encodeGraphPath(`${cfg.folder}/${stamped}`);
  const endpoint=`https://graph.microsoft.com/v1.0/drives/${encodeURIComponent(cfg.driveId)}/root:/${path}:/createUploadSession`;
  const r=await fetch(endpoint,{
    method:'POST',
    headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},
    body:JSON.stringify({item:{'@microsoft.graph.conflictBehavior':'rename',name:stamped}}),
    cache:'no-store'
  });
  const data=await r.json().catch(()=>({}));
  if(!r.ok||!data.uploadUrl) throw new Error(data?.error?.message||'SharePoint upload session could not be created');
  return {uploadUrl:String(data.uploadUrl),expirationDateTime:data.expirationDateTime||null,fileName:stamped,driveId:cfg.driveId,siteId:cfg.siteId};
}

export async function registerSource(input:{
  title:string;
  fileName?:string|null;
  mimeType?:string|null;
  sourceSystem:string;
  sourceUrl?:string|null;
  sharepointItemId?:string|null;
  sharepointDriveId?:string|null;
  metadata?:Record<string,unknown>;
}){
  const supabase=getServerSupabase();
  if(!supabase) throw new Error('Supabase not configured');
  const {data,error}=await supabase.from('admin_media_assets').insert({
    title:input.title,
    asset_type:assetTypeFor(input.fileName||input.title,input.mimeType||undefined),
    source_system:input.sourceSystem,
    source_url:input.sourceUrl||null,
    sharepoint_item_id:input.sharepointItemId||null,
    sharepoint_drive_id:input.sharepointDriveId||null,
    file_name:input.fileName||null,
    mime_type:input.mimeType||null,
    status:'unreviewed',
    is_primary:false,
    usage_notes:'Added to IRIS conversation context.',
    tags:['iris-context','hive-ingest'],
    metadata:input.metadata||{}
  }).select('id,title,asset_type,source_system,source_url,file_name,mime_type,status,metadata').single();
  if(error||!data) throw new Error(error?.message||'Could not register source');
  return data;
}

export async function queueSourceIngest(source:any){
  const supabase=getServerSupabase();
  if(!supabase) throw new Error('Supabase not configured');
  const {data,error}=await supabase.from('admin_brain_jobs').insert({
    user_request:`Ingest source for IRIS context: ${source.title}`,
    interpreted_intent:'hive_source_ingest',
    selected_agent_code:'M365-WORKER',
    status:'queued',
    risk_level:'low',
    approval_required:false,
    approval_status:'not_required',
    input_context:{
      source_id:source.id,
      source_system:source.source_system,
      source_url:source.source_url,
      file_name:source.file_name,
      mime_type:source.mime_type,
      objective:'Extract or transcribe usable content, preserve provenance, classify it for HIVE, and make it retrievable by IRIS. Do not treat the source as verified merely because it was uploaded.'
    },
    requested_outputs:['source_text_or_transcript','metadata','hive_classification','retrieval_ready'],
    permitted_sources:source.source_url?[{id:source.id,url:source.source_url,system:source.source_system}]:[{id:source.id,system:source.source_system}],
    verification_required:false,
    external_ref:`iris-source:${source.id}`
  }).select('id,status').single();
  if(error||!data) throw new Error(error?.message||'Could not queue source ingest');
  return data;
}
