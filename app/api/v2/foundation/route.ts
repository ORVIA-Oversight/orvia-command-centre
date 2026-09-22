import { NextResponse } from 'next/server';
import { SERIOUS_CONCERN_TRACKS } from '@/lib/v2/serious-concern';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    product: 'ORVIA V2',
    status: 'foundation-build',
    operatingLoop: ['CAPTURE', 'CONNECT', 'ASSURE', 'DECIDE', 'VERIFY', 'RECHECK_LEARN'],
    runtime: 'modular-monolith',
    components: {
      iris: 'deterministic state, ownership, timers, acknowledgement, escalation and human gates',
      hive: 'evidence originals, versions, provenance, assertions, contradictions, dissent and gaps',
      vita: 'assurance tests and challenge',
      vera: 'verification discipline and record structure',
      japan: 'action discipline',
      aria: 'capture adapter',
      ai: 'optional assist only',
    },
    invariants: {
      aiMayChangeState: false,
      timeoutBecomesApproval: false,
      deliveryEqualsAcknowledgement: false,
      completionEqualsVerification: false,
      verificationEqualsEffectiveness: false,
      protectionWaitsForPlatform: false,
      workflowWorksWithAiDisabled: true,
    },
    seriousConcernTracks: SERIOUS_CONCERN_TRACKS,
    productionDatabaseReady: false,
    productionDatabaseReason: 'V2 customer evidence requires a dedicated store separate from the current shared Admin/Voice/PTT Supabase project.',
  });
}
