import Link from 'next/link';
import { UnifiedShell } from '@/components/UnifiedShell';
import { getPlatformContext } from '@/lib/platform-context';

export const dynamic='force-dynamic';

export default async function PortalPage(){
  const context=await getPlatformContext();
  return <UnifiedShell context={context} title="Your ORVIA Workspace">
    <section className="portalHero">
      <div>
        <small>YOUR ORVIA</small>
        <h2>{context.organisation||'One workspace, shaped around your services.'}</h2>
        <p>The same ORVIA system is used across the platform. Your role and authorised services determine the modules, evidence and results you see.</p>
      </div>
      <div className="portalIdentity">
        <span>Signed in as</span><b>{context.email||'Verified ORVIA user'}</b>
        <span>Access</span><b>{context.role||'customer'}</b>
        <span>Services</span><b>{context.services.length?context.services.join(' · '):'No service assignment found'}</b>
      </div>
    </section>

    <section className="portalSection">
      <div className="portalSectionHead"><div><small>YOUR MODULES</small><h3>Everything you need, nothing you do not.</h3></div></div>
      <div className="portalModuleGrid">
        {context.modules.map(module=><Link href={module.href} key={module.id} className={'portalModule tone-'+module.accent}>
          <span className="moduleAccent"/>
          <div><small>{module.serviceCodes?.length?'SERVICE':'WORKSPACE'}</small><b>{module.label}</b><p>{module.description}</p></div>
          <strong>Open →</strong>
        </Link>)}
      </div>
    </section>

    <section className="portalSection">
      <div className="portalSectionHead"><div><small>RESULTS</small><h3>Reports & KPI</h3></div></div>
      <div className="portalResults"><div><b>Verified outputs only</b><p>KPIs and reports populate from the service modules connected to your organisation. ORVIA does not invent missing figures.</p></div><Link href="/portal/reports">Open report centre</Link></div>
    </section>
  </UnifiedShell>;
}
