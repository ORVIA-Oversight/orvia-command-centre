import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { classifyAuthority, authorityNeedsHuman, isReadOnlyRequest, priorityFor, resolveAssetKeys, workClass } from '@/lib/command-policy';
import { orviaReachConfigured, searchOrviaReach } from '@/lib/orvia-reach';

export const dynamic='force-dynamic';

function clean(value:unknown){
  return String(value??'').replace(/[\r\n]+/g,' ').replace(/\s+/g,' ').trim();
}

function humanStatus(value:unknown){
  return clean(value).replaceAll('_',' ').toLowerCase();
}

export async function POST(req:NextRequest){
  let body:any;
  try{ body=await req.json(); }
  catch{ return NextResponse.json({status:'INCOMPLETE',reason:'I could not read that request. Please try again.'},{status:400}); }

  const question=clean(body?.question);
  const requestedAgent=clean(body?.targetAgent||'IRIS').toUpperCase();
  if(!question) return NextResponse.json({status:'INCOMPLETE',reason:'Tell me what you need help with.'},{status:400});

  const supabase=getServerSupabase();
  if(!supabase) return NextResponse.json({status:'INCOMPLETE',reason:'I cannot reach the live ORVIA data right now, so I cannot answer reliably.'},{status:503});

  try{
    const [assetsResult,tasksResult,queueResult,integrationsResult,clientsResult,accessResult,agentsResult]=await Promise.all([
      supabase.from('orvia_asset_registry').select('asset_key,display_name,canonical_domain,canonical_url,estate_disposition,verification_status,deployment_project_name,desired_deployment_project_name,notes').order('display_name',{ascending:true}),
      supabase.from('admin_tasks').select('id,title,status,priority,approval_required,owner,due_at,updated_at').order('updated_at',{ascending:false}).limit(80),
      supabase.from('admin_work_queue').select('id,title,status,priority,approval_required,assigned_to,source_system,source_reference,created_at,updated_at').order('created_at',{ascending:false}).limit(80),
      supabase.from('admin_integrations').select('code,name,category,status,updated_at').order('updated_at',{ascending:false}).limit(80),
      supabase.from('admin_organisations').select('id,metadata').limit(500),
      supabase.from('admin_access_accounts').select('service_name,migration_status,legacy_healthcare,mfa_state,vault_reference,current_state,action_required,current_login_email,target_orvia_email').order('service_name',{ascending:true}),
      supabase.from('admin_agents').select('code,display_name,agent_type,risk_ceiling,requires_human_approval_above,active,metadata').eq('active',true)
    ]);

    const assets=assetsResult.data??[];
    const tasks=tasksResult.data??[];
    const queue=queueResult.data??[];
    const integrations=integrationsResult.data??[];
    const agents=agentsResult.data??[];
    const targetAgent=agents.find((x:any)=>String(x.code).toUpperCase()===requestedAgent) || agents.find((x:any)=>x.code==='IRIS');
    const targetCode=targetAgent?.code||'IRIS';
    const targetName=targetAgent?.display_name||'IRIS';
    const isExternalWorker=Boolean(targetAgent?.metadata?.external_worker);
    const assetKeys=resolveAssetKeys(question,assets);
    const clientRows=clientsResult.data??[];
    const clientCount=clientRows.filter((x:any)=>!(x.metadata&&x.metadata.internal_orvia===true)).length;
    const accessRows=accessResult.data??[];
    const accessVerify=accessRows.filter((x:any)=>x.migration_status==='VERIFY').length;
    const accessLegacy=accessRows.filter((x:any)=>x.legacy_healthcare===true).length;
    const mfaUnknown=accessRows.filter((x:any)=>!x.legacy_healthcare&&['TBD','','UNKNOWN'].includes(String(x.mfa_state||'').toUpperCase())).length;
    const vaultUnknown=accessRows.filter((x:any)=>!x.legacy_healthcare&&['TBD','','UNKNOWN'].includes(String(x.vault_reference||'').toUpperCase())).length;
    const reachIntent=/\b(orvia reach|research gateway|research this|research properly|search the web|find prospects|lead research|prospect research)\b/i.test(question);
    if(reachIntent){
      if(!orviaReachConfigured()){
        return NextResponse.json({
          status:'INCOMPLETE',
          model:'IRIS',
          reason:'ORVIA Reach is installed in Command but its research worker still needs activation before I can use it live.'
        },{status:503});
      }
      const result=await searchOrviaReach({query:question,maxResults:10});
      const summary=result.sources.slice(0,6).map((s,i)=>`${i+1}. ${s.title} — ${s.url}`).join(' ');
      return NextResponse.json({
        status:'COMPLETE',
        model:'IRIS',
        answer:result.sources.length? `I used ORVIA Reach and found ${result.sources.length} source${result.sources.length===1?'':'s'}. ${summary} These are research sources, not verified evidence until checked through VERA.` : 'ORVIA Reach completed the search but returned no usable sources.',
        authority:'A0',
        research:{product:'ORVIA Reach',sources:result.sources,backend:result.backend,warnings:result.warnings}
      });
    }

    const readOnly=isReadOnlyRequest(question);
    const authority=readOnly?'A0':classifyAuthority(question);
    const explicitReachResearch=/\b(orvia reach|research this|research properly|research with reach|use reach|source this)\b/i.test(question);

    if(explicitReachResearch){
      if(!orviaReachConfigured()){
        return NextResponse.json({
          status:'INCOMPLETE',
          model:'IRIS',
          reason:'ORVIA Reach is built into Command but its research worker is not activated yet. I have not fabricated a research result.'
        },{status:503});
      }

      const research=await searchOrviaReach({query:question,maxResults:8});
      const top=research.sources.slice(0,5);
      const answer=top.length
        ? [
            `I found ${research.sources.length} sourced result${research.sources.length===1?'':'s'} through ORVIA Reach.`,
            ...top.map((s:any,i:number)=>`${i+1}. ${s.title} — ${s.source}${s.snippet? `: ${s.snippet.slice(0,220)}`:''} (${s.url})`),
            'These are retrieved sources, not automatically verified facts. Material claims still need VERA checking before consequential use.'
          ].join(' ')
        : 'ORVIA Reach completed the search but returned no usable sourced results.';

      return NextResponse.json({
        status:'COMPLETE',
        model:'IRIS',
        answer,
        authority:'A0',
        research:{sourceCount:research.sources.length,backend:research.backend,warnings:research.warnings??[]}
      });
    }

    if(readOnly){
      const activeTasks=tasks.filter((x:any)=>!['completed','closed','done','cancelled'].includes(String(x.status||'').toLowerCase()));
      const activeWork=queue.filter((x:any)=>!['completed','closed','done','cancelled'].includes(String(x.status||'').toLowerCase()));
      const approvals=[...activeTasks,...activeWork].filter((x:any)=>x.approval_required===true);
      const blocked=[...activeTasks,...activeWork].filter((x:any)=>['blocked','failed','error','needs_human','review_required'].includes(String(x.status||'').toLowerCase()));
      const systemIssues=integrations.filter((x:any)=>!['connected','configured','ready','live verified','verified'].includes(String(x.status||'').toLowerCase()));
      const estateCurrent=assets.filter((x:any)=>['keep','rename','temporary','hold'].includes(String(x.estate_disposition||'').toLowerCase()));
      const estateReview=estateCurrent.filter((x:any)=>String(x.estate_disposition||'').toLowerCase()!=='keep'||!/verified/i.test(String(x.verification_status||'')));

      if(assetKeys.length){
        const matches=assets.filter((a:any)=>assetKeys.includes(a.asset_key));
        const lines=matches.map((a:any)=>{
          const deploy=a.deployment_project_name? ` Vercel: ${a.deployment_project_name}.`:'';
          const desired=a.desired_deployment_project_name&&a.desired_deployment_project_name!==a.deployment_project_name?` Desired: ${a.desired_deployment_project_name}.`:'';
          return `${a.display_name}: ${humanStatus(a.estate_disposition)}, ${humanStatus(a.verification_status)}.${deploy}${desired}`;
        });
        return NextResponse.json({
          status:'COMPLETE',
          model:'IRIS',
          answer:lines.join(' '),
          authority:'A0',
          resolvedAssets:assetKeys
        });
      }

      const answer:string[]=[];
      if(/\b(account|accounts|login|logins|access|credential|credentials|api key|api keys|password|passwords|mfa|vault|healthcare email|healthcare emails)\b/i.test(question)){
        answer.push(`${accessRows.length} non-secret account/access records are controlled; ${accessVerify} still need login or ownership verification.`);
        answer.push(`${accessLegacy} legacy Healthcare identity records remain for controlled migration; ${mfaUnknown} current accounts have unknown MFA state and ${vaultUnknown} have no assigned vault reference yet.`);
        const attention=accessRows.filter((x:any)=>!x.legacy_healthcare&&x.migration_status!=='KEEP').slice(0,5);
        if(attention.length) answer.push(`Current access actions: ${attention.map((x:any)=>`${x.service_name} — ${x.migration_status}`).join('; ')}.`);
        answer.push('Command stores no password or API-key values; it records only the vault or provider secret-store location.');
      }else if(/\b(system|systems|integration|connected|connection|health|telemetry)\b/i.test(question)){
        answer.push(`${integrations.length} system connections are recorded; ${systemIssues.length} are not currently in a connected/configured/verified state.`);
        if(systemIssues.length) answer.push(`Needs attention: ${systemIssues.slice(0,4).map((x:any)=>x.name).join(', ')}.`);
        answer.push(`${estateCurrent.length} current ORVIA assets are in the registry; ${estateReview.length} still need reconciliation or verification.`);
        answer.push(`${accessVerify} access records still need identity verification and ${accessLegacy} legacy Healthcare records remain in the migration queue.`);
      }else if(/\b(client|customer)\b/i.test(question)){
        answer.push(`${clientCount} external client organisation${clientCount===1?' is':'s are'} currently recorded in the master organisation register.`);
        answer.push('I will not invent client workspaces where no controlled customer record exists.');
      }else{
        answer.push(`${approvals.length} item${approvals.length===1?' needs':'s need'} your approval.`);
        answer.push(`${activeTasks.length+activeWork.length} active task/work item${activeTasks.length+activeWork.length===1?' is':'s are'} recorded.`);
        if(blocked.length) answer.push(`${blocked.length} item${blocked.length===1?' is':'s are'} blocked or require review.`);
        if(estateReview.length) answer.push(`${estateReview.length} estate item${estateReview.length===1?' still needs':'s still need'} reconciliation or verification.`);
      }

      return NextResponse.json({
        status:'COMPLETE',
        model:'IRIS',
        answer:answer.join(' '),
        authority:'A0',
        resolvedAssets:[]
      });
    }

    const approvalRequired=authorityNeedsHuman(authority);
    const assetLabel=assetKeys.length?assetKeys.join(', '):'unresolved/general';
    const wc=workClass(question);
    const detail=clean(`[AUTHORITY=${authority}] [CLASS=${wc}] [ASSETS=${assetLabel}] ${question}`);

    let workId:string|null=null;
    if(isExternalWorker){
      const insert=await supabase.from('admin_brain_jobs').insert({
        user_request:question,
        interpreted_intent:question.slice(0,500),
        selected_agent_code:targetCode,
        status:approvalRequired?'review_required':'queued',
        risk_level:wc==='HIGH-CONSEQUENCE'?'high':wc==='MATERIAL'?'medium':'low',
        approval_required:approvalRequired,
        approval_status:approvalRequired?'pending':'not_required',
        input_context:{source:'COMMAND',requested_by:'managing_director',asset_keys:assetKeys},
        requested_outputs:[],
        permitted_sources:['HIVE','SHAREPOINT','COMMAND'],
        verification_required:true
      }).select('id,status').single();
      if(insert.error||!insert.data){
        return NextResponse.json({status:'INCOMPLETE',reason:'I could not route that to the selected worker. Please try again.'},{status:500});
      }
      workId=insert.data.id;
    }else{
      const insert=await supabase.from('admin_work_queue').insert({
        work_type:'command_instruction',
        title:question.slice(0,180),
        detail,
        status:approvalRequired?'review_required':'open',
        priority:priorityFor(question),
        assigned_to:targetCode,
        approval_required:approvalRequired,
        source_system:'COMMAND',
        source_reference:assetKeys[0]||'command.orvia.org.uk'
      }).select('id,status,priority,approval_required').single();
      if(insert.error||!insert.data){
        return NextResponse.json({status:'INCOMPLETE',reason:'I could not add that to the controlled work queue. Please try again.'},{status:500});
      }
      workId=insert.data.id;
    }

    const message=authority==='A4'
      ? `I have recorded this for ${targetName}, but it remains human-only and will not be executed automatically.`
      : authority==='A3'
      ? `I have assigned this to ${targetName} and held the consequential step for your approval.`
      : authority==='A2'
      ? `I have assigned this to ${targetName} as a controlled, reversible change with verification required.`
      : `I have assigned this to ${targetName}. IRIS will keep it in the overall work picture.`;

    return NextResponse.json({
      status:'COMPLETE',
      model:'IRIS',
      answer:message,
      workId,
      assignedTo:targetCode,
      authority,
      workClass:wc,
      resolvedAssets:assetKeys,
      approvalRequired
    });
  }catch{
    return NextResponse.json({status:'INCOMPLETE',reason:'I hit a problem while processing that. Please try again.'},{status:500});
  }
}
