# IRIS Canonicalisation and Command Retirement Plan

Date: 30 Sep 2026

## Decision

IRIS is the single ORVIA operating application.

Command is not a separate product. It is the internal operating architecture beneath IRIS.

Target user model:

Managing Director -> IRIS -> ORVIA Workforce -> HIVE -> VITA / VERA -> Human Approval -> Action

## Canonical identity

- Canonical product name: IRIS
- Canonical domain: iris.orvia.org.uk
- Desired Vercel project: orvia-iris
- Command domain: command.orvia.org.uk becomes alias/redirect only after migration verification
- Existing Command/Brain projects are retirement candidates, not immediate deletion targets

## Retirement safety gate

Do not delete or disconnect an old Command/IRIS/Brain project until all are checked:

1. domains and redirects
2. production environment variables / secrets
3. cron jobs and scheduled workers
4. unique API routes or functions
5. Supabase/HIVE writes
6. SharePoint integration
7. webhook callbacks
8. production traffic/logs
9. deployment source repository/branch
10. rollback snapshot

If any unique dependency exists, migrate it into canonical IRIS first.

## Known candidates

- orvia-command -> RETIRE CANDIDATE after migration
- orvia-brain-prototype -> archive/retire after uniqueness check
- old IRIS-only experimental deployments -> retire after canonical project health verified
- generic staging/public projects -> do not remove until individually classified

## Build consolidation

Active IRIS master candidate must reconcile:
- workforce/gateway foundation
- 360-degree workforce and agent handoffs
- universal intake architecture
- VITA/VERA assurance loop
- Command Mail
- Microsoft 365 / SharePoint
- Monday work layer
- Buzz collaboration substrate
- HIVE evidence and work state

No duplicate top-level Command application should remain after acceptance.
