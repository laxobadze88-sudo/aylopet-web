-- ============================================
-- Safe Account Deletion Helpers (idempotent)
-- Run in Supabase SQL Editor once
-- ============================================

begin;

-- 1) Delete all user-owned storage objects (best-effort)
create or replace function public.delete_user_storage_objects_safe(p_user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Deletes files stored under {user_id}/... for both buckets we use.
  -- Dog photos policy stores paths as: {user_id}/{dog_id}/{filename}
  -- Review videos policy stores paths as: {user_id}/{timestamp}-{uuid}.{ext}
  delete from storage.objects
  where bucket_id in ('dog-photos', 'review-videos')
    -- Storage object path format: {user_id}/...
    and split_part(name, '/', 1) = p_user_id::text;
exception
  when others then
    -- Best-effort: if storage schema differs, do not break account deletion.
    null;
end;
$$;

-- 2) Delete user application data (best-effort with existence checks)
create or replace function public.delete_user_app_data_safe(p_user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Weight history & medical records via dogs owned by user
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'dogs'
  )
  and exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'dogs' and column_name = 'owner_id'
  ) then
    if exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'weight_history'
    )
    and exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'weight_history' and column_name = 'dog_id'
    ) then
      begin
        delete from public.weight_history
        where dog_id in (select id from public.dogs where owner_id = p_user_id);
      exception when others then null;
      end;
    end if;

    if exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'medical_records'
    )
    and exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'medical_records' and column_name = 'dog_id'
    ) then
      begin
        delete from public.medical_records
        where dog_id in (select id from public.dogs where owner_id = p_user_id);
      exception when others then null;
      end;
    end if;

    begin
      delete from public.dogs where owner_id = p_user_id;
    exception when others then null;
    end;
  end if;

  -- Promo codes
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='promo_codes')
  and exists (select 1 from information_schema.columns where table_schema='public' and table_name='promo_codes' and column_name='user_id') then
    begin
      delete from public.promo_codes where user_id = p_user_id;
    exception when others then null;
    end;
  end if;

  -- Referrals
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='referrals_tracking')
  and exists (select 1 from information_schema.columns where table_schema='public' and table_name='referrals_tracking' and column_name='referrer_id')
  and exists (select 1 from information_schema.columns where table_schema='public' and table_name='referrals_tracking' and column_name='referee_id') then
    begin
      delete from public.referrals_tracking
      where referrer_id = p_user_id or referee_id = p_user_id;
    exception when others then null;
    end;
  end if;

  -- Reward logs
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='reward_logs')
  and exists (select 1 from information_schema.columns where table_schema='public' and table_name='reward_logs' and column_name='user_id') then
    begin
      delete from public.reward_logs where user_id = p_user_id;
    exception when others then null;
    end;
  end if;

  -- Reviews & review comments
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='reviews')
  and exists (select 1 from information_schema.columns where table_schema='public' and table_name='reviews' and column_name='user_id') then
    begin
      delete from public.reviews where user_id = p_user_id;
    exception when others then null;
    end;
  end if;

  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='review_comments')
  and exists (select 1 from information_schema.columns where table_schema='public' and table_name='review_comments' and column_name='user_id') then
    begin
      delete from public.review_comments where user_id = p_user_id;
    exception when others then null;
    end;
  end if;

  -- Quiz submissions
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='quiz_submissions')
  and exists (select 1 from information_schema.columns where table_schema='public' and table_name='quiz_submissions' and column_name='user_id') then
    begin
      delete from public.quiz_submissions where user_id = p_user_id;
    exception when others then null;
    end;
  end if;

  -- Emails table (if present) - delete by user_id to remove personal email objects
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='emails')
  and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'emails'
      and column_name = 'user_id'
  ) then
    begin
      delete from public.emails where user_id = p_user_id;
    exception when others then null;
    end;
  end if;

  -- Profile row
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='profiles')
  and exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='id') then
    begin
      delete from public.profiles where id = p_user_id;
    exception when others then null;
    end;
  end if;
exception
  when others then
    -- Best-effort: never block auth delete due to app table differences.
    null;
end;
$$;

-- 3) Anonymize deliverability / email analytics by email (policy-aligned)
--    Keep non-personal fields (provider, event_type, event_at) but remove the email itself.
create or replace function public.anonymize_email_delivery_events_safe(p_email text)
returns void
language plpgsql
security definer
as $$
begin
  if p_email is null or btrim(p_email) = '' then
    return;
  end if;

  -- Only if table/columns exist in this Supabase project
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'email_delivery_events'
  )
  and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'email_delivery_events'
      and column_name = 'email'
  ) then
    begin
      update public.email_delivery_events
      set email = null,
          reason = null,
          raw = null
      where lower(email) = lower(p_email);
    exception when others then
      null;
    end;
  end if;
exception
  when others then
    null;
end;
$$;

commit;

