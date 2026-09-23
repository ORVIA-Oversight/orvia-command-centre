import type { CaseTrackType } from './types';

export const SERIOUS_CONCERN_TRACKS: ReadonlyArray<{
  type: CaseTrackType;
  purpose: string;
  rule: string;
}> = [
  {
    type: 'PROTECTION',
    purpose: 'Record and coordinate immediate protective, emergency and statutory actions.',
    rule: 'Protection never waits for ORVIA, AI, an acknowledgement, or completion of the inquiry track.',
  },
  {
    type: 'INQUIRY',
    purpose: 'Establish what can and cannot be supported by preserved evidence.',
    rule: 'Precautionary action is never converted into a factual finding merely because it was taken.',
  },
];

export function assertSeriousConcernTracks(trackTypes: CaseTrackType[]) {
  const set = new Set(trackTypes);
  if (!set.has('PROTECTION') || !set.has('INQUIRY')) {
    throw new Error('A Serious Concern must maintain separate PROTECTION and INQUIRY tracks.');
  }
  return true;
}
