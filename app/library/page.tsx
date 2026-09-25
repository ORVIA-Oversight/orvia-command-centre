import { ExternalLink, FileCheck2, History, LibraryBig } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Topbar } from '@/components/Topbar';
import { getServerSupabase } from '@/lib/supabase-server';

export const dynamic='force-dynamic';
export const revalidate=0;

const SHAREPOINT_HUB='https://orviahealthcare.sharepoint.com/sites/ORVIAHUB';
const SNAPSHOT='https://orviahealthcare.sharepoint.com/sites/ORVIAHUB/Shared%20Documents/00%20ORVIA%20vNext%20-%20Clean%20Core/08%20Technology%20Data%20and%20Integrations/System%20Backups/2026-09-25%20Live%20ORVIA%20Consolidation%20Snapshot';

async function loadEvidenceIndex(){
 const supabase=getServerSupabase();
 if(!supabase)return {source:'unavailable',classified:[],changes:[]};
 const [classified,changes]=await Promise.all([
  supabase.from('admin_classified_items').select('id,source_type,source_reference,title,methodology_code,business_area_code,function_code,status,tags,created_at,updated_at').order('updated_at',{ascending:false}).limit(100),
  supabase.from('admin_change_log').select('id,entity_type,action,actor,summary,created_at').order('created_at',{ascending:false}).limit(100)
 ]);
 return {source:'live',classified:classified.data??[],changes:changes.data??[]};
}

export default async function LibraryPage(){
 const data=await loadEvidenceIndex();
 return <Shell><Topbar title="Evidence & Library" eyebrow="ORVIA · HIVE CONTROL VIEW"/><div className="pageWrap">
  <section className="pageIntro"><div className="eyebrow">ORIGINALS IN SHAREPOINT · STRUCTURE IN ORVIA</div><h2>Evidence stays attributable and recoverable.</h2><p>SharePoint remains the controlled store for originals. This workspace shows structured index and change-log state only; it does not promote a discovered or AI-derived item into approved evidence.</p></section>

  <div className="evidenceLinks">
    <a href={SHAREPOINT_HUB} target="_blank" rel="noreferrer"><LibraryBig size={18}/><span><b>Open ORVIA HUB</b><small>Controlled originals and documents</small></span><ExternalLink size={13}/></a>
    <a href={SNAPSHOT} target="_blank" rel="noreferrer"><FileCheck2 size={18}/><span><b>Open current consolidation snapshot</b><small>25 September 2026 recovery point</small></span><ExternalLink size={13}/></a>
  </div>

  <section className="twoCol spaced">
   <article className="panel">
    <div className="panelHead"><div><span>STRUCTURED INDEX</span><h3>Classified items</h3></div><FileCheck2 size={18}/></div>
    <div className="panelBody">
      {data.classified.length?<div className="activityList">{data.classified.map((x:any)=><div key={x.id}><FileCheck2 size={16}/><p><b>{x.title}</b><small>{x.source_type} · {x.status} · {x.source_reference}</small></p></div>)}</div>:<div className="workspaceEmpty"><FileCheck2 size={22}/><b>No structured evidence items are currently indexed</b><span>This is not treated as evidence absence. Controlled originals remain in SharePoint while HIVE indexing is built out.</span></div>}
    </div>
   </article>

   <article className="panel">
    <div className="panelHead"><div><span>AUDIT TRAIL</span><h3>Recent controlled changes</h3></div><History size={18}/></div>
    <div className="panelBody">
      {data.changes.length?<div className="activityList">{data.changes.map((x:any)=><div key={x.id}><History size={16}/><p><b>{x.summary||x.action}</b><small>{x.entity_type} · {x.action} · {x.actor} · {new Date(x.created_at).toLocaleString('en-GB')}</small></p></div>)}</div>:<div className="workspaceEmpty"><History size={22}/><b>No change-log records returned</b><span>ORVIA will not invent an audit trail.</span></div>}
    </div>
   </article>
  </section>
 </div></Shell>
}
