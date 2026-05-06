-- Cookie consent logging (current state + audit events)
-- Run in Supabase SQL Editor once.

create extension if not exists pgcrypto;

create table if not exists public.cookie_consents_current (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete set null,
  session_id uuid not null unique,
  essential boolean not null default true,
  analytics boolean not null default false,
  marketing boolean not null default false,
  consent_status text not null check (consent_status in ('accepted_all', 'rejected_non_essential', 'customized')),
  consent_version text not null default '2026-02-27',
  source text not null default 'banner',
  locale text null,
  user_agent text null,
  ip_hash text null,
  last_action_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cookie_consent_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete set null,
  session_id uuid not null,
  essential boolean not null default true,
  analytics boolean not null default false,
  marketing boolean not null default false,
  consent_status text not null check (consent_status in ('accepted_all', 'rejected_non_essential', 'customized')),
  consent_version text not null default '2026-02-27',
  source text not null default 'banner',
  locale text null,
  user_agent text null,
  ip_hash text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_cookie_consents_current_user_id on public.cookie_consents_current(user_id);
create index if not exists idx_cookie_consents_current_updated_at on public.cookie_consents_current(updated_at desc);
create index if not exists idx_cookie_consent_events_session_id on public.cookie_consent_events(session_id);
create index if not exists idx_cookie_consent_events_user_id on public.cookie_consent_events(user_id);
create index if not exists idx_cookie_consent_events_created_at on public.cookie_consent_events(created_at desc);
create index if not exists idx_cookie_consent_events_status on public.cookie_consent_events(consent_status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_cookie_consents_current_set_updated_at on public.cookie_consents_current;
create trigger trg_cookie_consents_current_set_updated_at
before update on public.cookie_consents_current
for each row
execute function public.set_updated_at();

alter table public.cookie_consents_current enable row level security;
alter table public.cookie_consent_events enable row level security;

-- Deny read/write for anon/authenticated; managed only via secure server API (service role).
drop policy if exists cookie_consents_current_no_access_anon_auth on public.cookie_consents_current;
create policy cookie_consents_current_no_access_anon_auth
on public.cookie_consents_current
as restrictive
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists cookie_consent_events_no_access_anon_auth on public.cookie_consent_events;
create policy cookie_consent_events_no_access_anon_auth
on public.cookie_consent_events
as restrictive
for all
to anon, authenticated
using (false)
with check (false);

revoke all on public.cookie_consents_current from anon, authenticated;
revoke all on public.cookie_consent_events from anon, authenticated;

