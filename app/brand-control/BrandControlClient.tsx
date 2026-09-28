'use client';

import Image from 'next/image';
import { useMemo, useState, type CSSProperties } from 'react';
import {
  Activity, BarChart3, CheckCircle2, CircleAlert, FileImage, Globe2,
  Megaphone, Mic2, Palette, Plus, Share2, Sparkles, Video, WandSparkles
} from 'lucide-react';

type WorkItem = {
  id:string;
  work_type:string;
  title:string;
  detail?:string|null;
  status:string;
  priority:string;
  approval_required:boolean;
  source_system?:string|null;
  source_reference?:string|null;
  created_at:string;
};

type Integration = {
  code:string;
  name:string;
  category?:string|null;
  connection_mode?:string|null;
  status?:string|null;
};

type Asset = {
  asset_key:string;
  display_name:string;
  asset_type?:string|null;
  canonical_domain?:string|null;
  canonical_url?:string|null;
  estate_disposition?:string|null;
  verification_status?:string|null;
};

function ok(value: unknown) {
  return ['connected','configured','ready','live verified','verified','keep'].includes(
    String(value??'').toLowerCase().replaceAll('_',' ')
  );
}

function state(value:string){
  return String(value||'').toLowerCase().replaceAll('_',' ');
}

function WorkCard({item}:{item:WorkItem}) {
  return <article className="bcWorkCard">
    <div className="bcWorkMeta">
      <span>{item.work_type.replaceAll('_',' ')}</span>
      {item.approval_required && <span className="bcApproval">approval</span>}
    </div>
    <h4>{item.title}</h4>
    <p>{item.detail || 'Routed by IRIS to Brand Control.'}</p>
    <footer>
      <span>{item.priority}</span>
      <span>{item.source_system || 'IRIS'}</span>
    </footer>
  </article>;
}

function EmptyCard({label}:{label:string}) {
  return <div className="bcEmptyCard"><Sparkles size={22}/><b>{label}</b><span>IRIS-routed work will appear here.</span></div>;
}

function IntegrationChip({row}:{row:Integration}) {
  const ready=ok(row.status);
  return <div className="bcIntegrationChip">
    <span className={ready?'bcDot ready':'bcDot'} />
    <div><b>{row.name}</b><small>{String(row.status||'NOT VERIFIED').replaceAll('_',' ')}</small></div>
  </div>;
}

export function BrandControlClient({
  assets, work, integrations
}:{assets:Asset[]; work:WorkItem[]; integrations:Integration[]}) {
  const [tab,setTab]=useState<'overview'|'create'|'analytics'>('overview');
  const [channel,setChannel]=useState('All channels');

  const currentAssets=useMemo(
    ()=>assets.filter(a=>['keep','rename','temporary','hold'].includes(String(a.estate_disposition||'').toLowerCase())),
    [assets]
  );
  const reviewAssets=currentAssets.filter(a=>String(a.estate_disposition||'').toLowerCase()!=='keep'||!ok(a.verification_status));
  const health=currentAssets.length?Math.max(0,Math.round(((currentAssets.length-reviewAssets.length)/currentAssets.length)*100)):0;

  const todo=work.filter(w=>['open','review required','review_required'].includes(state(w.status)));
  const progress=work.filter(w=>['in progress','in_progress'].includes(state(w.status)));
  const done=work.filter(w=>['done','completed','closed'].includes(state(w.status)));
  const failed=work.filter(w=>['blocked','failed','error','cancelled'].includes(state(w.status)));

  const social=integrations.filter(x=>/metricool|facebook|instagram|linkedin|youtube|tiktok|threads|social/i.test(`${x.code} ${x.name} ${x.category}`));
  const media=integrations.filter(x=>/heygen|synthesia|canva|prompt|video|media/i.test(`${x.code} ${x.name} ${x.category}`));
  const voice=integrations.filter(x=>/vapi|voice|aria|yay|telephony/i.test(`${x.code} ${x.name} ${x.category}`));

  return <div className="bcShell">
    <aside className="bcRail">
      <div className="bcMiniBrand">
        <Image src="/orvia-oversight-logo.png" alt="ORVIA Oversight" width={170} height={48} priority />
      </div>
      <nav>
        <a className="active"><Activity size={17}/>Overview</a>
        <a><Palette size={17}/>Brand DNA</a>
        <a><Share2 size={17}/>Socials</a>
        <a><Video size={17}/>Media</a>
        <a><Mic2 size={17}/>Voice</a>
        <a><Globe2 size={17}/>Websites</a>
        <a><FileImage size={17}/>Assets</a>
        <a><Megaphone size={17}/>Campaigns</a>
      </nav>
      <button className="bcCreate"><WandSparkles size={16}/>Create content</button>
      <div className="bcRailFoot">
        <span>IRIS conducts</span>
        <b>Brand Control</b>
        <small>One brand. One source. Every surface.</small>
      </div>
    </aside>

    <main className="bcMain">
      <section className="bcHero">
        <div className="bcHeroTop">
          <div>
            <small>ORVIA OVERSIGHT · INTERNAL BRAND OPERATIONS</small>
            <h1>Brand Control</h1>
          </div>
          <select value={channel} onChange={e=>setChannel(e.target.value)} aria-label="Channel filter">
            <option>All channels</option>
            <option>LinkedIn</option>
            <option>Facebook</option>
            <option>Instagram</option>
            <option>YouTube</option>
            <option>Voice / ARIA</option>
            <option>Websites</option>
          </select>
        </div>

        <div className="bcTabs">
          <button className={tab==='overview'?'active':''} onClick={()=>setTab('overview')}>Overview</button>
          <button className={tab==='create'?'active':''} onClick={()=>setTab('create')}>Create</button>
          <button className={tab==='analytics'?'active':''} onClick={()=>setTab('analytics')}>Analytics</button>
        </div>

        {tab==='overview' && <>
          <section className="bcStatusCard">
            <div className="bcHealthRing" style={{'--health':`${health*3.6}deg`} as CSSProperties}><span>{health}%</span></div>
            <div>
              <h2>{reviewAssets.length ? 'Brand health needs attention' : 'Brand estate is aligned'}</h2>
              <p>{currentAssets.length} controlled surfaces · {reviewAssets.length} need reconciliation or verification</p>
            </div>
            <div className="bcLiveBadge"><span/>Live</div>
          </section>

          <section className="bcBoardWrap">
            <div className="bcBoardHead">
              <div><small>IRIS → BRAND-01</small><h2>Actions</h2></div>
              <button><Plus size={15}/>New brief</button>
            </div>

            <div className="bcBoard">
              <div className="bcColumn todo">
                <header><span/>To do <b>{todo.length}</b></header>
                <div>{todo.length?todo.map(item=><WorkCard key={item.id} item={item}/>):<EmptyCard label="Your to-do list will live here"/>}</div>
              </div>
              <div className="bcColumn progress">
                <header><span/>In progress <b>{progress.length}</b></header>
                <div>{progress.length?progress.map(item=><WorkCard key={item.id} item={item}/>):<EmptyCard label="Tasks in progress land here"/>}</div>
              </div>
              <div className="bcColumn done">
                <header><span/>Done <b>{done.length}</b></header>
                <div>{done.length?done.map(item=><WorkCard key={item.id} item={item}/>):<EmptyCard label="Verified completions appear here"/>}</div>
              </div>
              <div className="bcColumn failed">
                <header><span/>Failed / blocked <b>{failed.length}</b></header>
                <div>{failed.length?failed.map(item=><WorkCard key={item.id} item={item}/>):<EmptyCard label="No failed or blocked work"/>}</div>
              </div>
            </div>
          </section>

          <section className="bcNetworkGrid">
            <article><div className="bcSectionTitle"><Share2 size={17}/><span><b>Social</b><small>Publishing & analytics</small></span></div><div className="bcChipGrid">{social.length?social.map(x=><IntegrationChip key={x.code} row={x}/>):<IntegrationChip row={{code:'social-none',name:'Social networks',status:'NOT CONNECTED'}}/>}</div></article>
            <article><div className="bcSectionTitle"><Video size={17}/><span><b>Media</b><small>Generation & production</small></span></div><div className="bcChipGrid">{media.length?media.map(x=><IntegrationChip key={x.code} row={x}/>):<IntegrationChip row={{code:'media-none',name:'Media tools',status:'NOT VERIFIED'}}/>}</div></article>
            <article><div className="bcSectionTitle"><Mic2 size={17}/><span><b>Voice</b><small>ARIA & telephony</small></span></div><div className="bcChipGrid">{voice.length?voice.map(x=><IntegrationChip key={x.code} row={x}/>):<IntegrationChip row={{code:'voice-none',name:'Voice platform',status:'NOT VERIFIED'}}/>}</div></article>
          </section>
        </>}

        {tab==='create' && <section className="bcCreatePanel">
          <div className="bcCreateIcon"><WandSparkles/></div>
          <small>CREATE WITH IRIS</small>
          <h2>Start with the message, not the channel.</h2>
          <p>Give IRIS the outcome you want. Brand Control will attach the current ORVIA identity, approved claims, assets, channel rules and approval requirements before production.</p>
          <textarea placeholder="Example: Prepare a launch pack for Witness Room across LinkedIn, Facebook, website and two 10-second explainer videos."/>
          <button><Sparkles size={16}/>Build controlled brief</button>
        </section>}

        {tab==='analytics' && <section className="bcAnalyticsPanel">
          <div className="bcCreateIcon"><BarChart3/></div>
          <small>REAL DATA ONLY</small>
          <h2>Analytics will populate from verified connections.</h2>
          <p>Brand Control will not invent reach, followers, conversions or campaign performance. Network data appears only when the relevant connector is verified.</p>
          <div className="bcAnalyticsStats">
            <div><b>{social.filter(x=>ok(x.status)).length}</b><span>verified social connections</span></div>
            <div><b>{reviewAssets.length}</b><span>estate exceptions</span></div>
            <div><b>{work.filter(x=>x.approval_required).length}</b><span>approval-gated items</span></div>
          </div>
        </section>}
      </section>
    </main>
  </div>;
}
