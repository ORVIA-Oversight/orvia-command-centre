import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { classifyAuthority, authorityNeedsHuman, isReadOnlyRequest, priorityFor, resolveAssetKeys, workClass } from '@/lib/command-policy';

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
  if(!question) return NextResponse.json({status:'INCOMPLETE',reason:'Tell me what you need help with.'},{status:400});

  const supabase=getServerSupabase();
  if(!supabase) return NextResponse.json({status:'INCOMPLETE',reason:'I cannot reach the live ORVIA data right now, so I cannot answer reliably.'},{status:503});

  try{
    const [assetsResult,tasksResult,queueResult,integrationsResult,clientsResult]=await Promise.all([
      supabase.from('orvia_asset_registry').select('asset_key,display_name,canonical_domain,canonical_url,estate_disposition,verification_status,deployment_project_name,desired_deployment_project_name,notes').order('display_name',{ascending:true}),
      supabase.from('admin_tasks').select('id,title,status,priority,approval_required,owner,due_at,updated_at').order('updated_at',{ascending:false}).limit(80),
      supabase.from('admin_work_queue').select('id,title,status,priority,approval_required,assigned_to,source_system,source_reference,created_at,updated_at').order('created_at',{ascending:false}).limit(80),
      supabase.from('admin_integrations').select('code,name,category,status,updated_at').order('updated_at',{ascending:false}).limit(80),
      supabase.from('web_customers').select('id',{count:'exact',head:true})
    ]);

    const assets=assetsResult.data??[];
    const tasks=tasksResult.data??[];
    const queue=queueResult.data??[];
    const integrations=integrationsResult.data??[];
    const assetKeys=resolveAssetKeys(question,assets);
    const readOnly=isReadOnlyRequest(question);
    const authority=readOnly?'A0':classifyAuthority(question);

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
      if(/\b(system|systems|integration|connected|connection|health|telemetry)\b/i.test(question)){
        answer.push(`${integrations.length} system connections are recorded; ${systemIssues.length} are not currently in a connected/configured/verified state.`);
        if(systemIssues.length) answer.push(`Needs attention: ${systemIssues.slice(0,4).map((x:any)=>x.name).join(', ')}.`);
        answer.push(`${estateCurrent.length} current ORVIA assets are in the registry; ${estateReview.length} still need reconciliation or verification.`);
      }else if(/\b(client|customer)\b/i.test(question)){
        answer.push(`${clientsResult.count??0} Web customer record${(clientsResult.count??0)===1?' is':'s are'} currently recorded.`);
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

    const insert=await supabase.from('admin_work_queue').insert({
      work_type:'command_instruction',
      title:question.slice(0,180),
      detail,
      status:approvalRequired?'review_required':'open',
      priority:priorityFor(question),
      assigned_to:'IRIS',
      approval_required:approvalRequired,
      source_system:'COMMAND',
      source_reference:assetKeys[0]||'command.orvia.org.uk'
    }).select('id,status,priority,approval_required').single();

    if(insert.error||!insert.data){
      return NextResponse.json({status:'INCOMPLETE',reason:'I could not add that to the controlled work queue. Please try again.'},{status:500});
    }

    const message=authority==='A4'
      ? 'I have recorded the request, but this remains human-only and will not be executed automatically.'
      : authority==='A3'
      ? 'I have prepared the work and held it for your approval before any consequential action.'
      : authority==='A2'
      ? 'I have routed this as a controlled, reversible production change. It must be verified and rolled back if verification fails.'
      : 'I have routed the work inside delegated authority.';

    return NextResponse.json({
      status:'COMPLETE',
      model:'IRIS',
      answer:message,
      workId:insert.data.id,
      authority,
      workClass:wc,
      resolvedAssets:assetKeys,
      approvalRequired
    });
  }catch{
    return NextResponse.json({status:'INCOMPLETE',reason:'I hit a problem while processing that. Please try again.'},{status:500});
  }
}
