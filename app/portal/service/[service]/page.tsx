import { UnifiedShell } from '@/components/UnifiedShell';
import { getPlatformContext } from '@/lib/platform-context';
import { notFound } from 'next/navigation';

export const dynamic='force-dynamic';

export default async function ServicePage({params}:{params:{service:string}}){
  const context=await getPlatformContext();
  const key=params.service.toLowerCase();
  const module=context.modules.find(m=>m.id===key||m.serviceCodes?.includes(key));
  if(!module) notFound();

  return <UnifiedShell context={context} title={module.label}>
    <section className="portalHero compact"><div><small>AUTHORISED SERVICE MODULE</small><h2>{module.label}</h2><p>{module.description}</p></div></section>
    <div className="serviceLayout">
      <section className="portalSection"><div className="portalSectionHead"><div><small>ACTIVITY</small><h3>Current service state</h3></div></div><div className="emptyVerified">No live service activity adapter is connected to this module yet. ORVIA will not invent activity.</div></section>
      <section className="portalSection"><div className="portalSectionHead"><div><small>RESULTS</small><h3>Reports & KPI</h3></div></div><div className="emptyVerified">Verified service KPIs and downloadable outputs will appear here when this module's adapter is connected.</div></section>
    </div>
  </UnifiedShell>;
}
