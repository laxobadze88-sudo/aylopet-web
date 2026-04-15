create table if not exists public.email_delivery_events (
  id bigserial primary key,
  provider text not null,
  email text not null,
  event_type text not null,
  event_at timestamptz not null default now(),
  reason text null,
  provider_message_id text null,
  raw jsonb null,
  created_at timestamptz not null default now()
);

create index if not exists idx_email_delivery_events_email_event_at
  on public.email_delivery_events (email, event_at desc);

create index if not exists idx_email_delivery_events_event_type
  on public.email_delivery_events (event_type);

alter table public.email_delivery_events enable row level security;

drop policy if exists "No direct client access to email delivery events" on public.email_delivery_events;
create policy "No direct client access to email delivery events"
  on public.email_delivery_events
  for all
  using (false)
  with check (false);
