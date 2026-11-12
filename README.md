# GulfFlow AI

An interactive, responsive Liquid Glass-inspired Next.js dashboard for the GulfFlow AI automation platform.

## Getting started

```bash
npm install
npm run dev
npm run build
```

## Vercel

Import `ghostcloud2/Gulf-Flow-` from GitHub at https://vercel.com/new and deploy as a Next.js project. No environment variables are required for this front-end prototype.

## Current features

- Responsive light/dark dashboard and navigation
- Sample leads and bookings
- Add/search/update leads in browser memory
- Booking status demo
- Rule-based simulated AI receptionist
- Placeholder modules for future automations and settings

**Important:** This is a front-end demonstration only. Changes reset on refresh. There is no live Supabase database, authentication, tenant isolation, messaging, or real AI integration. Do not use it with customer data. The previous downloadable v0.2 ZIP has additional Supabase starter code, but this repository currently contains a new streamlined Vercel-ready UI foundation rather than an exact upload of that ZIP.

## Next steps

Implement Supabase Auth, tenant-scoped schema and RLS, secure business onboarding, CRM persistence, booking approval workflows, AI provider integration and comprehensive QA. Build status is not verified until Vercel or local npm build completes.
