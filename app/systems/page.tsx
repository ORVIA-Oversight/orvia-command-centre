import { Activity, Database, Globe2, Mail, ShieldCheck } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Topbar } from '@/components/Topbar';
import { getServerSupabase } from '@/lib/supabase-server';

export const dynamic='force-dynamic';
export const revalidate=0;

async function loadSystems(){
 const supabase=getServerSupabase();
 if(!supabase)return {source:'unavailable',integrations:[],assets:[]};
 const [integrations,assets]=await Promise.all([
  supabase.from('admin_integrations').select('code,name,category,connection_mode,status,contains_material_data,updated_at,metadata').order('category',{ascending:true}).order('name',{ascending:true}),
  supabase.from('orvia_asset_registry').select('asset_key,display_name,asset_type,canonical_domain,deployment_project_name,estate_disposition,verification_status,public_surface,updated_at').order('display_name',{ascending:true})
 ]);
 return {source:'live',integrations:integrations.data??[],assets:assets.data??[]};
}

function good(status:string){
 return ['connected','configured','ready','live verified','verified','verified_by_ui'].includes(String(status||'').toLowerCase().replaceAll('_',' '));
}
function badge(status:string){return good(status)?'status-teal':'status-gold';}

export default async function SystemsPage(){
 const data=await loadSystems();
 const currentAssets=data.assets.filter((a:any)=>['keep','rename','temporary','hold'].includes(String(a.estate_disposition||'').toLowerCase()));
 const currentMail=data.integrations.filter((x:any)=>String(x.code||'').startsWith('MAIL_')&&!String(x.code||'').startsWith('MAIL_HC_'));
 const legacyMail=data.integrations.filter((x:any)=>String(x.code||'').startsWith('MAIL_HC_'));
 const issues=data.integrations.filter((x:any)=>!good(x.status));
 const estateReview=currentAssets.filter((a:any)=>String(a.estate_disposition||'').toLowerCase()!=='keep'||!good(a.verification_status));

 return <Shell><Topbar title="Systems & Health" eyebrow="ORVIA · LIVE CONTROL VIEW"/><div className="pageWrap">
  <section className="pageIntro"><div className="eyebrow">SEE WHAT ORVIA DEPENDS ON</div><h2>Systems, websites and access in one control view.</h2><p>This page shows the controlled registry and integration state held by ORVIA. A recorded connection is not treated as proof of end-to-end operation unless its verification state says so.</p></section>

  <section className="metricsGrid">
   <article className="metricCard tone-teal"><small>CURRENT ESTATE</small><strong>{currentAssets.length}</strong><span>{estateReview.length} need reconciliation or verification</span></article>
   <article className="metricCard tone-gold"><small>SYSTEM CONNECTIONS</small><strong>{data.integrations.length}</strong><span>{issues.length} not in accepted state</span></article>
   <article className="metricCard tone-purple"><small>CURRENT ORVIA MAIL</small><strong>{currentMail.length}</strong><span>{legacyMail.length} Healthcare mailbox records retained for migration</span></article>
   <article className="metricCard tone-orange"><small>PUBLIC SURFACES</small><strong>{currentAssets.filter((a:any)=>a.public_surface).length}</strong><span>Recorded public-facing assets</span></article>
  </section>

  <section className="twoCol">
   <article className="panel">
    <div className="panelHead"><div><span>LANDSCAPE</span><h3>Websites & internal surfaces</h3></div><Globe2 size={18}/></div>
    <div className="panelBody systemsGrid">
     {currentAssets.map((a:any)=><div className="systemRow" key={a.asset_key}><div><b>{a.display_name}</b><small>{a.canonical_domain||a.asset_type}<br/>{a.deployment_project_name||'Deployment project not recorded'}</small></div><span className={'statusBadge '+badge(a.verification_status)}>{String(a.estate_disposition).toUpperCase()}</span></div>)}
    </div>
   </article>

   <article className="panel">
    <div className="panelHead"><div><span>INTEGRATIONS</span><h3>Connected systems</h3></div><Activity size={18}/></div>
    <div className="panelBody systemsGrid">
     {data.integrations.filter((x:any)=>!String(x.code||'').startsWith('MAIL_')).map((x:any)=><div className="systemRow" key={x.code}><div><b>{x.name}</b><small>{x.category} · {x.connection_mode}{x.contains_material_data?' · material data':''}</small></div><span className={'statusBadge '+badge(x.status)}>{String(x.status).replaceAll('_',' ')}</span></div>)}
    </div>
   </article>
  </section>

  <section className="twoCol spaced">
   <article className="panel">
    <div className="panelHead"><div><span>EMAIL IDENTITY</span><h3>Current ORVIA role mailboxes</h3></div><Mail size={18}/></div>
    <div className="panelBody systemsGrid">
      {currentMail.map((x:any)=><div className="systemRow" key={x.code}><div><b>{x.name}</b><small>{x.metadata?.address||'Address not recorded'}</small></div><span className={'statusBadge '+badge(x.status)}>{String(x.status).replaceAll('_',' ')}</span></div>)}
    </div>
   </article>
   <article className="panel">
    <div className="panelHead"><div><span>CONTROL</span><h3>What still needs attention</h3></div><ShieldCheck size={18}/></div>
    <div className="panelBody">
      <div className="activityList">
       {estateReview.slice(0,8).map((a:any)=><div key={a.asset_key}><Database size={16}/><p><b>{a.display_name}</b><small>{String(a.estate_disposition).replaceAll('_',' ')} · {String(a.verification_status).replaceAll('_',' ')}</small></p></div>)}
       {issues.slice(0,8).map((x:any)=><div key={x.code}><Activity size={16}/><p><b>{x.name}</b><small>{String(x.status).replaceAll('_',' ')} · {x.category}</small></p></div>)}
       {!estateReview.length&&!issues.length&&<div><ShieldCheck size={16}/><p><b>No recorded exceptions</b><small>This is registry state, not a blanket claim that every external service has been live-tested.</small></p></div>}
      </div>
    </div>
   </article>
  </section>
 </div></Shell>
}
