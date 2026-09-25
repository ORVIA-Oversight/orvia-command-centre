import Link from 'next/link';
import { ArrowRight, Building2, Users } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Topbar } from '@/components/Topbar';
import { isInternalOrviaOrganisation, loadClientRegistry, organisationName, servicesForOrganisation } from '@/lib/client-registry';

export const dynamic='force-dynamic';
export const revalidate=0;

export default async function ClientsPage(){
 const registry=await loadClientRegistry();
 const clients=registry.organisations.filter(org=>!isInternalOrviaOrganisation(org));

 return <Shell><Topbar title="Client Workspaces" eyebrow="ORVIA · MASTER CLIENT REGISTRY"/><div className="pageWrap">
  <section className="pageIntro">
   <div className="eyebrow">ONE CLIENT IDENTITY</div>
   <h2>One organisation. Every ORVIA service underneath it.</h2>
   <p>Client Workspaces are now driven by the master organisation register, not a single product database. Web, Voice and future controlled services attach to the same organisation record.</p>
  </section>

  <section className="workspaceClientCards">{clients.map(org=>{
    const services=servicesForOrganisation(org.id,registry);
    const serviceNames=[
      services.voice.length?'Voice':null,
      services.webCustomers.length||services.webProjects.length?'Web':null
    ].filter(Boolean);
    const workCount=services.webProjects.length+services.voice.length;
    return <Link href={'/clients/'+org.id} className="workspaceClientCard" key={org.id}>
      <div className="clientCardIcon"><Building2 size={20}/></div>
      <div>
        <small>CLIENT ORGANISATION</small>
        <h3>{organisationName(org)}</h3>
        <p>{serviceNames.length?serviceNames.join(' · '):'No service attached yet'} · {workCount} service/project record{workCount===1?'':'s'}</p>
      </div>
      <ArrowRight size={17}/>
    </Link>
  })}</section>

  {!clients.length&&<div className="workspaceEmpty large"><Users size={26}/><b>No external client organisations are recorded yet</b><span>The internal ORVIA organisation is excluded deliberately. New clients will appear here once they are created in the master organisation register.</span></div>}

  {registry.errors.length>0&&<div className="workspaceEmpty large"><b>Some client data could not be loaded</b><span>{registry.errors.join(' · ')}</span></div>}
 </div></Shell>
}
