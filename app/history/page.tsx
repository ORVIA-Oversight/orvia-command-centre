import { ArrowRightLeft, Bot, CheckCircle2, History, ShieldCheck } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Topbar } from '@/components/Topbar';
import { getServerSupabase } from '@/lib/supabase-server';

export const dynamic='force-dynamic';
export const revalidate=0;

async function loadHistory(){
  const supabase=getServerSupabase();
  if(!supabase)return {events:[],handoffs:[],changes:[]};
  const [events,handoffs,changes]=await Promise.all([
    supabase.from('admin_brain_job_events').select('id,job_id,event_type,tool_code,agent_code,summary,payload,created_at').order('created_at',{ascending:false}).limit(120),
    supabase.from('admin_handoffs').select('id,source_ref,target_ref,title,status,approval_required,approval_status,created_at,completed_at').order('created_at',{ascending:false}).limit(120),
    supabase.from('admin_change_log').select('id,entity_type,action,actor,summary,created_at').order('created_at',{ascending:false}).limit(120)
  ]);
  return {events:events.data??[],handoffs:handoffs.data??[],changes:changes.data??[]};
}

export default async function HistoryPage(){
  const data=await loadHistory();
  return <Shell><Topbar title="History" eyebrow="ORVIA COMMAND · AUDIT & WORKFORCE MEMORY"/>
    <div className="pageWrap appLightPage">
      <section className="pageIntro appHeroLight">
        <div className="eyebrow">ONE TRACEABLE HISTORY</div>
        <h2>Conversations become accountable work.</h2>
        <p>Agent activity, delegations and controlled changes are shown together so you can see what happened, who handled it and where human approval remained in control.</p>
      </section>

      <section className="threeColHistory">
        <article className="panel appPanelLight">
          <div className="panelHead"><div><span>AGENT ACTIVITY</span><h3>Work events</h3></div><Bot size={18}/></div>
          <div className="panelBody activityList">
            {data.events.length?data.events.map((x:any)=><div key={x.id}><Bot size={16}/><p><b>{x.summary||x.event_type}</b><small>{x.agent_code||'IRIS'} · {x.event_type} · {new Date(x.created_at).toLocaleString('en-GB')}</small></p></div>):<div className="workspaceEmpty"><History size={22}/><b>No job events returned</b><span>Events will appear as agents and workers execute controlled work.</span></div>}
          </div>
        </article>

        <article className="panel appPanelLight">
          <div className="panelHead"><div><span>360° DELEGATION</span><h3>Handoffs</h3></div><ArrowRightLeft size={18}/></div>
          <div className="panelBody activityList">
            {data.handoffs.length?data.handoffs.map((x:any)=><div key={x.id}><ArrowRightLeft size={16}/><p><b>{x.source_ref} → {x.target_ref}</b><small>{x.title} · {x.status} · {new Date(x.created_at).toLocaleString('en-GB')}</small></p></div>):<div className="workspaceEmpty"><ArrowRightLeft size={22}/><b>No handoffs yet</b><span>Delegation between departments and agents will be recorded here.</span></div>}
          </div>
        </article>

        <article className="panel appPanelLight">
          <div className="panelHead"><div><span>CONTROLLED CHANGE</span><h3>Audit trail</h3></div><ShieldCheck size={18}/></div>
          <div className="panelBody activityList">
            {data.changes.length?data.changes.map((x:any)=><div key={x.id}><CheckCircle2 size={16}/><p><b>{x.summary||x.action}</b><small>{x.entity_type} · {x.actor} · {new Date(x.created_at).toLocaleString('en-GB')}</small></p></div>):<div className="workspaceEmpty"><ShieldCheck size={22}/><b>No change-log records returned</b><span>ORVIA will not invent an audit trail.</span></div>}
          </div>
        </article>
      </section>
    </div>
  </Shell>;
}
