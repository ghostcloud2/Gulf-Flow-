-- GulfFlow Universal Business OS v0.5
-- Apply AFTER 001_core.sql in Supabase SQL Editor.
-- This migration is idempotent for a clean v0.4 project.
-- It adds independently configurable companies; tenant isolation is a security boundary,
-- not an industry restriction.

alter table public.businesses
  add column if not exists business_model text not null default 'services',
  add column if not exists legal_structure text not null default 'independent',
  add column if not exists description text not null default '',
  add column if not exists currency text not null default 'QAR',
  add column if not exists locale text not null default 'en',
  add column if not exists enabled_modules text[] not null default array['crm','bookings','knowledge','ai'],
  add column if not exists settings jsonb not null default '{}'::jsonb,
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.is_business_admin(target_business uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists(
    select 1 from public.business_memberships m
    where m.business_id=target_business
      and m.user_id=(select auth.uid())
      and m.role in ('owner','manager')
  )
$$;
revoke all on function public.is_business_admin(uuid) from public;
grant execute on function public.is_business_admin(uuid) to authenticated;

-- A trusted, atomic, self-service onboarding method. No service-role key in browsers.
create or replace function public.create_business_workspace(
  p_name text, p_industry text default 'general',
  p_business_model text default 'services',
  p_legal_structure text default 'independent',
  p_modules text[] default array['crm','bookings','knowledge','ai'],
  p_currency text default 'QAR', p_timezone text default 'Asia/Qatar',
  p_locale text default 'en'
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  new_id uuid;
  actor uuid := auth.uid();
  allowed text[] := array[
    'crm','bookings','knowledge','ai','inbox','automations','analytics',
    'inventory','commerce','projects','support','hr','finance','marketing',
    'field_service','education','healthcare','logistics','membership','reports'
  ];
begin
  if actor is null then raise exception 'Sign-in required'; end if;
  if length(btrim(coalesce(p_name,''))) not between 2 and 120 then
    raise exception 'Company name must be 2–120 characters';
  end if;
  if length(coalesce(p_industry,'')) > 80 or length(coalesce(p_business_model,'')) > 80 then
    raise exception 'Invalid classification';
  end if;
  if coalesce(array_length(p_modules,1),0) > 20 or
     exists(select 1 from unnest(coalesce(p_modules,array[]::text[])) v
            where v <> all(allowed)) then
    raise exception 'Unsupported module key';
  end if;
  if p_currency !~ '^[A-Z]{3}$' or length(p_timezone)>64 or length(p_locale)>12 then
    raise exception 'Invalid locale or currency';
  end if;
  insert into public.businesses (
    name, industry, business_model, legal_structure, enabled_modules,
    currency, timezone, locale
  ) values (
    btrim(p_name), p_industry, p_business_model, p_legal_structure,
    coalesce(p_modules,array[]::text[]), p_currency, p_timezone, p_locale
  ) returning id into new_id;
  insert into public.business_memberships(business_id,user_id,role)
    values(new_id,actor,'owner');
  return new_id;
end $$;
revoke all on function public.create_business_workspace(
 text,text,text,text,text[],text,text,text) from public;
grant execute on function public.create_business_workspace(
 text,text,text,text,text[],text,text,text) to authenticated;

-- Existing business read policy stays. Management requires owner/manager.
create policy business_update_v05 on public.businesses
  for update to authenticated
  using(public.is_business_admin(id))
  with check(public.is_business_admin(id));

create policy membership_read_company_v05 on public.business_memberships
  for select to authenticated using(public.is_business_member(business_id));

-- Org chart: divisions, locations, departments, franchises, subsidiaries, teams.
-- Composite FK prevents links to units owned by another company.
create table if not exists public.business_units(
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  parent_id uuid,
  name text not null check(length(btrim(name)) between 2 and 120),
  kind text not null default 'department'
    check(kind in ('head_office','branch','department','team','subsidiary','franchise','division','location')),
  description text not null default '',
  created_at timestamptz not null default now(),
  unique(business_id,id),
  foreign key (business_id,parent_id)
    references public.business_units(business_id,id) on delete restrict
);
create index if not exists business_units_business on public.business_units(business_id);
alter table public.business_units enable row level security;
create policy business_units_read on public.business_units
  for select to authenticated using(public.is_business_member(business_id));
create policy business_units_insert on public.business_units
  for insert to authenticated with check(public.is_business_admin(business_id));
create policy business_units_update on public.business_units
  for update to authenticated using(public.is_business_admin(business_id))
  with check(public.is_business_admin(business_id));
create policy business_units_delete on public.business_units
  for delete to authenticated using(public.is_business_admin(business_id));

-- Custom entity schemas: fields are scoped per company and entity type.
create table if not exists public.custom_fields(
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  entity_kind text not null check(length(entity_kind) between 2 and 80),
  field_key text not null check(field_key ~ '^[a-z][a-z0-9_]{1,63}$'),
  label text not null check(length(label) between 1 and 120),
  field_type text not null check(field_type in
    ('text','long_text','number','currency','date','datetime','boolean','select','email','phone','url')),
  required boolean not null default false,
  options jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique(business_id,entity_kind,field_key)
);
create index if not exists custom_fields_business on public.custom_fields(business_id,entity_kind);
alter table public.custom_fields enable row level security;
create policy custom_fields_read on public.custom_fields
  for select to authenticated using(public.is_business_member(business_id));
create policy custom_fields_insert on public.custom_fields
  for insert to authenticated with check(public.is_business_admin(business_id));
create policy custom_fields_update on public.custom_fields
  for update to authenticated using(public.is_business_admin(business_id))
  with check(public.is_business_admin(business_id));
create policy custom_fields_delete on public.custom_fields
  for delete to authenticated using(public.is_business_admin(business_id));

-- Generic records power unusual industries without adding columns for every customer.
create table if not exists public.business_records(
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  unit_id uuid,
  record_kind text not null check(length(record_kind) between 2 and 80),
  title text not null check(length(title) between 2 and 200),
  status text not null default 'new' check(length(status) between 1 and 60),
  properties jsonb not null default '{}'::jsonb check(jsonb_typeof(properties)='object'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (business_id,unit_id)
    references public.business_units(business_id,id) on delete restrict
);
create index if not exists business_records_business_kind on public.business_records(business_id,record_kind,created_at desc);
create index if not exists business_records_properties on public.business_records using gin(properties);
alter table public.business_records enable row level security;
create policy business_records_read on public.business_records
  for select to authenticated using(public.is_business_member(business_id));
create policy business_records_insert on public.business_records
  for insert to authenticated with check(public.can_manage_business(business_id) and
    created_by=(select auth.uid()));
create policy business_records_update on public.business_records
  for update to authenticated using(public.can_manage_business(business_id))
  with check(public.can_manage_business(business_id));
create policy business_records_delete on public.business_records
  for delete to authenticated using(public.is_business_admin(business_id));

-- Declarative automation definitions; executing requires a separate trusted worker.
create table if not exists public.workflow_definitions(
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null check(length(name) between 2 and 160),
  description text not null default '',
  trigger_event text not null default 'lead.created',
  steps jsonb not null default '[]'::jsonb check(jsonb_typeof(steps)='array'),
  status text not null default 'draft' check(status in ('draft','paused','active')),
  created_at timestamptz not null default now()
);
alter table public.workflow_definitions enable row level security;
create policy workflow_read on public.workflow_definitions
  for select to authenticated using(public.is_business_member(business_id));
create policy workflow_insert on public.workflow_definitions
  for insert to authenticated with check(public.is_business_admin(business_id));
create policy workflow_update on public.workflow_definitions
  for update to authenticated using(public.is_business_admin(business_id))
  with check(public.is_business_admin(business_id));
create policy workflow_delete on public.workflow_definitions
  for delete to authenticated using(public.is_business_admin(business_id));

create table if not exists public.ai_agents(
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null check(length(name) between 2 and 120),
  purpose text not null default 'Customer support',
  instructions text not null default '' check(length(instructions)<=8000),
  language text not null default 'en',
  approval_required boolean not null default true,
  status text not null default 'draft' check(status in ('draft','testing','enabled','paused')),
  created_at timestamptz not null default now()
);
alter table public.ai_agents enable row level security;
create policy agents_read on public.ai_agents for select to authenticated using(public.is_business_member(business_id));
create policy agents_insert on public.ai_agents for insert to authenticated with check(public.is_business_admin(business_id));
create policy agents_update on public.ai_agents for update to authenticated using(public.is_business_admin(business_id))
  with check(public.is_business_admin(business_id));
create policy agents_delete on public.ai_agents for delete to authenticated using(public.is_business_admin(business_id));

-- Store connection descriptors only; secrets and OAuth tokens live in provider-managed vaults.
create table if not exists public.integration_registry(
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  provider text not null,
  status text not null default 'not_connected'
    check(status in ('not_connected','setup_pending','connected','error')),
  metadata jsonb not null default '{}'::jsonb,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  unique(business_id,provider)
);
alter table public.integration_registry enable row level security;
create policy integration_read on public.integration_registry
  for select to authenticated using(public.is_business_member(business_id));
-- No direct client writes; trusted verified callback handlers will manage state.

create table if not exists public.audit_events(
  id bigint generated always as identity primary key,
  business_id uuid not null references public.businesses(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_events_business on public.audit_events(business_id,created_at desc);
alter table public.audit_events enable row level security;
create policy audit_read on public.audit_events
  for select to authenticated using(public.is_business_admin(business_id));
-- No client writes to audit log. Use SECURITY DEFINER audited action RPCs later.

-- Existing knowledge base becomes editable by company admins.
create policy knowledge_insert_v05 on public.knowledge_entries
  for insert to authenticated with check(public.is_business_admin(business_id));
create policy knowledge_update_v05 on public.knowledge_entries
  for update to authenticated using(public.is_business_admin(business_id))
  with check(public.is_business_admin(business_id));
create policy knowledge_delete_v05 on public.knowledge_entries
  for delete to authenticated using(public.is_business_admin(business_id));

-- A booking's lead must belong to the same company as the booking.
alter table public.leads
  add constraint leads_business_id_id_unique unique (business_id,id);
alter table public.booking_requests
  add constraint booking_requests_lead_same_business
  foreign key (business_id,lead_id)
  references public.leads(business_id,id);
