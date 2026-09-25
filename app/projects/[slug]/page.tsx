import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Github, Globe2, ServerCog, ShieldCheck, Database, LockKeyhole } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Topbar } from '@/components/Topbar';
import { loadOrviaAsset } from '@/lib/asset-registry';

function accentClass(key:string|null){
 return key==='r'?'visual-teal':key==='v'?'visual-gold':key==='i'?'visual-purple':key==='a'?'visual-orange':'visual-navy';
}

function clean(value:string|null|undefined){return value?value.replaceAll('_',' '):'Not recorded';}

export default async function ProjectPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const {asset}=await loadOrviaAsset(slug);
 if(!asset) notFound();

 return <Shell><Topbar title={asset.display_name}/><div className="pageWrap projectRoom">
  <Link href="/projects" className="backLink"><ArrowLeft size={15}/> ORVIA landscape</Link>

  <section className={'projectHero '+accentClass(asset.accent_key)}>
   <div className="projectHeroCopy">
    <div className="eyebrow">{clean(asset.asset_type).toUpperCase()}</div>
    <div className="projectHeroMark">{(asset.accent_key||'o').toUpperCase()}</div>
    <h2>{asset.display_name}</h2>
    <p>{asset.notes||'Controlled ORVIA asset recorded in the live Asset Registry.'}</p>
    <div className="projectHeroActions">
     {asset.canonical_url&&<a href={asset.canonical_url} target="_blank" rel="noreferrer"><Globe2 size={16}/> Open live surface <ExternalLink size={13}/></a>}
     {asset.github_repo&&<a href={'https://github.com/'+asset.github_repo} target="_blank" rel="noreferrer" className="secondaryAction"><Github size={16}/> GitHub <ExternalLink size={13}/></a>}
    </div>
   </div>
   <div className="projectHeroPreview">
    <div className="projectWindowBar large"><i/><i/><i/><span>{asset.canonical_domain||asset.deployment_project_name||'ORVIA ASSET'}</span></div>
    <div className="previewBody"><small>REGISTRY STATUS</small><strong>{asset.estate_disposition.toUpperCase()}</strong><p>{clean(asset.verification_status)}</p></div>
   </div>
  </section>

  <section className="projectRoomGrid">
   <article className="panel">
    <div className="panelHead"><div><span>TECHNICAL IDENTITY</span><h3>Where this asset lives</h3></div><ServerCog size={18}/></div>
    <div className="panelBody projectList">
      <div><b>01</b><span>Domain: {asset.canonical_domain||'Not recorded'}</span></div>
      <div><b>02</b><span>GitHub: {asset.github_repo||'Not recorded'}</span></div>
      <div><b>03</b><span>Vercel: {asset.deployment_project_name||'Not recorded'}</span></div>
      <div><b>04</b><span>Production branch: {asset.production_branch||'Not recorded'}</span></div>
    </div>
   </article>

   <article className="panel">
    <div className="panelHead"><div><span>CONTROL STATE</span><h3>How ORVIA treats it</h3></div><ShieldCheck size={18}/></div>
    <div className="panelBody projectList">
      <div><b>01</b><span>Lifecycle: {clean(asset.lifecycle_status)}</span></div>
      <div><b>02</b><span>Verification: {clean(asset.verification_status)}</span></div>
      <div><b>03</b><span>Authority ceiling: {asset.authority_level}</span></div>
      <div><b>04</b><span>Sensitivity: {asset.sensitivity_class}</span></div>
    </div>
   </article>
  </section>

  <section className="twoCol spaced">
   <article className="panel">
    <div className="panelHead"><div><span>DATA / AUTOMATION</span><h3>Operational boundaries</h3></div><Database size={18}/></div>
    <div className="panelBody">
      <p className="projectLongCopy">Public surface: <b>{asset.public_surface?'Yes':'No'}</b><br/>Automation enabled: <b>{asset.automation_enabled?'Yes':'No'}</b><br/>Parent asset: <b>{asset.parent_asset_key||'None'}</b></p>
    </div>
   </article>
   <article className="panel">
    <div className="panelHead"><div><span>IDENTITY CONTROL</span><h3>Canonical versus desired state</h3></div><LockKeyhole size={18}/></div>
    <div className="panelBody">
      <p className="projectLongCopy">Current deployment project: <b>{asset.deployment_project_name||'Not recorded'}</b><br/>Desired deployment project: <b>{asset.desired_deployment_project_name||'Not recorded'}</b></p>
      <div className="projectStatusLarge">{asset.estate_disposition.toUpperCase()}</div>
    </div>
   </article>
  </section>
 </div></Shell>
}
