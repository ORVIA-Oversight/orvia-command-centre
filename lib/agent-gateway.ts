import { timingSafeEqual } from 'crypto';
import { NextRequest } from 'next/server';

export type GatewayIdentity = {
  workerCode:string;
};

function safeEqual(a:string,b:string){
  const left=Buffer.from(a);
  const right=Buffer.from(b);
  if(left.length!==right.length)return false;
  return timingSafeEqual(left,right);
}

export function authenticateAgentGateway(req:NextRequest):GatewayIdentity|null{
  const enabled=process.env.ORVIA_AGENT_GATEWAY_ENABLED==='true';
  const secret=process.env.ORVIA_AGENT_GATEWAY_KEY;
  if(!enabled||!secret)return null;

  const auth=req.headers.get('authorization')||'';
  if(!auth.startsWith('Bearer '))return null;
  const token=auth.slice(7).trim();
  if(!token||!safeEqual(token,secret))return null;

  const workerCode=String(req.headers.get('x-orvia-worker')||'').trim().toUpperCase();
  if(!/^[A-Z0-9_-]{3,64}$/.test(workerCode))return null;
  return {workerCode};
}

export function gatewayConfigured(){
  return process.env.ORVIA_AGENT_GATEWAY_ENABLED==='true' && Boolean(process.env.ORVIA_AGENT_GATEWAY_KEY);
}

export function publicJob(job:any){
  return {
    id:job.id,
    status:job.status,
    request:job.user_request,
    intent:job.interpreted_intent,
    worker:job.selected_agent_code,
    riskLevel:job.risk_level,
    approvalRequired:job.approval_required,
    approvalStatus:job.approval_status,
    inputContext:job.input_context??{},
    requestedOutputs:job.requested_outputs??[],
    permittedSources:job.permitted_sources??[],
    verificationRequired:Boolean(job.verification_required),
    dueAt:job.due_at,
    createdAt:job.created_at,
    startedAt:job.started_at,
    heartbeatAt:job.heartbeat_at,
    resultSummary:job.result_summary,
    completionEvidence:job.completion_evidence??[],
  };
}
