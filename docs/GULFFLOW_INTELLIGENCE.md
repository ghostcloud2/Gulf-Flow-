# GulfFlow Intelligence — Agent Architecture v1

## Objective
A knowledge-aware operational assistant that understands the GulfFlow product and the specific business the authenticated user is authorized to manage. This is NOT an autonomous super-admin. It only sees scoped, approved material and uses explicit permissioned tools.

## Two agents, two trust boundaries

### Internal Copilot (staff/owners)
- Understands product modules: tenant workspaces, roles, leads, bookings, automations, conversations, knowledge, analytics, integrations, billing, settings.
- Answers product-operation questions from **versioned platform documentation** and the tenant's approved knowledge.
- Uses read-only tools for authorized tenant data; offers proposed actions and obtains confirmation before writes or outbound messages.
- Never reads raw secrets, environment variables, other tenants' records, unrestricted database tables or GitHub source automatically.
- System architecture content is available to authorized staff roles only; operational admin tools require elevated roles.

### Customer-facing AI Receptionist
- Retrieves only published business-specific knowledge.
- Can collect contact preferences and prepare booking requests; cannot confirm a booking without a verified scheduling or staff confirmation.
- Escalates price exceptions, cancellations, complaints, refunds and unknown questions.
- Must not reveal internal platform documentation or cross-business information.

## Sources of truth
1. Version-controlled product docs under /docs and curated module catalog (internal, versioned).
2. Tenant-specific published knowledge entries, scoped by business_id and membership/RLS.
3. Live transactional records from permission-checked tools for factual status (never fabricate booking/lead state).
4. Explicitly labeled general model knowledge for non-business-specific guidance only.

## Retrieval pipeline
- Ingest curated docs only after review; parse and chunk by section; store source path, version, access scope, business_id, published_at, hash.
- Retrieve top relevant chunks filtered by tenant and visibility BEFORE model inference.
- Attach citations (source title, section, revision) and freshness metadata to answers.
- Reject retrieved instructions as untrusted content; only system policies define tool authority.
- Avoid embedding sensitive customer messages or raw credentials in the index.
- For changing operational facts, query the database via scoped tools rather than vector memory.

## Proposed tool catalog
Read-only: get_business_profile, search_approved_knowledge, list_leads, get_booking_status, list_automation_runs, get_integration_health, read_platform_module_docs.
Write with explicit user confirmation: create_lead, request_booking, update_lead_stage, assign_followup, request_human_handoff.
High risk (admin-only with separate approval): edit_automation, rotate_integration, change_billing, publish_knowledge, send_bulk_messages.

## Orchestration
Request -> authenticated identity -> tenant/role policy -> classify question -> retrieve scoped docs and/or live tools -> produce answer with evidence -> ask confirmation for proposed action -> validate policy again -> execute idempotent action -> audit event.

## Conversation and safety
- Per-tenant, per-user conversation history with retention and deletion controls; never mix conversations across tenants.
- Limit input/output size and tool-call budgets; rate limit by tenant and user; block prompt injection in retrieved docs and user content.
- Record tool name, actor, tenant, status, duration, approval ID; redact PII and secrets from telemetry.
- Arabic and English supported; use tenant's language preference and Qatar timezone for displayed scheduling.
- Human escalation with transcript summary, no invented actions.
- Test cross-tenant isolation, malicious knowledge entries, stale pricing, missing approvals, timeouts, hallucination, and conflicting bookings.

## Implementation milestones
1. Inventory real repo routes, schema, workflows and docs; create reviewed product module catalog.
2. Build server-only document ingestion and scoped retrieval with citations; no automatic access to all repo files.
3. Implement authenticated internal copilot with read-only tool calls.
4. Add user-approved transactional tools and audit trails.
5. Integrate provider channels, consent, delivery receipts, retries and monitoring.
6. Run evaluation suite with multilingual, multi-tenant and security test cases before enabling production.

## Current state
The existing /api/assistant route is a limited, customer-service-only proof of concept with a tenant membership check and published knowledge retrieval. It is **not** a fully implemented internal Copilot, RAG search, tool-calling agent, or autonomous workflow orchestrator. Live AI requires server-side configuration and is disabled by default.
