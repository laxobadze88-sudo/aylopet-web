-- =============================================================================
-- Aylopet — Referral & Rewards system (run after schema.sql / promo setup)
-- Referral codes live in profiles.referral_code (prefix ref_) — NOT in promo_codes.
-- Call process_referral_purchase_event() from Edge Functions / webhooks on order paid.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Profile columns (referral identity & balances)
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_role TEXT CHECK (
    referral_role IS NULL OR referral_role IN (
      'ambassador', 'organic_eb', 'referral_eb', 'elite_eb'
    )
  );

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS store_credit_balance NUMERIC(12, 2) NOT NULL DEFAULT 0;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS free_food_kg_balance NUMERIC(12, 3) NOT NULL DEFAULT 0;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS discount_expiry TIMESTAMPTZ;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS lifetime_discount_percent NUMERIC(5, 2);

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_referral_code_unique
  ON public.profiles (referral_code)
  WHERE referral_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles (referred_by);

COMMENT ON COLUMN public.profiles.referral_code IS 'Invitation ID only (ref_*). Never reuse promo_codes.code.';

-- -----------------------------------------------------------------------------
-- 2. referrals_tracking
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.referrals_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referee_email TEXT,
  referee_name TEXT,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (
    status IN ('registered', 'purchased', 'active_subscription')
  ),
  kg_contributed NUMERIC(12, 3) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT referrals_one_row_per_referee UNIQUE (referee_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_tracking_referrer ON public.referrals_tracking (referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_tracking_referee ON public.referrals_tracking (referee_id);

DROP TRIGGER IF EXISTS set_referrals_tracking_updated_at ON public.referrals_tracking;
CREATE TRIGGER set_referrals_tracking_updated_at
  BEFORE UPDATE ON public.referrals_tracking
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 3. reward_logs (idempotent milestones & extensions)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reward_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  milestone_key TEXT NOT NULL,
  reward_type TEXT NOT NULL CHECK (
    reward_type IN (
      'store_credit_gel', 'free_food_kg', 'role_upgrade', 'discount_extension'
    )
  ),
  amount_gel NUMERIC(12, 2),
  amount_kg NUMERIC(12, 3),
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT reward_logs_user_milestone_unique UNIQUE (user_id, milestone_key)
);

CREATE INDEX IF NOT EXISTS idx_reward_logs_user ON public.reward_logs (user_id);

-- -----------------------------------------------------------------------------
-- 4. Guard: authenticated users cannot self-edit referral balances / codes
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.profiles_referral_fields_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP <> 'UPDATE' THEN
    RETURN NEW;
  END IF;
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') = 'service_role' THEN
    RETURN NEW;
  END IF;
  NEW.store_credit_balance := OLD.store_credit_balance;
  NEW.free_food_kg_balance := OLD.free_food_kg_balance;
  NEW.referral_code := OLD.referral_code;
  NEW.referred_by := OLD.referred_by;
  NEW.referral_role := OLD.referral_role;
  NEW.discount_expiry := OLD.discount_expiry;
  NEW.lifetime_discount_percent := OLD.lifetime_discount_percent;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_referral_guard ON public.profiles;
CREATE TRIGGER profiles_referral_guard
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.profiles_referral_fields_guard();

-- -----------------------------------------------------------------------------
-- 5. Generate unique referral code (never collides with promo_codes.code pattern)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_unique_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  n INT := 0;
BEGIN
  LOOP
    v_code := 'ref_' || substr(md5(random()::text || clock_timestamp()::text || n::text), 1, 14);
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.referral_code = v_code
    ) AND NOT EXISTS (
      SELECT 1 FROM public.promo_codes pc WHERE pc.code = v_code
    );
    n := n + 1;
    IF n > 50 THEN
      RAISE EXCEPTION 'Could not generate referral code';
    END IF;
  END LOOP;
  RETURN v_code;
END;
$$;

-- -----------------------------------------------------------------------------
-- 6. Link referee from auth.users.raw_user_meta_data (signup ? ref=)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.link_referral_from_signup(p_user_id UUID, p_meta JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_raw TEXT;
  v_referrer UUID;
BEGIN
  v_raw := NULLIF(trim(COALESCE(p_meta->>'referral_code', '')), '');
  IF v_raw IS NULL THEN
    RETURN;
  END IF;

  SELECT id INTO v_referrer
  FROM public.profiles
  WHERE referral_code = v_raw AND id <> p_user_id
  LIMIT 1;

  IF v_referrer IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.profiles
  SET
    referred_by = v_referrer,
    referral_role = COALESCE(referral_role, 'referral_eb')
  WHERE id = p_user_id;

  INSERT INTO public.referrals_tracking (
    referrer_id, referee_id, status, kg_contributed
  )
  VALUES (v_referrer, p_user_id, 'registered', 0)
  ON CONFLICT (referee_id) DO NOTHING;
END;
$$;

-- -----------------------------------------------------------------------------
-- 7. Replace handle_new_user — profile row + referral code + optional link
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
BEGIN
  v_code := public.generate_unique_referral_code();

  INSERT INTO public.profiles (id, full_name, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    v_code
  );

  PERFORM public.link_referral_from_signup(NEW.id, COALESCE(NEW.raw_user_meta_data, '{}'::jsonb));
  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- 8. Confirmed referrals count (purchased or active_subscription)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.count_confirmed_referrals(p_referrer UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.referrals_tracking rt
  WHERE rt.referrer_id = p_referrer
    AND rt.status IN ('purchased', 'active_subscription');
$$;

-- -----------------------------------------------------------------------------
-- 9. Milestone application (idempotent via reward_logs unique key)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.apply_referral_milestones(p_referrer UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_n INT;
BEGIN
  SELECT referral_role INTO v_role FROM public.profiles WHERE id = p_referrer;
  v_n := public.count_confirmed_referrals(p_referrer);

  -- Ambassador: 3 → +1kg, 5 → +3kg, 10 → +5kg
  IF v_role = 'ambassador' THEN
    IF v_n >= 3 THEN
      INSERT INTO public.reward_logs (user_id, milestone_key, reward_type, amount_kg)
      VALUES (p_referrer, 'm3_free_kg', 'free_food_kg', 1)
      ON CONFLICT (user_id, milestone_key) DO NOTHING;
    END IF;
    IF v_n >= 5 THEN
      INSERT INTO public.reward_logs (user_id, milestone_key, reward_type, amount_kg)
      VALUES (p_referrer, 'm5_free_kg', 'free_food_kg', 3)
      ON CONFLICT (user_id, milestone_key) DO NOTHING;
    END IF;
    IF v_n >= 10 THEN
      INSERT INTO public.reward_logs (user_id, milestone_key, reward_type, amount_kg)
      VALUES (p_referrer, 'm10_free_kg', 'free_food_kg', 5)
      ON CONFLICT (user_id, milestone_key) DO NOTHING;
    END IF;
  END IF;

  -- Organic EB: 3 → +1kg; 5 → elite_eb + 10% lifetime
  IF v_role = 'organic_eb' THEN
    IF v_n >= 3 THEN
      INSERT INTO public.reward_logs (user_id, milestone_key, reward_type, amount_kg)
      VALUES (p_referrer, 'm3_free_kg', 'free_food_kg', 1)
      ON CONFLICT (user_id, milestone_key) DO NOTHING;
    END IF;
    IF v_n >= 5 THEN
      INSERT INTO public.reward_logs (user_id, milestone_key, reward_type, reward_type)
      VALUES (p_referrer, 'm5_elite_upgrade', 'role_upgrade')
      ON CONFLICT (user_id, milestone_key) DO NOTHING;
      UPDATE public.profiles
      SET referral_role = 'elite_eb', lifetime_discount_percent = 10
      WHERE id = p_referrer AND referral_role = 'organic_eb';
    END IF;
  END IF;
END;
$$;

-- Fix typo in milestone function - I used wrong column for INSERT
DROP FUNCTION IF EXISTS public.apply_referral_milestones(UUID);

CREATE OR REPLACE FUNCTION public.apply_referral_milestones(p_referrer UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_n INT;
BEGIN
  SELECT referral_role INTO v_role FROM public.profiles WHERE id = p_referrer;
  v_n := public.count_confirmed_referrals(p_referrer);

  IF v_role = 'ambassador' THEN
    IF v_n >= 3 THEN
      INSERT INTO public.reward_logs (user_id, milestone_key, reward_type, amount_kg)
      VALUES (p_referrer, 'm3_free_kg', 'free_food_kg', 1)
      ON CONFLICT (user_id, milestone_key) DO NOTHING;
    END IF;
    IF v_n >= 5 THEN
      INSERT INTO public.reward_logs (user_id, milestone_key, reward_type, amount_kg)
      VALUES (p_referrer, 'm5_free_kg', 'free_food_kg', 3)
      ON CONFLICT (user_id, milestone_key) DO NOTHING;
    END IF;
    IF v_n >= 10 THEN
      INSERT INTO public.reward_logs (user_id, milestone_key, reward_type, amount_kg)
      VALUES (p_referrer, 'm10_free_kg', 'free_food_kg', 5)
      ON CONFLICT (user_id, milestone_key) DO NOTHING;
    END IF;
  END IF;

  IF v_role = 'organic_eb' THEN
    IF v_n >= 3 THEN
      INSERT INTO public.reward_logs (user_id, milestone_key, reward_type, amount_kg)
      VALUES (p_referrer, 'm3_free_kg', 'free_food_kg', 1)
      ON CONFLICT (user_id, milestone_key) DO NOTHING;
    END IF;
    IF v_n >= 5 THEN
      INSERT INTO public.reward_logs (user_id, milestone_key, reward_type)
      VALUES (p_referrer, 'm5_elite_upgrade', 'role_upgrade')
      ON CONFLICT (user_id, milestone_key) DO NOTHING;
      UPDATE public.profiles
      SET referral_role = 'elite_eb', lifetime_discount_percent = COALESCE(lifetime_discount_percent, 10)
      WHERE id = p_referrer AND referral_role = 'organic_eb';
    END IF;
  END IF;
END;
$$;

-- -----------------------------------------------------------------------------
-- 10. Purchase hook — kg credit, Referral EB +30 days, milestones
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.process_referral_purchase_event(
  p_referee_id UUID,
  p_kg NUMERIC,
  p_subscription_active BOOLEAN DEFAULT FALSE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer UUID;
  v_role TEXT;
  v_gel NUMERIC;
BEGIN
  SELECT referrer_id INTO v_referrer
  FROM public.referrals_tracking
  WHERE referee_id = p_referee_id
  LIMIT 1;

  IF v_referrer IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.referrals_tracking
  SET
    kg_contributed = kg_contributed + GREATEST(COALESCE(p_kg, 0), 0),
    status = CASE
      WHEN p_subscription_active THEN 'active_subscription'
      ELSE 'purchased'
    END,
    updated_at = NOW()
  WHERE referee_id = p_referee_id;

  SELECT referral_role INTO v_role FROM public.profiles WHERE id = v_referrer;

  IF v_role = 'ambassador' THEN
    v_gel := GREATEST(COALESCE(p_kg, 0), 0) * 5;
    UPDATE public.profiles
    SET store_credit_balance = store_credit_balance + v_gel
    WHERE id = v_referrer;
  END IF;

  IF v_role = 'referral_eb' THEN
    UPDATE public.profiles
    SET discount_expiry = CASE
      WHEN discount_expiry IS NULL OR discount_expiry < NOW() THEN NOW() + INTERVAL '30 days'
      ELSE discount_expiry + INTERVAL '30 days'
    END
    WHERE id = v_referrer;

    INSERT INTO public.reward_logs (user_id, milestone_key, reward_type, meta)
    VALUES (
      v_referrer,
      'ext_' || substr(md5(random()::text || clock_timestamp()::text), 1, 10),
      'discount_extension',
      jsonb_build_object('referee_id', p_referee_id, 'days', 30)
    );
  END IF;

  PERFORM public.apply_referral_milestones(v_referrer);
END;
$$;

-- -----------------------------------------------------------------------------
-- 11. Backfill referral_code for existing profiles (optional, idempotent)
-- -----------------------------------------------------------------------------
UPDATE public.profiles p
SET referral_code = public.generate_unique_referral_code()
WHERE p.referral_code IS NULL;

-- -----------------------------------------------------------------------------
-- 12. RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.referrals_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own referral rows" ON public.referrals_tracking;
CREATE POLICY "Users see own referral rows"
  ON public.referrals_tracking FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

DROP POLICY IF EXISTS "Users see own reward logs" ON public.reward_logs;
CREATE POLICY "Users see own reward logs"
  ON public.reward_logs FOR SELECT
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 13. Grants (Edge Functions use service_role key — bypass RLS)
-- -----------------------------------------------------------------------------
GRANT SELECT ON public.referrals_tracking TO authenticated;
GRANT SELECT ON public.reward_logs TO authenticated;

COMMENT ON FUNCTION public.process_referral_purchase_event IS
  'Call from Edge Function / webhook when a referred user''s order is paid. p_kg = kg in order.';
