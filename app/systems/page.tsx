import { Activity, Database, ExternalLink, Globe2, KeyRound, Mail, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Topbar } from '@/components/Topbar';
import { getServerSupabase } from '@/lib/supabase-server';
import { accessSummary, loadAccessRegister } from '@/lib/access-register';

export const dynamic='force-dynamic';
export const revalidate=0;

const ACCESS_REGISTER_URL='https://orviahealthcare.sharepoint.com/sites/ORVIAHUB/_layouts/15/Doc.aspx?sourcedoc=%7B7777CF1A-4CB2-4C29-BCCC-56BD5E986AEA%7D&file=ORVIA_Accounts_Access_and_Credential_Register_v3.xlsx&action=default&mobileredirect=true';

async function loadSystems(){
 const supabase=getServerSupabase();
 const access=await loadAccessRegister();
 if(!supabase)return {source:'unavailable',integrations:[],assets:[],access};
 const [integrations,assets]=await Promise.all([
  supabase.from('admin_integrations').select('code,name,category,connection_mode,status,contains_material_data,updated_at,metadata').order('category',{ascending:true}).order('name',{ascending:true}),
  supabase.from('orvia_asset_registry').select('asset_key,display_name,asset_type,canonical_domain,deployment_project_name,estate_disposition,verification_status,public_surface,updated_at').order('display_name',{ascending:true})
 ]);
 return {source:'live',integrations:integrations.data??[],assets:assets.data??[],access};
}

function good(status:string){
 return ['connected','configured','ready','live verified','verified','verified by ui','keep'].includes(String(status||'').toLowerCase().replaceAll('_',' '));
}
function badge(status:string){
 const value=String(status||'').toUpperCase();
 if(['KEEP','LIVE','LIVE VERIFIED','CONNECTED','CONFIGURED','VERIFIED','VERIFIED_BY_UI'].includes(value))return 'status-teal';
 if(['RETIRE','LEGACY','BLOCKED','FAILED'].includes(value))return 'status-orange';
 return 'status-gold';
}

export default async function SystemsPage(){
 const data=await loadSystems();
 const currentAssets=data.assets.filter((a:any)=>['keep','rename','temporary','hold'].includes(String(a.estate_disposition||'').toLowerCase()));
 const currentMail=data.integrations.filter((x:any)=>String(x.code||'').startsWith('MAIL_')&&!String(x.code||'').startsWith('MAIL_HC_'));
 const legacyMail=data.integrations.filter((x:any)=>String(x.code||'').startsWith('MAIL_HC_'));
 const issues=data.integrations.filter((x:any)=>!good(x.status));
 const estateReview=currentAssets.filter((a:any)=>String(a.estate_disposition||'').toLowerCase()!=='keep'||!good(a.verification_status));
 const accounts=data.access.accounts;
 const access=accessSummary(accounts);
 const currentAccounts=accounts.filter(x=>!x.legacy_healthcare);
 const legacyAccounts=accounts.filter(x=>x.legacy_healthcare);

 return <Shell><Topbar title="Systems & Access" eyebrow="ORVIA · LIVE CONTROL VIEW"/><div className="pageWrap">
  <section className="pageIntro"><div className="eyebrow">SEE WHAT ORVIA DEPENDS ON</div><h2>Systems, websites, identities and migration in one control view.</h2><p>Command shows controlled registry state, not assumed health. Passwords, API keys and recovery codes are deliberately excluded: this screen records only where secrets belong and what still needs verification.</p></section>

  <section className="metricsGrid">
   <article className="metricCard tone-teal"><small>CURRENT ESTATE</small><strong>{currentAssets.length}</strong><span>{estateReview.length} need reconciliation or verification</span></article>
   <article className="metricCard tone-gold"><small>ACCESS REGISTER</small><strong>{access.total}</strong><span>{access.verify} account records still need login/ownership verification</span></article>
   <article className="metricCard tone-purple"><small>LEGACY HEALTHCARE</small><strong>{access.legacy}</strong><span>Retain until dependent services are migrated and verified</span></article>
   <article className="metricCard tone-orange"><small>MFA / VAULT GAPS</small><strong>{access.mfaUnknown + access.vaultUnassigned}</strong><span>{access.mfaUnknown} MFA unknown · {access.vaultUnassigned} vault references unassigned</span></article>
  </section>

  <section className="twoCol">
   <article className="panel">
    <div className="panelHead"><div><span>LANDSCAPE</span><h3>Websites & internal surfaces</h3></div><Globe2 size={18}/></div>
    <div className="panelBody systemsGrid">
     {currentAssets.map((a:any)=><div className="systemRow" key={a.asset_key}><div><b>{a.display_name}</b><small>{a.canonical_domain||a.asset_type}<br/>{a.deployment_project_name||'Deployment project not recorded'}</small></div><span className={'statusBadge '+badge(a.verification_status)}>{String(a.estate_disposition).toUpperCase()}</span></div>)}
    </div>
   </article>

   <article className="panel">
    <div className="panelHead"><div><span>INTEGRATIONS</span><h3>Connected systems</h3></div><Activity size={18}/></div>
    <div className="panelBody systemsGrid">
     {data.integrations.filter((x:any)=>!String(x.code||'').startsWith('MAIL_')).map((x:any)=><div className="systemRow" key={x.code}><div><b>{x.name}</b><small>{x.category} · {x.connection_mode}{x.contains_material_data?' · material data':''}</small></div><span className={'statusBadge '+badge(x.status)}>{String(x.status).replaceAll('_',' ')}</span></div>)}
    </div>
   </article>
  </section>

  <section className="panel spaced">
   <div className="panelHead"><div><span>ACCOUNTS & ACCESS</span><h3>ORVIA account ownership and credential migration</h3></div><a className="panelHeadLink" href={ACCESS_REGISTER_URL} target="_blank" rel="noreferrer">Open source register <ExternalLink size={12}/></a></div>
   <div className="panelBody">
    <div className="accessNotice"><KeyRound size={18}/><p><b>No secret values are stored here.</b><span>Vault item names and provider secret-store locations only. Actual passwords, API keys and recovery codes remain outside Command.</span></p></div>
    <div className="accessTableWrap"><table className="accessTable">
      <thead><tr><th>Service</th><th>Current identity</th><th>Target ORVIA identity</th><th>MFA</th><th>Secret location</th><th>Status</th></tr></thead>
      <tbody>{currentAccounts.map(account=><tr key={account.id}>
        <td><b>{account.service_name}</b><small>{account.category||'Uncategorised'} · {account.owner_name||'Owner not recorded'}</small></td>
        <td>{account.current_login_email||'Not recorded'}</td>
        <td>{account.target_orvia_email||'Not recorded'}</td>
        <td>{account.mfa_state||'Not recorded'}</td>
        <td><span>{account.secret_location||'Not recorded'}</span><small>Vault: {account.vault_reference||'Not assigned'}</small></td>
        <td><span className={'statusBadge '+badge(account.migration_status)}>{account.migration_status}</span><small>{account.action_required||''}</small></td>
      </tr>)}</tbody>
    </table></div>
   </div>
  </section>

  <section className="twoCol spaced">
   <article className="panel">
    <div className="panelHead"><div><span>EMAIL IDENTITY</span><h3>Current ORVIA role mailboxes</h3></div><Mail size={18}/></div>
    <div className="panelBody systemsGrid">
      {currentMail.map((x:any)=><div className="systemRow" key={x.code}><div><b>{x.name}</b><small>{x.metadata?.address||'Address not recorded'}</small></div><span className={'statusBadge '+badge(x.status)}>{String(x.status).replaceAll('_',' ')}</span></div>)}
    </div>
   </article>
   <article className="panel">
    <div className="panelHead"><div><span>CONTROL</span><h3>What still needs attention</h3></div><ShieldCheck size={18}/></div>
    <div className="panelBody">
      <div className="activityList">
       {estateReview.slice(0,5).map((a:any)=><div key={a.asset_key}><Database size={16}/><p><b>{a.display_name}</b><small>{String(a.estate_disposition).replaceAll('_',' ')} · {String(a.verification_status).replaceAll('_',' ')}</small></p></div>)}
       {issues.slice(0,5).map((x:any)=><div key={x.code}><Activity size={16}/><p><b>{x.name}</b><small>{String(x.status).replaceAll('_',' ')} · {x.category}</small></p></div>)}
       {currentAccounts.filter(x=>!['KEEP'].includes(x.migration_status)).slice(0,6).map(x=><div key={x.id}><KeyRound size={16}/><p><b>{x.service_name}</b><small>{x.migration_status} · {x.action_required||'Review account ownership'}</small></p></div>)}
      </div>
    </div>
   </article>
  </section>

  <section className="panel spaced">
    <div className="panelHead"><div><span>LEGACY MIGRATION</span><h3>Healthcare identities retained temporarily</h3></div><ShieldAlert size={18}/></div>
    <div className="panelBody">
      <p className="projectLongCopy">These identities are not for new registrations. They remain visible only until every dependent login, recovery route and retained record has been migrated and verified.</p>
      <div className="systemsGrid">{legacyAccounts.map(account=><div className="systemRow legacyAccessRow" key={account.id}><div><b>{account.service_name}</b><small>{account.current_login_email||'Legacy Healthcare identity'} → {account.target_orvia_email||'Target not recorded'}</small></div><span className="statusBadge status-orange">{account.migration_status}</span></div>)}</div>
    </div>
   </section>

  {data.access.error&&<div className="workspaceEmpty large"><b>Access register could not be fully loaded</b><span>{data.access.error}</span></div>}
 </div></Shell>
}
