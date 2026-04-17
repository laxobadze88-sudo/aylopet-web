-- ============================================
-- Delivery Zone Requests (idempotent)
-- Run in Supabase SQL Editor once
-- ============================================

begin;

create table if not exists public.delivery_zone_requests (
  id uuid primary key default gen_random_uuid(),
  requested_city text not null,
  requester_name text,
  requester_email text,
  note text,
  source text default 'website',
  created_at timestamptz not null default now()
);

alter table if exists public.delivery_zone_requests
  add column if not exists requested_city text;
alter table if exists public.delivery_zone_requests
  add column if not exists requester_name text;
alter table if exists public.delivery_zone_requests
  add column if not exists requester_email text;
alter table if exists public.delivery_zone_requests
  add column if not exists note text;
alter table if exists public.delivery_zone_requests
  add column if not exists source text;
alter table if exists public.delivery_zone_requests
  add column if not exists created_at timestamptz;

alter table if exists public.delivery_zone_requests
  alter column created_at set default now();

-- Basic data quality checks
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'delivery_zone_requests_requested_city_nonempty_check'
      and conrelid = 'public.delivery_zone_requests'::regclass
  ) then
    alter table public.delivery_zone_requests
      add constraint delivery_zone_requests_requested_city_nonempty_check
      check (length(trim(requested_city)) > 0);
  end if;
end $$;

-- Useful indexes for analytics
create index if not exists idx_delivery_zone_requests_city
  on public.delivery_zone_requests (lower(requested_city));
create index if not exists idx_delivery_zone_requests_created_at
  on public.delivery_zone_requests (created_at desc);

-- RLS: public can insert requests, read restricted to service role/admin tools
alter table if exists public.delivery_zone_requests enable row level security;

drop policy if exists "Anyone can submit delivery zone request" on public.delivery_zone_requests;
create policy "Anyone can submit delivery zone request"
on public.delivery_zone_requests
for insert
to anon, authenticated
with check (true);

drop policy if exists "No public read delivery zone requests" on public.delivery_zone_requests;
create policy "No public read delivery zone requests"
on public.delivery_zone_requests
for select
to anon, authenticated
using (false);

grant insert on public.delivery_zone_requests to anon, authenticated;
revoke select, update, delete on public.delivery_zone_requests from anon, authenticated;

commit;

-- Optional quick stats
-- select lower(requested_city) as city, count(*) as requests
-- from public.delivery_zone_requests
-- group by lower(requested_city)
-- order by requests desc;
