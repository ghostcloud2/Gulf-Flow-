# GulfFlow AI — integrations and workflows

## What is operational in this commit

- Browser-only CRM and booking demonstration at the root dashboard.
- Authenticated REST endpoints: GET/POST /api/leads, GET/POST /api/bookings, PATCH /api/bookings/status.
- GET /api/health to inspect server-side configuration flags (not secrets).
- POST /api/assistant with bearer token, tenant membership check and published knowledge retrieval. Live AI is **off by default**; it requires an API key and ENABLE_LIVE_AI=true.
- SQL schema and RLS for tenant separation. This migration must be applied manually to Supabase before API endpoints can work.

## Authentication and authorization

1. Provision a Supabase project and run supabase/migrations/001_core.sql.
2. Use Supabase Auth to create verified users.
3. Provision businesses and memberships using a trusted administrator/onboarding workflow. Direct client creation is intentionally disabled.
4. Send Supabase access tokens as Authorization: Bearer <token> to authenticated endpoints.
5. Always include business_id UUID; database RLS enforces membership and write permissions.
6. Test using two businesses and two separate users before onboarding any real customers.

## Planned lead workflow

Inbound form / authorized channel -> validate and deduplicate -> persist lead -> assign staff -> create follow-up task -> notify via approved provider -> log delivery and retries.

## Planned booking workflow

Customer request -> validate service/date -> persist as pending -> notify staff -> staff confirms or declines -> only then send confirmation -> audit history.

## Planned AI receptionist workflow

Receive authorized message -> identify business -> retrieve only published tenant knowledge -> answer within guardrails -> request human approval for prices, booking confirmation or uncertain responses -> log limited metadata.

## External providers

- WhatsApp Business Platform: NOT connected. Requires Meta business onboarding, approved templates and consent controls.
- Email: NOT connected. Select a transactional provider and configure domain authentication.
- n8n: NOT connected. Assess licensing and host internal agency-owned workflows; do not offer hosted n8n editor as an unlicensed SaaS product.
- Billing: NOT connected. Select an approved Qatar-compatible payment provider, then implement webhooks with idempotency and reconciliation.

## Security limitations

API endpoints do not yet implement production rate limits, audit logs, automated abuse detection, or onboarding. Live AI is intentionally opt-in. Do not use the project with real customer data before those controls, privacy review and tenant-isolation tests are completed.
