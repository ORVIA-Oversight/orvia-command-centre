import { Shell } from '@/components/Shell';
import { Topbar } from '@/components/Topbar';

const modules = [
  ['CAPTURE', 'ARIA / forms / integrations', 'Preserve the original before interpretation.'],
  ['IRIS', 'Deterministic orchestration', 'State, ownership, timers, acknowledgement, escalation and gates.'],
  ['HIVE', 'Evidence + provenance', 'Originals, versions, assertions, contradictions, dissent and gaps.'],
  ['VITA', 'Assurance', 'Tests completeness, control and whether the evidence supports the process.'],
  ['HUMAN', 'Decision', 'Authorised people interpret, challenge, decide and own responsibility.'],
  ['VERA', 'Verification', 'Separates claimed completion from verified completion.'],
  ['RECHECK', 'Effectiveness + learning', 'Establish whether the action actually worked and remains effective.'],
];

const rules = [
  'AI has no write path to case or action state.',
  'Protection and statutory action never wait for ORVIA.',
  'Delivery is not acknowledgement.',
  'Completion claimed is not verification.',
  'Verification is not effectiveness.',
  'Precaution is not a factual finding.',
  'Serious Concern keeps Protection and Inquiry separate.',
  'The full workflow must function with AI switched off.',
];

export default function V2FoundationPage() {
  return (
    <Shell>
      <Topbar title="ORVIA V2 · Foundation" eyebrow="ORVIA OVERSIGHT LTD · CONTROLLED BUILD" />
      <div className="pageWrap">
        <section className="pageIntro">
          <div className="eyebrow">CONNECTED EVIDENCE · ACCOUNTABILITY · ASSURANCE</div>
          <h2>Capture → Connect → Assure → Decide → Verify → Recheck / Learn</h2>
          <p>
            This is the controlled V2 foundation. The product keeps its named disciplines, while the runtime is deliberately
            simple: one modular application, a dedicated PostgreSQL evidence store, durable workers and replaceable adapters.
          </p>
        </section>

        <div className="metricsGrid">
          <div className="metricCard tone-teal"><small>RUNTIME</small><strong>1</strong><span>Modular application</span></div>
          <div className="metricCard tone-gold"><small>AI DECISION RIGHTS</small><strong>0</strong><span>Human authority preserved</span></div>
          <div className="metricCard tone-purple"><small>SERIOUS CONCERN TRACKS</small><strong>2</strong><span>Protection + Inquiry</span></div>
          <div className="metricCard tone-orange"><small>PRODUCTION DATA STORE</small><strong>HOLD</strong><span>Dedicated V2 store required</span></div>
        </div>

        <section className="panel spaced">
          <div className="panelHead"><div><span>CANONICAL FLOW</span><h3>V2 responsibilities</h3></div></div>
          <div className="panelBody">
            <div className="systemsGrid">
              {modules.map(([name, role, description]) => (
                <div className="systemRow" key={name}>
                  <div><b>{name} · {role}</b><small>{description}</small></div>
                  <span className="statusBadge status-teal">DEFINED</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="twoCol spaced">
          <div className="panel">
            <div className="panelHead"><div><span>CONSTITUTION</span><h3>Hard boundaries</h3></div></div>
            <div className="panelBody activityList">
              {rules.map((rule, index) => <div key={rule}><b>{String(index + 1).padStart(2, '0')}</b><p>{rule}</p></div>)}
            </div>
          </div>
          <div className="panel">
            <div className="panelHead"><div><span>SERIOUS CONCERN</span><h3>Parallel tracks</h3></div></div>
            <div className="panelBody">
              <div className="systemRow"><div><b>PROTECTION</b><small>What must happen now. Never gated by ORVIA or inquiry completion.</small></div><span className="statusBadge status-gold">PARALLEL</span></div>
              <div className="systemRow spaced"><div><b>INQUIRY</b><small>What can actually be established. Evidence, alternatives, contradictions, gaps and Known Then / Known Now.</small></div><span className="statusBadge status-purple">PARALLEL</span></div>
              <p className="mutedText spaced">Precautionary controls remain labelled as precautions unless and until an authorised human decision is supported by evidence.</p>
            </div>
          </div>
        </section>

        <p className="footerNote">ORVIA V2 foundation · not yet connected to a production V2 customer evidence database</p>
      </div>
    </Shell>
  );
}
