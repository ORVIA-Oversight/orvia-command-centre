import { Bot, CalendarClock, CheckCircle2, CircleAlert, Network, ShieldCheck } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Topbar } from '@/components/Topbar';
import { getServerSupabase } from '@/lib/supabase-server';
import { gatewayConfigured } from '@/lib/agent-gateway';

export const dynamic='force-dynamic';
export const revalidate=0;

async function loadWorkforce(){
  const supabase=getServerSupabase();
  if(!supabase)return {workers:[],schedules:[],jobs:[]};
  const [workers,schedules,jobs]=await Promise.all([
    supabase.from('admin_agents')
      .select('code,display_name,purpose,operating_scope,risk_ceiling,can_write_low_risk,active,metadata')
      .contains('metadata',{external_worker:true})
      .order('display_name',{ascending:true}),
    supabase.from('admin_worker_schedules')
      .select('schedule_code,worker_code,title,description,local_time,timezone,days_of_week,risk_level,approval_required,verification_required,active,last_materialized_on')
      .order('local_time',{ascending:true}),
    supabase.from('admin_brain_jobs')
      .select('id,selected_agent_code,status,schedule_code,created_at,completed_at')
      .not('selected_agent_code','is',null)
      .order('created_at',{ascending:false})
      .limit(100)
  ]);
  return {workers:workers.data??[],schedules:schedules.data??[],jobs:jobs.data??[]};
}

function state(active:boolean, connection?:string){
  if(!active)return {label:'DISABLED',cls:'status-orange'};
  if(connection==='human_activation_required')return {label:'READY FOR ACTIVATION',cls:'status-gold'};
  return {label:'ACTIVE',cls:'status-teal'};
}

export default async function WorkforcePage(){
  const data=await loadWorkforce();
  const configured=gatewayConfigured();
  const openJobs=data.jobs.filter((j:any)=>!['complete','cancelled','failed'].includes(String(j.status||'')));
  const completed=data.jobs.filter((j:any)=>j.status==='complete');
  const verification=data.jobs.filter((j:any)=>j.status==='verification_required');

  return <Shell>
    <Topbar title="AI Workforce" eyebrow="ORVIA · DISTRIBUTED WORK CONTROL"/>
    <div className="pageWrap">
      <section className="pageIntro">
        <div className="eyebrow">IRIS CONDUCTS · WORKERS EXECUTE</div>
        <h2>One controlled workforce, multiple AI providers.</h2>
        <p>External models receive only HIVE-assigned work and permitted context. HIVE remains the work truth, SharePoint remains the document/evidence truth, and consequential release stays human-controlled.</p>
      </section>

      <section className="metricsGrid">
        <article className="metricCard tone-teal"><small>REGISTERED WORKERS</small><strong>{data.workers.length}</strong><span>Microsoft 365, OpenAI, Claude and supporting workers</span></article>
        <article className="metricCard tone-gold"><small>SCHEDULES PREPARED</small><strong>{data.schedules.length}</strong><span>{data.schedules.filter((s:any)=>s.active).length} currently active</span></article>
        <article className="metricCard tone-purple"><small>OPEN WORK</small><strong>{openJobs.length}</strong><span>{verification.length} awaiting verification</span></article>
        <article className="metricCard tone-orange"><small>GATEWAY</small><strong>{configured?'ON':'OFF'}</strong><span>{configured?'Production secret configured':'Human activation still required'}</span></article>
      </section>

      <section className="twoCol">
        <article className="panel">
          <div className="panelHead"><div><span>WORKER REGISTER</span><h3>External execution identities</h3></div><Bot size={18}/></div>
          <div className="panelBody systemsGrid">
            {data.workers.map((w:any)=>{
              const s=state(w.active,w.metadata?.connection_state);
              return <div className="systemRow" key={w.code}><div><b>{w.display_name}</b><small>{w.code} · risk ceiling {w.risk_ceiling}<br/>{w.purpose}</small></div><span className={'statusBadge '+s.cls}>{s.label}</span></div>;
            })}
          </div>
        </article>

        <article className="panel">
          <div className="panelHead"><div><span>DAILY WORK</span><h3>Prepared schedules</h3></div><CalendarClock size={18}/></div>
          <div className="panelBody systemsGrid">
            {data.schedules.map((s:any)=><div className="systemRow" key={s.schedule_code}><div><b>{s.title}</b><small>{s.worker_code} · {String(s.local_time).slice(0,5)} {s.timezone}<br/>{s.verification_required?'VERA verification required':'Routine receipt only'}</small></div><span className={'statusBadge '+(s.active?'status-teal':'status-gold')}>{s.active?'ACTIVE':'HELD'}</span></div>)}
          </div>
        </article>
      </section>

      <section className="twoCol spaced">
        <article className="panel">
          <div className="panelHead"><div><span>CONTROL MODEL</span><h3>What each worker may do</h3></div><ShieldCheck size={18}/></div>
          <div className="panelBody activityList">
            <div><CheckCircle2 size={16}/><p><b>May prepare and draft</b><small>Research, structure, document production, reminders, analysis and low-risk routine work.</small></p></div>
            <div><CheckCircle2 size={16}/><p><b>May return artefacts</b><small>Outputs are referenced in HIVE and stored in the controlled SharePoint evidence estate.</small></p></div>
            <div><CircleAlert size={16}/><p><b>Cannot self-authorise consequential action</b><small>No autonomous publication, spend, contract, safeguarding/clinical/disciplinary decision or evidence deletion.</small></p></div>
          </div>
        </article>

        <article className="panel">
          <div className="panelHead"><div><span>ACTIVATION</span><h3>Human steps remaining</h3></div><Network size={18}/></div>
          <div className="panelBody activityList">
            <div><CircleAlert size={16}/><p><b>Gateway secret</b><small>Set the production gateway key and enable flag in Vercel.</small></p></div>
            <div><CircleAlert size={16}/><p><b>Provider consent</b><small>Authorise Microsoft 365, OpenAI and Claude against the gateway; verify Dola, Sintra and Viktor routes.</small></p></div>
            <div><CircleAlert size={16}/><p><b>One end-to-end acceptance task</b><small>HIVE → worker → SharePoint/HIVE receipt → VERA → IRIS. Then activate schedules individually.</small></p></div>
          </div>
        </article>
      </section>

      <section className="panel spaced">
        <div className="panelHead"><div><span>WORK RECEIPTS</span><h3>Recent external-worker state</h3></div><Bot size={18}/></div>
        <div className="panelBody">
          {data.jobs.length?<div className="systemsGrid">{data.jobs.slice(0,20).map((j:any)=><div className="systemRow" key={j.id}><div><b>{j.selected_agent_code||'Unassigned'}</b><small>{j.schedule_code||'Manual job'} · {new Date(j.created_at).toLocaleString('en-GB')}</small></div><span className={'statusBadge '+(j.status==='complete'?'status-teal':j.status==='failed'?'status-orange':'status-gold')}>{String(j.status).replaceAll('_',' ')}</span></div>)}</div>:<div className="workspaceEmpty"><b>No external-worker receipts yet</b><span>The schedules are deliberately held until provider activation and acceptance testing are complete.</span></div>}
        </div>
      </section>
    </div>
  </Shell>;
}
