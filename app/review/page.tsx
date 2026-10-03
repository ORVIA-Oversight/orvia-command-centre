import { UnifiedShell } from '@/components/UnifiedShell';
import { getPlatformContext } from '@/lib/platform-context';
import { loadReviewMatter } from '@/lib/review-engine';
import { ReviewPracticeComposer } from '@/components/ReviewPracticeComposer';
import styles from './review.module.css';

export const dynamic='force-dynamic';

export default async function ReviewPage({searchParams}:{searchParams?:{matter?:string}}){
  const matterRef=(searchParams?.matter||'ORV-REV-DEMO-001').trim();
  const [context,data]=await Promise.all([getPlatformContext(),loadReviewMatter(matterRef)]);
  const matter=data?.matter;
  if(!matter){
    return <UnifiedShell context={context} title="ORVIA Review Engine"><div className={styles.page}><section className={styles.hero}><div><div className={styles.eyebrow}>ORVIA REVIEW ENGINE</div><h2>Review workspace unavailable.</h2><p>The backend is not currently returning the synthetic practice matter.</p></div></section></div></UnifiedShell>;
  }

  const evidence=data?.evidence??[];
  const issues=data?.issues??[];
  const gaps=data?.gaps??[];
  const runs=data?.runs??[];
  const totalPages=evidence.reduce((n:number,e:any)=>n+(Number(e.page_count)||0),0);
  const contradictions=issues.reduce((n:number,i:any)=>n+((i.conflicting_evidence?.length)||0),0);
  const findings=Array.isArray(data?.report?.findings)?data.report.findings:[];

  return <UnifiedShell context={context} title="ORVIA Review Engine">
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <div>
            <div className={styles.eyebrow}>ORVIA REVIEW · MATTER {matter.matter_ref}</div>
            <h2>{matter.title}</h2>
            <p>{matter.scope}</p>
          </div>
          <span className={styles.statusPill}>{matter.current_stage.toUpperCase()} · {matter.is_demo?'SYNTHETIC PRACTICE':'LIVE MATTER'}</span>
        </div>
        <div className={styles.progress}>
          <div><div className={styles.track}><span style={{width:`${matter.progress_percent}%`}}/></div></div>
          <strong>{matter.progress_percent}%</strong>
        </div>
      </section>

      <section className={styles.grid4}>
        <article className={styles.metric}><small>EVIDENCE</small><b>{evidence.length}</b><span>{totalPages} pages indexed</span></article>
        <article className={styles.metric}><small>LIVE ISSUES</small><b>{issues.length}</b><span>Testable questions under review</span></article>
        <article className={styles.metric}><small>CONTRADICTIONS</small><b>{contradictions}</b><span>Source-linked conflicts</span></article>
        <article className={styles.metric}><small>OPEN GAPS</small><b>{gaps.filter((g:any)=>g.status==='open').length}</b><span>Missing evidence or unresolved points</span></article>
      </section>

      <ReviewPracticeComposer/>

      <section className={styles.two}>
        <article className={styles.card}>
          <div className={styles.cardHead}><div><small>ISSUE MATRIX</small><h3>What actually needs answering</h3></div><span>{issues.length} issues</span></div>
          <div className={styles.cardBody}>
            {issues.map((i:any)=><div className={styles.issue} key={i.id}>
              <div className={styles.issueTop}><b>{i.issue_ref} · {i.question}</b><span className={styles.conf}>{i.confidence??'—'}% confidence</span></div>
              <p>{i.provisional_view||'No provisional view yet.'}</p>
              <div className={styles.issueMeta}><span className={styles.tag}>{i.status}</span><span className={styles.tag}>{i.significance}</span><span className={styles.tag}>{i.supporting_evidence?.length||0} supporting</span><span className={styles.tag}>{i.conflicting_evidence?.length||0} conflicting</span></div>
            </div>)}
          </div>
        </article>

        <article className={styles.card}>
          <div className={styles.cardHead}><div><small>AI WORKFORCE</small><h3>Parallel review workers</h3></div><span>{runs.length} runs</span></div>
          <div className={styles.cardBody}>
            {runs.slice(0,8).map((r:any)=><div className={styles.worker} key={r.id}>
              <span className={`${styles.dot} ${r.status==='running'||r.status==='queued'?styles.running:''}`}/>
              <div><b>{r.worker}</b><small>{r.task}</small></div>
              <em>{String(r.status).toUpperCase()}</em>
            </div>)}
          </div>
        </article>
      </section>


      {findings.length>0 && <section className={styles.card}>
        <div className={styles.cardHead}><div><small>ORVIA FOUNDING PRINCIPLES</small><h3>Findings through Observation · Reflection · Visibility · Insight · Accountability</h3></div><span>{findings.length} findings</span></div>
        <div className={styles.cardBody}>
          <div className={styles.findingGrid}>
            {findings.map((f:any)=><article className={styles.findingCard} key={f.ref||f.title}>
              <div className={styles.findingTitle}><div><small>{f.ref||'FINDING'}</small><h3>{f.title}</h3></div><span>{f.visibility||'OPEN'}</span></div>
              <div className={styles.principle}><b>Observation</b><p>{f.observation||'—'}</p></div>
              <div className={styles.principle}><b>Reflection</b><p>{f.reflection||'—'}</p></div>
              <div className={styles.principle}><b>Visibility</b><p>{f.visibility||'—'}</p></div>
              <div className={styles.principle}><b>Insight</b><p>{f.insight||'—'}</p></div>
              <div className={styles.principle}><b>Accountability</b><p>{f.accountability||'—'}</p></div>
            </article>)}
          </div>
        </div>
      </section>}

      <section className={styles.two}>
        <article className={styles.card}>
          <div className={styles.cardHead}><div><small>HIVE · EVIDENCE</small><h3>Source-linked material</h3></div><span>{totalPages} pages</span></div>
          <div className={styles.cardBody}>
            {evidence.map((e:any)=><div className={styles.evidenceRow} key={e.id}>
              <code>{e.evidence_ref}</code>
              <div><b>{e.title}</b><small>{e.summary||e.source_name||'Source retained in HIVE'}</small></div>
              <span>{String(e.status).toUpperCase()}</span>
            </div>)}
          </div>
        </article>

        <article className={styles.card}>
          <div className={styles.cardHead}><div><small>NEXT HUMAN ACTION</small><h3>Human control stays visible</h3></div></div>
          <div className={styles.cardBody}>
            <div className={styles.next}><strong>{matter.next_human_action||'No human action currently required'}</strong><span>AI can prepare, retrieve, compare, challenge and draft. Material findings remain visible for accountable review.</span></div>
            <div className={styles.issue}>
              <b>Report status</b>
              <p>{data?.report?.executive_summary||'The draft report has not yet been assembled.'}</p>
              <div className={styles.issueMeta}><span className={styles.tag}>DEREK {String(data?.report?.derek_status||'pending').toUpperCase()}</span><span className={styles.tag}>HUMAN {String(data?.report?.human_review_status||'pending').toUpperCase()}</span></div>
            </div>
          </div>
        </article>
      </section>
    </div>
  </UnifiedShell>;
}
