import { BadgeCheck, CircleAlert, ScanSearch, ShieldCheck, TimerReset } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Topbar } from '@/components/Topbar';
import { getServerSupabase } from '@/lib/supabase-server';
import { VerificationActions } from '@/components/VerificationActions';

export const dynamic='force-dynamic';
export const revalidate=0;

async function loadAssurance(){
 const supabase=getServerSupabase();
 if(!supabase)return {checks:[],assets:[],integrations:[],work:[],source:'unavailable'};
 const [checks,assets,integrations,work]=await Promise.all([
   supabase.from('admin_verification_checks').select('id,entity_type,entity_key,title,verification_stage,status,verification_question,evidence_reference,verified_by,verified_at,next_recheck_at,notes,history,created_at,updated_at').order('updated_at',{ascending:false}).limit(250),
   supabase.from('orvia_asset_registry').select('asset_key,display_name,estate_disposition,verification_status').order('display_name',{ascending:true}),
   supabase.from('admin_integrations').select('code,name,category,status').order('name',{ascending:true}),
   supabase.from('admin_work_queue').select('id,title,status,priority,approval_required,source_system,source_reference').order('updated_at',{ascending:false}).limit(200)
 ]);
 return {checks:checks.data??[],assets:assets.data??[],integrations:integrations.data??[],work:work.data??[],source:'live'};
}

function accepted(status:string){
 return ['connected','configured','ready','live verified','verified','verified by ui'].includes(String(status||'').toLowerCase().replaceAll('_',' '));
}

function due(check:any){
 return check.status==='open'&&(!check.next_recheck_at||new Date(check.next_recheck_at).getTime()<=Date.now());
}

export default async function AssurancePage(){
 const data=await loadAssurance();
 const open=data.checks.filter((x:any)=>x.status==='open');
 const failed=data.checks.filter((x:any)=>x.status==='failed');
 const passed=data.checks.filter((x:any)=>['passed','closed'].includes(x.status));
 const dueNow=open.filter(due);
 const currentAssets=data.assets.filter((x:any)=>['keep','rename','temporary','hold'].includes(String(x.estate_disposition||'').toLowerCase()));
 const assetExceptions=currentAssets.filter((x:any)=>String(x.estate_disposition||'').toLowerCase()!=='keep'||!accepted(x.verification_status));
 const integrationExceptions=data.integrations.filter((x:any)=>!accepted(x.status));
 const blockedWork=data.work.filter((x:any)=>['blocked','failed','error','needs_human','review_required'].includes(String(x.status||'').toLowerCase()));

 return <Shell><Topbar title="Assurance" eyebrow="ORVIA · VITA CHALLENGES · VERA VERIFIES"/><div className="pageWrap">
   <section className="pageIntro"><div className="eyebrow">COMPLETED IS NOT THE SAME AS PROVEN</div><h2>Verify that change happened — then prove it still works.</h2><p>VERA moves work through Implemented → Verified → Effective → Sustained. VITA keeps exceptions, blind spots and unresolved control signals visible alongside it.</p></section>

   <section className="metricsGrid">
    <article className="metricCard tone-gold"><small>VERIFICATION DUE</small><strong>{dueNow.length}</strong><span>Human evidence check required now</span></article>
    <article className="metricCard tone-teal"><small>OPEN VERA CYCLES</small><strong>{open.length}</strong><span>Across implementation and rechecks</span></article>
    <article className="metricCard tone-purple"><small>VERA PASSED</small><strong>{passed.length}</strong><span>Completed sustained verification cycles</span></article>
    <article className="metricCard tone-orange"><small>ASSURANCE EXCEPTIONS</small><strong>{failed.length+assetExceptions.length+integrationExceptions.length+blockedWork.length}</strong><span>Failed verification or unresolved control signal</span></article>
   </section>

   <section className="veraLadder">
    <div><span>1</span><b>IMPLEMENTED</b><small>Recorded change exists</small></div>
    <i>→</i>
    <div><span>2</span><b>VERIFIED</b><small>Evidence confirms implementation</small></div>
    <i>→</i>
    <div><span>3</span><b>EFFECTIVE</b><small>30-day recheck confirms intended effect</small></div>
    <i>→</i>
    <div><span>4</span><b>SUSTAINED</b><small>90/180-day rechecks confirm durability</small></div>
   </section>

   <section className="panel spaced">
    <div className="panelHead"><div><span>VERA</span><h3>Verification queue</h3></div><BadgeCheck size={18}/></div>
    <div className="panelBody">
     {data.checks.length?<div className="verificationList">{data.checks.map((check:any)=><article className={'verificationCard '+check.status} key={check.id}>
       <div className="verificationCardHead"><div><small>{check.entity_type.toUpperCase()} · {check.entity_key}</small><h4>{check.title}</h4></div><span className="statusBadge status-gold">{check.verification_stage.toUpperCase()}</span></div>
       <p>{check.verification_question||'Human verification required.'}</p>
       <div className="verificationMeta">
         <span>Status <b>{check.status}</b></span>
         <span>Last verifier <b>{check.verified_by||'Not yet verified'}</b></span>
         <span>Next recheck <b>{check.next_recheck_at?new Date(check.next_recheck_at).toLocaleDateString('en-GB'):'Now / complete'}</b></span>
       </div>
       {check.evidence_reference&&<div className="verificationEvidence"><b>Latest evidence/reference</b><span>{check.evidence_reference}</span></div>}
       <VerificationActions id={check.id} stage={check.verification_stage} status={check.status} nextRecheckAt={check.next_recheck_at}/>
     </article>)}</div>:<div className="workspaceEmpty"><BadgeCheck size={23}/><b>No VERA checks are open yet</b><span>The first check will be created automatically when a Command task or IRIS work item is marked completed.</span></div>}
    </div>
   </section>

   <section className="twoCol spaced">
    <article className="panel">
      <div className="panelHead"><div><span>VITA</span><h3>Challenge signals</h3></div><ScanSearch size={18}/></div>
      <div className="panelBody activityList">
       {failed.map((x:any)=><div key={'v-'+x.id}><CircleAlert size={16}/><p><b>{x.title}</b><small>VERA failed · {x.notes||'Reason recorded in verification history'}</small></p></div>)}
       {assetExceptions.slice(0,8).map((x:any)=><div key={'a-'+x.asset_key}><ShieldCheck size={16}/><p><b>{x.display_name}</b><small>{String(x.estate_disposition).replaceAll('_',' ')} · {String(x.verification_status).replaceAll('_',' ')}</small></p></div>)}
       {integrationExceptions.slice(0,8).map((x:any)=><div key={'i-'+x.code}><TimerReset size={16}/><p><b>{x.name}</b><small>{x.category} · {String(x.status).replaceAll('_',' ')}</small></p></div>)}
       {blockedWork.slice(0,8).map((x:any)=><div key={'w-'+x.id}><CircleAlert size={16}/><p><b>{x.title}</b><small>{String(x.status).replaceAll('_',' ')} · {x.source_system||'ORVIA'}</small></p></div>)}
       {!failed.length&&!assetExceptions.length&&!integrationExceptions.length&&!blockedWork.length&&<div><ShieldCheck size={16}/><p><b>No current exception signals</b><small>This means the recorded control state is clear, not that independent assurance is unnecessary.</small></p></div>}
      </div>
    </article>

    <article className="panel">
      <div className="panelHead"><div><span>VERA RULE</span><h3>What happens after “Complete”</h3></div><BadgeCheck size={18}/></div>
      <div className="panelBody projectList">
       <div><b>01</b><span>Completion creates an Implemented verification check.</span></div>
       <div><b>02</b><span>A human provides evidence before it can become Verified.</span></div>
       <div><b>03</b><span>Verified work returns for a 30-day effectiveness check.</span></div>
       <div><b>04</b><span>Effective work returns for 90-day and then 180-day sustained checks.</span></div>
       <div><b>05</b><span>A failed VERA check creates a high-priority review item rather than disappearing.</span></div>
      </div>
    </article>
   </section>
 </div></Shell>
}
