import Link from 'next/link';
import type { PlatformContext } from '@/lib/platform-context';

export function PortalDashboard({context}:{context:PlatformContext}){
  const serviceModules=context.modules.filter(x=>x.serviceCodes?.length);
  return <div className="portalStack">
    <section className="portalHero">
      <div>
        <small>YOUR ORVIA</small>
        <h2>{context.organisation||'Your workspace, simplified.'}</h2>
        <p>One secure ORVIA interface. What appears here is determined by your role and authorised services. IRIS coordinates the work behind the scenes; your workspace stays lean.</p>
      </div>
      <div className="portalHeroPanel">
        <span>IDENTITY</span><b>{context.email||'Verified user'}</b>
        <span>ROLE</span><b>{context.role||'Customer'}</b>
        <span>SERVICES</span><b>{context.services.length?context.services.join(' · '):'Authorised services pending'}</b>
      </div>
    </section>

    <section className="portalSection">
      <div className="portalSectionHead"><div><small>YOUR SERVICES</small><h3>What you can use</h3></div><span>{serviceModules.length} service module{serviceModules.length===1?'':'s'}</span></div>
      <div className="portalModuleGrid">
        {context.modules.filter(m=>m.id!=='workspace').map(module=><Link href={module.href} className={"portalModule tone-"+module.accent} key={module.id}>
          <span className="moduleAccent"/><div><small>{module.serviceCodes?.length?'SERVICE':'WORKSPACE'}</small><b>{module.label}</b><p>{module.description}</p></div><strong>Open →</strong>
        </Link>)}
      </div>
    </section>

    <section className="portalSection">
      <div className="portalSectionHead"><div><small>RESULTS</small><h3>Reports & KPI</h3></div></div>
      <div className="portalResults">
        <div><b>Verified results only</b><p>Service KPIs will populate from each connected service adapter. Nothing is estimated or fabricated.</p></div>
        <Link href="/portal/reports">Open reports</Link>
      </div>
    </section>
  </div>;
}