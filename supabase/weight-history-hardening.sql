-- ============================================
-- Weight History Hardening (idempotent)
-- Run in Supabase SQL Editor once
-- ============================================

begin;

-- 1) Ensure flexible timestamp/weight columns exist
alter table if exists public.weight_history
  add column if not exists recorded_at timestamptz;

alter table if exists public.weight_history
  add column if not exists weight numeric;

alter table if exists public.weight_history
  add column if not exists weight_kg numeric;

-- Backfill recorded_at from created_at when missing
update public.weight_history
set recorded_at = coalesce(recorded_at, created_at, now())
where recorded_at is null;

-- Default timestamp for new rows
alter table if exists public.weight_history
  alter column recorded_at set default now();

-- 2) Keep weight and weight_kg synchronized (supports mixed app clients)
create or replace function public.weight_history_sync_fields()
returns trigger
language plpgsql
as $$
begin
  if new.weight is null and new.weight_kg is null then
    raise exception 'Either weight or weight_kg must be provided';
  end if;

  if new.weight is null then
    new.weight := new.weight_kg;
  end if;

  if new.weight_kg is null then
    new.weight_kg := new.weight;
  end if;

  if new.recorded_at is null then
    new.recorded_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists trg_weight_history_sync_fields on public.weight_history;
create trigger trg_weight_history_sync_fields
before insert or update on public.weight_history
for each row
execute function public.weight_history_sync_fields();

-- 3) Performance index for timeline fetches
create index if not exists idx_weight_history_dog_recorded_at
  on public.weight_history (dog_id, recorded_at);

-- 4) RLS policies (owner of the dog can CRUD)
alter table if exists public.weight_history enable row level security;

drop policy if exists "Users can view weight history for own dogs" on public.weight_history;
create policy "Users can view weight history for own dogs"
on public.weight_history
for select
to authenticated
using (
  exists (
    select 1
    from public.dogs d
    where d.id = weight_history.dog_id
      and d.owner_id = auth.uid()
  )
);

drop policy if exists "Users can insert weight history for own dogs" on public.weight_history;
create policy "Users can insert weight history for own dogs"
on public.weight_history
for insert
to authenticated
with check (
  exists (
    select 1
    from public.dogs d
    where d.id = weight_history.dog_id
      and d.owner_id = auth.uid()
  )
);

drop policy if exists "Users can update weight history for own dogs" on public.weight_history;
create policy "Users can update weight history for own dogs"
on public.weight_history
for update
to authenticated
using (
  exists (
    select 1
    from public.dogs d
    where d.id = weight_history.dog_id
      and d.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.dogs d
    where d.id = weight_history.dog_id
      and d.owner_id = auth.uid()
  )
);

drop policy if exists "Users can delete weight history for own dogs" on public.weight_history;
create policy "Users can delete weight history for own dogs"
on public.weight_history
for delete
to authenticated
using (
  exists (
    select 1
    from public.dogs d
    where d.id = weight_history.dog_id
      and d.owner_id = auth.uid()
  )
);

grant select, insert, update, delete on public.weight_history to authenticated;

commit;

-- Optional verification
-- select id, dog_id, weight, weight_kg, recorded_at
-- from public.weight_history
-- where dog_id in (select id from public.dogs where owner_id = auth.uid())
-- order by recorded_at asc;
