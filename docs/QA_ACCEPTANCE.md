# GulfFlow v0.5 QA and release gate

## Build checks
- [ ] Vercel preview reports READY for the final commit.
- [ ] Next.js TypeScript check completes without errors.
- [ ] /, /studio, /sign-in, /workspace, /copilot and /demo return HTTP 200.
- [ ] /api/health returns service=GulfFlow AI and databaseConfigured=true when environment keys exist.
- [ ] Unauthenticated API requests cannot retrieve company data.

## Database setup
- [ ] Review 001_core.sql before applying.
- [ ] Review and apply 002_universal_business_os.sql to a backed-up test database.
- [ ] Verify no duplicate-policy / migration conflicts.
- [ ] Ensure all tables have RLS enabled and proper SELECT/INSERT/UPDATE policies.
- [ ] Verify create_business_workspace RPC rejects anonymous callers and creates owner membership atomically.
- [ ] Confirm company A cannot see company B's organizations, custom fields, records, workflow definitions, knowledge or agent profiles.
- [ ] Confirm viewer cannot create records; staff cannot publish knowledge; owner can.
- [ ] Confirm cross-company business_unit parent_id and booking lead_id are rejected by composite foreign keys.
- [ ] Confirm stale and invalid Supabase sessions are denied.

## User workflows
- [ ] New user signs up and verifies email; password recovery works.
- [ ] Signed-in owner creates one services company and one retail company with different configurations.
- [ ] Create nested departments and branches independently.
- [ ] Build custom entity fields; create typed records and read back.
- [ ] Create, publish and unpublish Knowledge Base entries.
- [ ] Build workflow draft with multiple steps and confirm no execution is falsely indicated.
- [ ] Create an AI agent draft; confirm it cannot send messages.
- [ ] Change modules independently; ensure navigation reflects enabled modules.
- [ ] Open Copilot; ask about company structure. Check returned source titles and company isolation.
- [ ] Verify responsive layouts at desktop, tablet, mobile and both themes.

## Future production gates
- [ ] Rate limits, idempotency, observability and audit log coverage
- [ ] Approved AI model key and token/spend limits
- [ ] Data retention, DPA, privacy and Qatar/GCC requirements review
- [ ] Real provider webhook verification and retry handling
- [ ] Accessibility and RTL QA
- [ ] Penetration testing, backup/restore drills and disaster recovery
