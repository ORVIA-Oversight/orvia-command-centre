import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { gatewayConfigured } from '@/lib/agent-gateway';

export const dynamic='force-dynamic';
export const revalidate=0;

function liveStatus(status:unknown){
  return ['connected','configured','ready','verified','live verified'].includes(String(status||'').toLowerCase());
}

export async function GET(){
  const supabase=getServerSupabase();
  if(!supabase) return NextResponse.json({live:false,reason:'Command data layer unavailable'},{status:503});

  const now=new Date();
  const dayStart=new Date(now); dayStart.setHours(0,0,0,0);
  const dayEnd=new Date(now); dayEnd.setHours(23,59,59,999);

  try{
    const [integrations,agents,schedules,tasks,work,mailAccounts,mailItems,sharePointAssets]=await Promise.all([
      supabase.from('admin_integrations').select('code,name,category,status,updated_at'),
      supabase.from('admin_agents').select('code,display_name,agent_type,purpose,risk_ceiling,active,metadata').eq('active',true),
      supabase.from('admin_worker_schedules').select('schedule_code,worker_code,title,active,risk_level,approval_required,verification_required,local_time,timezone'),
      supabase.from('admin_tasks').select('id,title,status,priority,owner,due_at,approval_required').gte('due_at',dayStart.toISOString()).lte('due_at',dayEnd.toISOString()).order('due_at',{ascending:true}),
      supabase.from('admin_work_queue').select('id,title,status,priority,assigned_to,approval_required,created_at').order('created_at',{ascending:false}).limit(100),
      supabase.from('command_mail_accounts').select('id,address,provider,status,business_area,last_sync_at'),
      supabase.from('command_mail_items').select('id,state,risk_level,assigned_agent,priority,deadline_at,subject,from_name,from_address,received_at,summary,preview').order('received_at',{ascending:false}).limit(500),
      supabase.from('admin_media_assets').select('id,file_name,asset_type,business_area_code,sharepoint_item_id,sharepoint_drive_id,source_url,created_at').not('sharepoint_item_id','is',null).order('created_at',{ascending:false}).limit(8)
    ]);

    const integrationRows=integrations.data??[];
    const integration=(code:string)=>integrationRows.find((x:any)=>x.code===code);
    const layer=(code:string,label:string,href:string)=>({
      code,label,href,
      status:integration(code)?.status??'not configured',
      ready:liveStatus(integration(code)?.status),
      updatedAt:integration(code)?.updated_at??null
    });

    const agentRows=agents.data??[];
    const specialists=agentRows.filter((x:any)=>x.agent_type==='specialist'&&!x.metadata?.external_worker&&x.code!=='IRIS');
    const externalWorkers=agentRows.filter((x:any)=>x.metadata?.external_worker===true);
    const openWork=(work.data??[]).filter((x:any)=>!['completed','complete','closed','done','cancelled','failed'].includes(String(x.status||'').toLowerCase()));
    const approvals=openWork.filter((x:any)=>x.approval_required===true);
    const mailRows=mailItems.data??[];

    return NextResponse.json({
      live:true,
      hierarchy:{managingDirector:'John',deputy:'IRIS',specialists:specialists.length,externalWorkers:externalWorkers.length},
      layers:[
        layer('MONDAY','Monday.com','/work'),
        layer('DEERFLOW','DeerFlow Work Floor','/workforce'),
        layer('M365','Microsoft 365 / SharePoint','/systems'),
        {code:'COMMAND_MAIL',label:'Command Mail',href:'/communications',status:(mailAccounts.data??[]).length?'accounts connected':'needs mailbox authorisation',ready:(mailAccounts.data??[]).length>0,updatedAt:(mailAccounts.data??[])[0]?.last_sync_at??null},
        layer('STRIPE','Finance / Stripe','/systems'),
        layer('VAPI','ARIA / Voice','/communications'),
        layer('GITHUB','GitHub','/projects'),
        layer('VERCEL','Vercel','/projects')
      ],
      today:{
        scheduledTasks:tasks.data??[],
        openWork:openWork.length,
        approvals:approvals.length,
        mailNeedsJohn:mailRows.filter((x:any)=>x.state==='needs_john').length,
        mailReplyReady:mailRows.filter((x:any)=>x.state==='reply_ready').length,
        highRiskMail:mailRows.filter((x:any)=>x.risk_level==='red').length
      },
      recentMail:mailRows.slice(0,8),
      recentSharePoint:sharePointAssets.data??[],
      workforce:{
        gateway:gatewayConfigured()?'enabled':'human activation required',
        specialistTeams:specialists.map((x:any)=>({code:x.code,name:x.display_name,purpose:x.purpose,riskCeiling:x.risk_ceiling})),
        externalWorkers:externalWorkers.map((x:any)=>({code:x.code,name:x.display_name,connection:x.metadata?.connection_state??'unknown',riskCeiling:x.risk_ceiling})),
        schedules:schedules.data??[]
      }
    });
  }catch(error:any){
    return NextResponse.json({live:false,reason:error?.message||'Executive brief failed'},{status:500});
  }
}
