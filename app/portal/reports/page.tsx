import { UnifiedShell } from '@/components/UnifiedShell';
import { getPlatformContext } from '@/lib/platform-context';

export const dynamic='force-dynamic';

export default async function ReportsPage(){
  const context=await getPlatformContext();
  return <UnifiedShell context={context} title="Reports & KPI">
    <section className="portalHero compact"><div><small>CONTROLLED OUTPUTS</small><h2>Downloadable reports built from verified data.</h2><p>Every output uses the approved ORVIA format and only the service data authorised for this user.</p></div></section>
    <section className="portalSection">
      <div className="portalSectionHead"><div><small>REPORT LIBRARY</small><h3>Available outputs</h3></div></div>
      <div className="portalReportGrid">
        <article><b>Workspace summary</b><p>Signed-in identity, role, services and enabled modules.</p><div><a href="/api/platform/report?format=json">Download JSON</a><a href="/api/platform/report?format=csv">Download CSV</a></div></article>
        <article><b>KPI pack</b><p>Reserved for verified service KPI feeds.</p><span>Adapter pending</span></article>
        <article><b>Service report</b><p>Service-specific report packs populate from the module in use.</p><span>Adapter pending</span></article>
      </div>
    </section>
  </UnifiedShell>;
}
