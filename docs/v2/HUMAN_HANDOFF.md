# ORVIA V2 Human Handoff

The backend foundation can be built without making the customer-specific human decisions below.

## Human decisions still required before production

1. Provision/approve the dedicated V2 Supabase/PostgreSQL evidence project.
2. Approve the first tenant's organisation hierarchy and accountable roles.
3. Define which real actions fall into JAPAN materiality tiers 0-3.
4. Approve emergency/break-glass authority and retrospective review times.
5. Name the human roles allowed to authorise consequential and high-consequence action.
6. Approve Serious Concern closure/challenge roles.
7. Approve retention, legal hold and deletion schedules by processing purpose.
8. Approve customer/ORVIA controller-processor responsibilities.
9. Approve first production workflow and escalation map.
10. Approve Human Assurance Board membership, cadence, confidentiality and information-access rules.
11. Approve public claims that can move from UNPROVEN to TESTED/EVIDENCED.
12. Run customer UAT and production-like continuity/failure exercises.

## Safe build boundary

Until those decisions are made:
- keep V2 migrations unapplied to the shared production database;
- keep PR #5 draft;
- do not route live safeguarding/clinical evidence into V2;
- do not represent the V2 control claims as production-proven.
