-- GulfFlow AI secure multi-tenant foundation. Run in Supabase SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.businesses(id uuid primary key default gen_random_uuid(),name text not null check(length(name) between 2 and 160),industry text not null default 'general',timezone text not null default 'Asia/Qatar',created_at timestamptz not null default now());
create table if not exists public.business_memberships(business_id uuid not null references public.businesses(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,role text not null default 'staff' check(role in ('owner','manager','staff','viewer')),created_at timestamptz not null default now(),primary key(business_id,user_id));
create table if not exists public.leads(id uuid primary key default gen_random_uuid(),business_id uuid not null references public.businesses(id) on delete cascade,name text not null check(length(name) between 2 and 120),email text,service text not null,status text not null default 'new' check(status in ('new','contacted','qualified','closed')),created_at timestamptz not null default now());
create table if not exists public.booking_requests(id uuid primary key default gen_random_uuid(),business_id uuid not null references public.businesses(id) on delete cascade,lead_id uuid references public.leads(id) on delete set null,customer_name text not null,service text not null,requested_at timestamptz not null,status text not null default 'pending' check(status in ('pending','confirmed','cancelled')),created_at timestamptz not null default now());
create table if not exists public.knowledge_entries(id uuid primary key default gen_random_uuid(),business_id uuid not null references public.businesses(id) on delete cascade,question text not null,answer text not null,published boolean not null default false,created_at timestamptz not null default now());
create index if not exists leads_business_created_idx on public.leads(business_id,created_at desc);
create index if not exists bookings_business_created_idx on public.booking_requests(business_id,created_at desc);
create index if not exists knowledge_business_idx on public.knowledge_entries(business_id,published);
create index if not exists memberships_user_idx on public.business_memberships(user_id,business_id);
-- SECURITY DEFINER avoids recursive RLS when checking membership.
create or replace function public.is_business_member(target_business uuid) returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.business_memberships m where m.business_id=target_business and m.user_id=(select auth.uid())) $$;
create or replace function public.can_manage_business(target_business uuid) returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.business_memberships m where m.business_id=target_business and m.user_id=(select auth.uid()) and m.role in ('owner','manager','staff')) $$;
revoke all on function public.is_business_member(uuid) from public;
revoke all on function public.can_manage_business(uuid) from public;
grant execute on function public.is_business_member(uuid),public.can_manage_business(uuid) to authenticated;
alter table public.businesses enable row level security;
alter table public.business_memberships enable row level security;
alter table public.leads enable row level security;
alter table public.booking_requests enable row level security;
alter table public.knowledge_entries enable row level security;
create policy business_read on public.businesses for select to authenticated using (public.is_business_member(id));
create policy membership_read on public.business_memberships for select to authenticated using (user_id=(select auth.uid()));
create policy lead_read on public.leads for select to authenticated using (public.is_business_member(business_id));
create policy lead_insert on public.leads for insert to authenticated with check (public.can_manage_business(business_id));
create policy lead_update on public.leads for update to authenticated using (public.can_manage_business(business_id)) with check(public.can_manage_business(business_id));
create policy booking_read on public.booking_requests for select to authenticated using (public.is_business_member(business_id));
create policy booking_insert on public.booking_requests for insert to authenticated with check(public.can_manage_business(business_id));
create policy booking_update on public.booking_requests for update to authenticated using(public.can_manage_business(business_id)) with check(public.can_manage_business(business_id));
create policy knowledge_read on public.knowledge_entries for select to authenticated using(public.is_business_member(business_id));
-- No direct business or membership creation from client. Provision via trusted onboarding service after verification.
-- No knowledge writes until approved editorial workflow is implemented.
