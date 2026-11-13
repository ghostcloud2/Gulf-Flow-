# GulfFlow AI — Universal Business Operating System (v0.5)

## Product vision
GulfFlow does not hard-code a salon, garage, agency or restaurant schema into the entire app. The system uses **independently configurable companies**, an extensible module catalog, organizational hierarchies, field definitions, universal records, approved knowledge and optional assistants. The word “tenant” means an access-control/data boundary only. It is **not** a business-model or company-structure limitation.

## Universal capabilities
- One authenticated account can own or join more than one company.
- The owner selects a starter blueprint or configures from scratch.
- Independent business model: services, products, hybrid, marketplace, membership, nonprofit or custom.
- Independent legal/operating structure: single company, multiple branches, holding company, franchise, nonprofit, department/division or custom.
- Per-company currency, timezone, locale, enabled modules and settings.
- Nested business_units: head offices, subsidiaries, departments, branches, franchises, teams and locations.
- Per-company custom_fields define data shapes for arbitrary entity kinds.
- business_records stores those entities with title, kind, status and typed JSON properties.
- Knowledge Base: draft -> manager/owner publication -> assistant retrieval. Drafts are never included in assistant responses.
- Workflow definitions persist trigger type and action-step drafts. **No automatic execution engine is wired yet.**
- AI agent profiles persist configurable names, purposes and instructions as drafts. **No autonomous actions are wired yet.**
- Copilot uses user authentication, company membership, scoped configuration, platform docs and published knowledge; optionally requests an OpenAI answer if enabled.
- Clients may use an existing business as a standalone workspace; operators can manage multiple independent companies.

## Key screens
| URL | Description | Implementation |
|---|---|---|
| / | Premium responsive product entry | Implemented |
| /studio | Four-step business configurator | Implemented |
| /sign-in | Supabase email/password sign-in + signup + recovery | Implemented |
| /workspace | Company selector, real CRUD, Knowledge, Flow, Agents, Data Studio | Implemented (migration required) |
| /copilot | Company-scoped documentation/knowledge chat | Implemented (migration required) |
| /demo | Legacy local demo preserved | Implemented |
| /api/copilot | Authenticated scoped retrieval and optional AI | Implemented |
| /api/health | Operational configuration flags | Implemented |

## Security model
- **Each company has a unique business_id**, used across every database row.
- Authentication uses Supabase Auth.
- SQL policy functions check the authenticated user and company membership for every protected table.
- Only owners/managers can publish knowledge and configure organizational structures.
- Staff may create authorized records; viewers can only read.
- A single public browser API key is acceptable when protected by RLS; **never** add a service-role key to a browser.
- The create_business_workspace RPC checks auth.uid, validates inputs and creates owner membership atomically.
- Copilot validates the bearer token server-side, selects the company under RLS and reads published knowledge only.
- Adding a new company does not copy another company's data, AI instructions or integrations.
- The platform documentation includes safe product architecture, not secrets.

## Database setup (required before running authenticated CRUD)
The Vercel project has Supabase env keys, but that alone does not create tables or policies.
1. In Supabase, run supabase/migrations/001_core.sql.
2. Then run supabase/migrations/002_universal_business_os.sql.
3. Configure Supabase Authentication > URL Configuration to permit the production domain and preview redirect URLs as appropriate. Use verified email sign-up.
4. Sign up or sign in at /sign-in.
5. Open /studio, configure an independently owned company, create it using RPC.
6. Open /workspace. Add units, custom data fields, records, workflow drafts, published knowledge and agent drafts.
7. Open /copilot for documentation-grounded answers within that company.
8. Test with two users and two companies, verifying that each one is denied access to the other's data.

**Do not** apply database migrations blindly to an existing production database without review and backup. The SQL under /supabase/migrations has not been automatically run by GitHub or Vercel.

## Integration roadmap
1. Rate limits, audit logging, verified email, role-based staff invitations, per-company secrets vault and storage.
2. Calendar connection -> verified availability -> staff/human approval -> notifications.
3. WhatsApp Business API authorization, webhook verification, consent, templates, retries and outbound send approval.
4. Email provider with DKIM/SPF, opt-in and bounce handling.
5. AI provider via server-side secret and cost budgets, citations, safe tool calls and approval.
6. Workflow executor with durable queue, retries, idempotency keys, timeouts, logs and per-company isolation.
7. Billing through Qatar-compatible provider, webhook signature verification and idempotency.
8. Arabic RTL UI/translation, accessibility QA and performance budgets.

## Reality check
The front-end and guarded CRUD code are operational after database migration. The assistant can do deterministic knowledge retrieval without a live model. However, execution workers, provider accounts, genuine communications, payment capture and end-to-end security certification are not part of v0.5. Do not market this as production-ready yet.
