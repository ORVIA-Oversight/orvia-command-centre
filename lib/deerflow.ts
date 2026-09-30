export type DeerFlowJob = {
  taskId:string;
  objective:string;
  context?:Record<string,unknown>;
  allowedTools?:string[];
  allowedSources?:string[];
  verificationRequired?:boolean;
};

export type DeerFlowResult = {
  ok:boolean;
  runId?:string;
  status:string;
  output?:unknown;
  receipt?:unknown;
  error?:string;
};

export function deerFlowConfigured(){
  return Boolean(process.env.DEERFLOW_BASE_URL && process.env.DEERFLOW_API_KEY);
}

export async function runDeerFlow(job:DeerFlowJob):Promise<DeerFlowResult>{
  if(!deerFlowConfigured()){
    return {ok:false,status:'not_configured',error:'DeerFlow runtime is not connected.'};
  }

  const base=String(process.env.DEERFLOW_BASE_URL).replace(/\/$/,'');
  const path=process.env.DEERFLOW_RUN_PATH || '/api/runs';
  const res=await fetch(base+path,{
    method:'POST',
    headers:{
      'content-type':'application/json',
      'authorization':`Bearer ${process.env.DEERFLOW_API_KEY}`,
      'x-orvia-source':'IRIS'
    },
    body:JSON.stringify({
      task_id:job.taskId,
      objective:job.objective,
      context:job.context||{},
      allowed_tools:job.allowedTools||[],
      allowed_sources:job.allowedSources||[],
      verification_required:job.verificationRequired!==false
    }),
    cache:'no-store'
  });

  if(!res.ok){
    return {ok:false,status:'failed',error:`DeerFlow returned HTTP ${res.status}`};
  }

  const data=await res.json().catch(()=>({}));
  return {
    ok:true,
    runId:data.run_id||data.id||undefined,
    status:data.status||'accepted',
    output:data.output,
    receipt:data
  };
}
