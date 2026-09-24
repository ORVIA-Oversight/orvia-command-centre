import { assertTransition } from './action-machine';
import { assertSeriousConcernTracks } from './serious-concern';
import { assertSeriousConcernClosure } from './case-machine';
import { configCanPublish } from './config-compiler';
import { assertChallengeHumanConsidered, assertIndependentFirstPass } from './challenge';
import type { TransitionContext } from './types';

type TestResult = { name: string; passed: boolean; detail: string };

function run(name: string, test: () => void): TestResult {
  try {
    test();
    return { name, passed: true, detail: 'PASS' };
  } catch (error) {
    return { name, passed: false, detail: error instanceof Error ? error.message : String(error) };
  }
}

function expectThrow(fn: () => void) {
  let threw = false;
  try { fn(); } catch { threw = true; }
  if (!threw) throw new Error('Expected invariant to reject the operation.');
}

export function runV2SelfTests() {
  const routine: TransitionContext = { actorType: 'human', materiality: 'TIER_1_ROUTINE' };

  const results = [
    run('AI cannot change action state', () => expectThrow(() => assertTransition('PROPOSED', 'ASSIGNED', { actorType: 'ai' }))),
    run('Routine action can begin without full JAPAN', () => {
      assertTransition('PROPOSED', 'ASSIGNED', routine);
      assertTransition('ASSIGNED', 'IN_PROGRESS', routine);
    }),
    run('Consequential action cannot execute without human JAPAN', () =>
      expectThrow(() => assertTransition('ASSIGNED', 'IN_PROGRESS', { actorType: 'human', materiality: 'TIER_2_CONSEQUENTIAL', humanGateStatus: 'PENDING' }))),
    run('Completion cannot become verification without VERA', () =>
      expectThrow(() => assertTransition('COMPLETION_CLAIMED', 'VERIFIED', { actorType: 'human' }))),
    run('Ineffective action cannot close', () =>
      expectThrow(() => assertTransition('EFFECTIVENESS_REVIEW', 'CLOSED', { actorType: 'human', effectivenessOutcome: 'not_effective' }))),
    run('Serious Concern requires both tracks', () => expectThrow(() => assertSeriousConcernTracks(['PROTECTION']))),
    run('Serious Concern closure requires two distinct challenges', () =>
      expectThrow(() => assertSeriousConcernClosure({
        actorType: 'human',
        protectionTrackResolved: true,
        inquiryTrackResolved: true,
        challengeApproverIds: ['one'],
        unresolvedMaterialItems: 0,
      }))),
    run('Independent Challenge first pass must be blind to primary analysis', () =>
      expectThrow(() => assertIndependentFirstPass({
        id: 'challenge-1',
        caseId: 'case-1',
        materiality: 'TIER_3_HIGH_CONSEQUENCE',
        mode: 'BLIND_INDEPENDENT',
        question: 'What alternative explanations fit the evidence?',
        blindToPrimaryAtFirstPass: false,
        evidenceManifest: ['evidence-1'],
        alternativeViews: [{ statement: 'Alternative', evidenceRefs: ['evidence-1'], contradictoryEvidenceRefs: [], limitations: 'Test' }],
        discriminatingEvidence: [],
        missingEvidence: [],
        unresolvedUncertainty: [],
        challengerType: 'AI',
        challengerId: 'provider:model',
        status: 'INDEPENDENT_COMPLETE',
      }))),
    run('High-consequence challenge cannot satisfy closure without human consideration', () =>
      expectThrow(() => assertChallengeHumanConsidered({
        id: 'challenge-2',
        caseId: 'case-1',
        materiality: 'TIER_3_HIGH_CONSEQUENCE',
        mode: 'BLIND_INDEPENDENT',
        question: 'What alternative explanations fit the evidence?',
        blindToPrimaryAtFirstPass: true,
        evidenceManifest: ['evidence-1'],
        alternativeViews: [{ statement: 'Alternative', evidenceRefs: ['evidence-1'], contradictoryEvidenceRefs: [], limitations: 'Test' }],
        discriminatingEvidence: [],
        missingEvidence: [],
        unresolvedUncertainty: ['Cause remains uncertain'],
        challengerType: 'AI',
        challengerId: 'provider:model',
        status: 'INDEPENDENT_COMPLETE',
      }))),
    run('Configuration compiler rejects ownerless workflow', () => {
      const outcome = configCanPublish({
        version: '1',
        aiEnabled: false,
        roles: [],
        escalations: [],
        workflows: [{ code: 'routine', version: '1', enabled: true, notificationChannels: ['email'] }],
      });
      if (outcome.ok) throw new Error('Ownerless workflow was incorrectly publishable.');
    }),
    run('Configuration compiler rejects circular escalation', () => {
      const outcome = configCanPublish({
        version: '1',
        aiEnabled: false,
        roles: [{ code: 'A', activeUsers: 1 }, { code: 'B', activeUsers: 1 }],
        escalations: [{ fromRole: 'A', toRole: 'B' }, { fromRole: 'B', toRole: 'A' }],
        workflows: [{ code: 'routine', version: '1', enabled: true, accountableRole: 'A', notificationChannels: ['email'] }],
      });
      if (outcome.ok) throw new Error('Circular escalation was incorrectly publishable.');
    }),
  ];

  return {
    passed: results.every((result) => result.passed),
    passedCount: results.filter((result) => result.passed).length,
    total: results.length,
    results,
  };
}
