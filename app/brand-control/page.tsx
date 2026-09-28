import { Palette, ShieldCheck, Activity, Globe2, Share2, Video, Mic2, CircleAlert } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Topbar } from '@/components/Topbar';
import { getServerSupabase } from '@/lib/supabase-server';

export const dynamic='force-dynamic';
export const revalidate=0;

function ok(value: unknown) {
  return ['connected','configured','ready','live verified','verified','keep'].includes(String(value??'').toLowerCase().replaceAll('_',' '));
}

async function loadBrandControl(){
  const supabase=getServerSupabase();
  if(!supabase) return {source:'unavailable',assets:[],work:[],integrations:[]};
  const [assets,work,integrations]=await Promise.all([
    supabase.from('orvia_asset_registry').select('asset_key,display_name,asset_type,canonical_domain,canonical_url,estate_disposition,verification_status,updated_at').order('display_name',{ascending:true}),
    supabase.from('admin_work_queue').select('id,work_type,title,detail,status,priority,approval_required,source_system,source_reference,created_at').eq('assigned_to','BRAND-01').order('created_at',{ascending:false}).limit(50),
    supabase.from('admin_integrations').select('code,name,category,connection_mode,status,updated_at,metadata').order('name',{ascending:true})
  ]);
  return {source:'live',assets:assets.data??[],work:work.data??[],integrations:integrations.data??[]};
}

export default async function BrandControlPage(){
  const data=await loadBrandControl();
  const currentAssets=data.assets.filter((a:any)=>['keep','rename','temporary','hold'].includes(String(a.estate_disposition||'').toLowerCase()));
  const reviewAssets=currentAssets.filter((a:any)=>String(a.estate_disposition||'').toLowerCase()!=='keep'||!ok(a.verification_status));
  const approvals=data.work.filter((w:any)=>w.approval_required===true && !['done','cancelled'].includes(String(w.status||'').toLowerCase()));
  const active=data.work.filter((w:any)=>!['done','cancelled'].includes(String(w.status||'').toLowerCase()));
  const social=data.integrations.filter((x:any)=>/metricool|facebook|instagram|linkedin|youtube|tiktok|threads|social/i.test(`${x.code} ${x.name} ${x.category}`));
  const media=data.integrations.filter((x:any)=>/heygen|synthesia|canva|prompt|video|media/i.test(`${x.code} ${x.name} ${x.category}`));
  const voice=data.integrations.filter((x:any)=>/vapi|voice|aria|yay|telephony/i.test(`${x.code} ${x.name} ${x.category}`));

  return <Shell><Topbar title="Brand Control" eyebrow="ORVIA · ONE BRAND · ONE SOURCE · EVERY SURFACE"/><div className="pageWrap">
    <section className="productionHero">
      <div><div className="eyebrow">LIVE BRAND OPERATING LAYER</div><h2>IRIS conducts. Brand Control constrains the output.</h2><p>Every ORVIA website, social post, voice script, media asset, prompt and public claim should inherit the same approved brand context before release.</p></div>
      <div className="humanAuthority"><ShieldCheck size={18}/><div><b>Human approval retained</b><span>Brand Control can prepare and validate. Material public release remains approval-gated.</span></div></div>
    </section>

    <section className="metricsGrid">
      <article className="metricCard tone-teal"><small>CONTROLLED ESTATE</small><strong>{currentAssets.length}</strong><span>{reviewAssets.length} require reconciliation or verification</span></article>
      <article className="metricCard tone-gold"><small>BRAND WORK</small><strong>{active.length}</strong><span>{approvals.length} waiting for human approval</span></article>
      <article className="metricCard tone-purple"><small>SOCIAL CONNECTIONS</small><strong>{social.filter((x:any)=>ok(x.status)).length}</strong><span>{social.length} recorded social/network integrations</span></article>
      <article className="metricCard tone-orange"><small>MEDIA + VOICE</small><strong>{media.filter((x:any)=>ok(x.status)).length + voice.filter((x:any)=>ok(x.status)).length}</strong><span>verified/configured integrations only</span></article>
    </section>

    <section className="twoCol">
      <article className="panel"><div className="panelHead"><div><span>IRIS INTAKE</span><h3>Brand work queue</h3></div><Palette size={18}/></div><div className="panelBody activityList">
        {active.length?active.slice(0,10).map((w:any)=><div key={w.id}><Activity size={16}/><p><b>{w.title}</b><small>{w.work_type} · {w.status} · {w.priority}{w.approval_required?' · approval required':''}</small></p></div>):<div className="workspaceEmpty"><b>No Brand Control work yet</b><span>Brand-related IRIS instructions will appear here automatically.</span></div>}
      </div></article>

      <article className="panel"><div className="panelHead"><div><span>ESTATE COMPLIANCE</span><h3>Surfaces needing attention</h3></div><Globe2 size={18}/></div><div className="panelBody systemsGrid">
        {reviewAssets.length?reviewAssets.slice(0,12).map((a:any)=><div className="systemRow" key={a.asset_key}><div><b>{a.display_name}</b><small>{a.canonical_domain||a.asset_type||'No canonical domain'}<br/>{String(a.verification_status||'NOT VERIFIED')}</small></div><span className="statusBadge status-gold">{String(a.estate_disposition||'REVIEW').toUpperCase()}</span></div>):<div className="workspaceEmpty"><b>No current exceptions</b><span>All registered current assets are marked KEEP and verified.</span></div>}
      </div></article>
    </section>

    <section className="productionGrid" style={{marginTop:16}}>
      <IntegrationPanel title="Social" icon={<Share2 size={18}/>} rows={social}/>
      <IntegrationPanel title="Media" icon={<Video size={18}/>} rows={media}/>
      <IntegrationPanel title="Voice" icon={<Mic2 size={18}/>} rows={voice}/>
    </section>

    {data.source==='unavailable'&&<div className="commandNotice" style={{marginTop:16}}><CircleAlert size={16}/><div><b>Live data unavailable</b><div>Brand Control cannot reach the server-side Supabase connection.</div></div></div>}
  </div></Shell>;
}

function IntegrationPanel({title,icon,rows}:{title:string;icon:React.ReactNode;rows:any[]}){
  return <section className="productionPanel"><div className="productionPanelHead"><div><small>INTEGRATIONS</small><h3>{title}</h3></div>{icon}</div>
    <div className="gateList">{rows.length?rows.map((x:any)=><div key={x.code}><span>{x.name}</span><b>{String(x.status||'NOT VERIFIED').replaceAll('_',' ')}</b></div>):<div><span>No matching integration recorded</span><b>NOT VERIFIED</b></div>}</div>
  </section>;
}
