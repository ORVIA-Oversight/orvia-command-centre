import { Shell } from '@/components/Shell';
import { Topbar } from '@/components/Topbar';
import { CheckCircle2, CircleAlert, Send, ShieldCheck, Share2 } from 'lucide-react';

function status(ok: boolean) {
  return ok ? { label: 'CONFIGURED', icon: CheckCircle2 } : { label: 'NOT CONNECTED', icon: CircleAlert };
}

export default function SocialPage() {
  const metricoolToken = Boolean(process.env.METRICOOL_USER_TOKEN);
  const metricoolUser = Boolean(process.env.METRICOOL_USER_ID);
  const metricoolBrand = Boolean(process.env.METRICOOL_BLOG_ID);
  const runtimeReady = metricoolToken && metricoolUser && metricoolBrand;
  const runtime = status(runtimeReady);
  const RuntimeIcon = runtime.icon;

  return <Shell>
    <Topbar title="Social Command" eyebrow="ORVIA OVERSIGHT LTD · CONTROLLED SOCIAL WORKSPACE"/>
    <div className="pageWrap">
      <section className="productionHero">
        <div>
          <div className="eyebrow">SOCIAL · METRICOOL GATEWAY</div>
          <h2>One social control point. Human-approved release.</h2>
          <p>SOCIAL prepares platform content. VERA checks facts. CRUCIBLE challenges consequential output. John approves. Metricool is the preferred distribution and analytics gateway once runtime credentials and social accounts are connected.</p>
        </div>
        <div className="humanAuthority"><ShieldCheck size={18}/><div><b>No autonomous publishing</b><span>Publishing in John's name or consequential brand content remains approval-gated.</span></div></div>
      </section>

      <div className="productionGrid">
        <section className="productionPanel">
          <div className="productionPanelHead"><div><small>CONNECTION STATUS</small><h3>Metricool runtime</h3></div><RuntimeIcon size={18}/></div>
          <div className={`approvalState ${runtimeReady ? 'ok' : 'warn'}`}>
            <RuntimeIcon/>
            <div><b>{runtime.label}</b><span>{runtimeReady ? 'Required server-side Metricool variables are present.' : 'Add the required variables in Vercel before Command can call Metricool directly.'}</span></div>
          </div>
          <div className="gateList">
            <div><span>METRICOOL_USER_TOKEN</span><b>{metricoolToken ? 'PRESENT' : 'MISSING'}</b></div>
            <div><span>METRICOOL_USER_ID</span><b>{metricoolUser ? 'PRESENT' : 'MISSING'}</b></div>
            <div><span>METRICOOL_BLOG_ID</span><b>{metricoolBrand ? 'PRESENT' : 'MISSING'}</b></div>
          </div>
          <div className="commandNotice" style={{marginTop:14}}><CircleAlert size={16}/><div><b>Secrets stay server-side</b><div>This page checks only whether variables exist. It never prints secret values.</div></div></div>
        </section>

        <section className="productionPanel">
          <div className="productionPanelHead"><div><small>OPERATING CHAIN</small><h3>Every social release</h3></div><Share2 size={18}/></div>
          <div className="workOrderRows">
            <div><small>1</small><p>IRIS routes content or reputation work to SOCIAL.</p></div>
            <div><small>2</small><p>SOCIAL prepares the platform-native draft and media brief.</p></div>
            <div><small>3</small><p>VERA verifies factual claims, prices and product status.</p></div>
            <div><small>4</small><p>CRUCIBLE challenges consequential or sensitive output.</p></div>
            <div><small>5</small><p>John approves the exact version and release window.</p></div>
            <div><small>6</small><p>Metricool schedules/publishes only after the approval gate.</p></div>
          </div>
        </section>
      </div>

      <section className="productionPanel" style={{marginTop:16}}>
        <div className="productionPanelHead"><div><small>CHANNEL ONBOARDING</small><h3>What to connect in Metricool</h3></div><Send size={18}/></div>
        <p>Connect the ORVIA channels you want Command to manage inside the same Metricool brand. Typical routes are LinkedIn, Facebook, Instagram, TikTok, YouTube, X, Threads, Bluesky and Google Business Profile.</p>
        <div className="notice"><strong>Current rule:</strong> until a network is visibly connected in Metricool and the Command runtime is verified, treat that channel as NOT VERIFIED and do not claim automatic publishing is available.</div>
      </section>
    </div>
  </Shell>;
}
