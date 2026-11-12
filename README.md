# GulfFlow AI — Liquid Glass Business Platform

A responsive Next.js + TypeScript foundation for a Qatar-first, GCC-ready AI automation SaaS. Designed with translucent Liquid Glass panels, animated visual depth, mobile navigation and an interactive command center.

## What's already working

- Interactive responsive dashboard with light/dark themes
- Browser-based CRM: add leads, search and advance lead status
- Booking requests: sample records and manual confirmation toggles
- Rule-based AI receptionist preview, clearly labeled simulated
- Supabase-backed authenticated API endpoints (once configured):
  - GET /api/health
  - GET/POST /api/leads
  - GET/POST /api/bookings
  - PATCH /api/bookings/status
  - POST /api/assistant (live provider optional, disabled by default)
- PostgreSQL migration with tenant-scoped RLS and membership-based permissions
- GitHub Actions typecheck/build workflow

## Deploy to Vercel

Import this repository at https://vercel.com/new. Next.js is automatically detected. Without credentials the front-end preview works with local browser state and sample data. See docs/VERCEL_SETUP.md.

## Environment variables

Copy .env.example. For database endpoints provide NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. Never expose service role keys. Live AI additionally requires OPENAI_API_KEY and ENABLE_LIVE_AI=true.

## Run locally

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

## Critical limitations

The root dashboard currently uses **sample data held in React state**, not the new database APIs. Authenticated UI and trusted tenant onboarding are not yet implemented. The API routes require a Supabase Auth bearer token and SQL migration. The AI provider is not live without explicit configuration. WhatsApp, payments, email and n8n are not connected. Do not enter real customer data into the demo or treat it as production-ready.

## Architecture and next milestones

See docs/INTEGRATIONS_AND_WORKFLOWS.md. Next: Supabase login UI, secure tenant onboarding, connect CRM/booking UI to API, add audit logs/rate limits, test cross-tenant isolation, then integrate approved channels.

## Design goal

Premium iOS-inspired Liquid Glass without copying Apple proprietary assets. Accessible contrast, mobile responsiveness and performance take precedence over decorative effects.
