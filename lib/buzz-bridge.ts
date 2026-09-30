export const BUZZ_JOB_REQUEST_KIND = 43001;
export const BUZZ_WORKFLOW_KIND_MIN = 46001;
export const BUZZ_WORKFLOW_KIND_MAX = 46012;

export type BuzzBridgeConfig={
  relayUrl:string|null;
  privateKeyConfigured:boolean;
};

export type BuzzOrviaEnvelope={
  buzzEventId:string;
  buzzKind:number;
  roomRef?:string|null;
  sourceAgent?:string|null;
  targetAgent?:string|null;
  orviaJobId?:string|null;
  orviaHandoffId?:string|null;
  evidenceRefs?:string[];
};

export function buzzBridgeConfig():BuzzBridgeConfig{
  return {
    relayUrl:process.env.BUZZ_RELAY_URL||null,
    privateKeyConfigured:Boolean(process.env.BUZZ_PRIVATE_KEY)
  };
}

export function buzzBridgeConfigured(){
  const cfg=buzzBridgeConfig();
  return Boolean(cfg.relayUrl&&cfg.privateKeyConfigured);
}

export function isBuzzWorkflowKind(kind:number){
  return kind>=BUZZ_WORKFLOW_KIND_MIN&&kind<=BUZZ_WORKFLOW_KIND_MAX;
}

export function orviaControlForBuzzEvent(kind:number){
  if(kind===BUZZ_JOB_REQUEST_KIND)return 'JOB';
  if(isBuzzWorkflowKind(kind))return 'WORKFLOW';
  return 'COLLABORATION';
}

/**
 * ORVIA boundary:
 * Buzz is the collaboration/event-room substrate only.
 * HIVE/Supabase remains the canonical ORVIA work/evidence state.
 * VITA/VERA and human approval gates remain authoritative.
 */
export function requireOrviaReceipt(envelope:BuzzOrviaEnvelope){
  return {
    source_system:'BUZZ',
    source_reference:envelope.buzzEventId,
    control_type:orviaControlForBuzzEvent(envelope.buzzKind),
    room_ref:envelope.roomRef??null,
    source_agent:envelope.sourceAgent??null,
    target_agent:envelope.targetAgent??null,
    job_id:envelope.orviaJobId??null,
    handoff_id:envelope.orviaHandoffId??null,
    evidence_refs:envelope.evidenceRefs??[]
  };
}
