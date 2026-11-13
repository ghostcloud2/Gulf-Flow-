# GulfFlow AI · Universal Business OS

**GulfFlow is an AI-assisted, modular business operating system, not a single-industry CRM.** Every company can independently select its business model, organizational structure, modules, data fields, workflow definitions and knowledge rules.

## Live application

Vercel: https://vercel.com/robinsonkip4-7991/gulf-flow (project linked to `ghostcloud2/Gulf-Flow-`).

| Route | Feature |
|---|---|
| `/` | Premium Liquid Glass-inspired landing |
| `/studio` | Four-step universal company creation flow |
| `/sign-in` | Supabase email authentication and recovery |
| `/workspace` | Authenticated company control center, custom records, units, data fields, knowledge, workflows and agent profiles |
| `/copilot` | Company-scoped knowledge assistant and source citations |
| `/demo` | Preserved interactive local-only dashboard |
| `/api/health` | Configuration flags (never secrets) |

## Setup and database

The Vercel project already has a connected Supabase integration, but `/workspace` is operational **only after both migrations are applied**:

1. Review `supabase/migrations/001_core.sql` and `002_universal_business_os.sql`.
2. Apply migrations in order to a backed-up test Supabase project using SQL Editor. This step is **not automatic**.
3. Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` exist in Vercel.
4. Configure Supabase Auth redirect URL allowlist for the deployed domain.
5. Create an account via `/sign-in`, configure company via `/studio`, and manage records via `/workspace`.

## Local development

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

To enable optional live AI, add `OPENAI_API_KEY`, `ENABLE_LIVE_AI=true` and optional `OPENAI_MODEL` to **server-only** Vercel environment settings. Live AI remains off by default. Use spending limits and rate limits before enabling in production.

## Built vs planned

Built: responsive UI, editable company blueprints, business units, custom fields and entity records, database RLS policies, owner onboarding RPC, knowledge publishing flow, workflow draft designer, agent profiles, authenticated knowledge search and optional OpenAI provider endpoint. These features require applying the database migration.

Not yet built: production-grade workflow executor, verified WhatsApp and email integrations, calendar availability, payment capture, autonomous agent tool execution, company member invitations, rate limiting, full Arabic RTL, and production compliance assurance. Do **not** claim these are live.

See `docs/UNIVERSAL_BUSINESS_OS.md` for architecture and `docs/QA_ACCEPTANCE.md` for tests.
