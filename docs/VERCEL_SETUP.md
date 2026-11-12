# Vercel deployment guide

1. Open https://vercel.com/new and import ghostcloud2/Gulf-Flow-.
2. Framework preset: Next.js. Root directory: repository root.
3. Deploy without environment variables to preview the interactive front-end dashboard.
4. Open /api/health. databaseConfigured and aiConfigured will be false until configured.
5. Create a Supabase project. Run supabase/migrations/001_core.sql in the SQL editor.
6. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to Vercel environment variables and redeploy.
7. Provision a test business and a test membership using trusted admin tools. Never embed service-role credentials in the browser.
8. Test /api/leads and /api/bookings with a verified Supabase access token.
9. Leave ENABLE_LIVE_AI=false until approved knowledge, privacy and abuse controls are in place. Then add OPENAI_API_KEY as a server-only secret and opt in.
10. Before production: implement authentication UI, provisioning, rate limits, audit trails, consent/retention and cross-tenant security tests.

This is an engineering starter with working UI interactions and guarded API routes, not a fully integrated commercial product.
