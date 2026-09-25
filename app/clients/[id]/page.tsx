import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Building2, ExternalLink, Globe2, PhoneCall } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Topbar } from '@/components/Topbar';
import { isInternalOrviaOrganisation, loadClientOrganisation, organisationName } from '@/lib/client-registry';

export const dynamic='force-dynamic';
export const revalidate=0;

export default async function ClientWorkspace({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const data=await loadClientOrganisation(id);
 const org=data.organisation;
 if(!org||isInternalOrviaOrganisation(org)) notFound();

 return <Shell><Topbar title={organisationName(org)} eyebrow="ORVIA · CLIENT WORKSPACE · FOUNDER VIEW"/><div className="pageWrap">
  <Link href="/clients" className="backLink"><ArrowLeft size={15}/> Client workspaces</Link>

  <section className="pageIntro">
   <div className="eyebrow">MASTER CLIENT RECORD</div>
   <h2>{organisationName(org)}</h2>
   <p>{org.legal_name&&org.trading_name&&org.legal_name!==org.trading_name?org.legal_name+' · ':''}{org.primary_email||'No primary email recorded'}{org.primary_phone?' · '+org.primary_phone:''}. External client access remains disabled until tenant controls and authentication are verified.</p>
  </section>

  <section className="metricsGrid">
    <article className="metricCard tone-teal"><small>VOICE ACCOUNTS</small><strong>{data.voiceAccounts.length}</strong><span>Linked through the master organisation ID</span></article>
    <article className="metricCard tone-orange"><small>WEB PROJECTS</small><strong>{data.webProjects.length}</strong><span>{data.webCustomers.length} linked Web customer record{data.webCustomers.length===1?'':'s'}</span></article>
    <article className="metricCard tone-purple"><small>ORGANISATION STATUS</small><strong>{String(org.status||'unknown').toUpperCase()}</strong><span>{org.organisation_type||'Organisation type not recorded'}</span></article>
    <article className="metricCard tone-gold"><small>COMPANY NUMBER</small><strong>{org.company_number||'—'}</strong><span>Master client identity</span></article>
  </section>

  <section className="twoCol spaced">
   <article className="panel">
    <div className="panelHead"><div><span>ORVIA VOICE</span><h3>Voice service</h3></div><PhoneCall size={18}/></div>
    <div className="panelBody">
      {data.voiceAccounts.length?<div className="activityList">{data.voiceAccounts.map((account:any)=><div key={account.id}><PhoneCall size={16}/><p><b>{account.service_plan||'Voice account'}</b><small>{String(account.status).replaceAll('_',' ')} · {account.provider||'Provider not recorded'}{account.go_live_at?' · live '+new Date(account.go_live_at).toLocaleDateString('en-GB'):''}</small></p></div>)}</div>:<div className="workspaceEmpty"><PhoneCall size={22}/><b>No Voice account attached</b><span>No Voice service is inferred.</span></div>}
    </div>
   </article>

   <article className="panel">
    <div className="panelHead"><div><span>ORVIA WEB</span><h3>Website projects</h3></div><Globe2 size={18}/></div>
    <div className="panelBody">
      {data.webProjects.length?<div className="activityList">{data.webProjects.map((project:any)=><div key={project.id}><Globe2 size={16}/><p><b>{project.domain||project.project_code||'Web project'}</b><small>{String(project.state||'unknown').replaceAll('_',' ')}{project.package?' · '+project.package:''}</small><span className="clientInlineLinks">{project.preview_url&&<a href={project.preview_url} target="_blank" rel="noreferrer">Preview <ExternalLink size={11}/></a>}{project.live_url&&<a href={project.live_url} target="_blank" rel="noreferrer">Live <ExternalLink size={11}/></a>}</span></p></div>)}</div>:<div className="workspaceEmpty"><Building2 size={22}/><b>No Web project attached</b><span>No Web work is inferred.</span></div>}
    </div>
   </article>
  </section>

  <section className="panel spaced">
    <div className="panelHead"><div><span>CLIENT CONTROL</span><h3>Current recorded identity</h3></div><Building2 size={18}/></div>
    <div className="panelBody projectList">
      <div><b>01</b><span>Primary email: {org.primary_email||'Not recorded'}</span></div>
      <div><b>02</b><span>Primary phone: {org.primary_phone||'Not recorded'}</span></div>
      <div><b>03</b><span>Legal name: {org.legal_name||'Not recorded'}</span></div>
      <div><b>04</b><span>Trading name: {org.trading_name||'Not recorded'}</span></div>
    </div>
  </section>

  {data.errors.length>0&&<div className="workspaceEmpty large"><b>Some client service data could not be loaded</b><span>{data.errors.join(' · ')}</span></div>}
 </div></Shell>
}
