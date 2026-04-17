-- Founding 500 aggregate count.
-- IMPORTANT:
-- - Some users are represented via profiles.referral_role
-- - Others are represented via promo_codes.user_tier (honorary_ambassador / early_bird)
-- This function counts DISTINCT users from BOTH sources so public progress is accurate.

CREATE OR REPLACE FUNCTION public.get_founding_member_count()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  WITH founding_users AS (
    SELECT p.id AS user_id
    FROM public.profiles p
    WHERE p.referral_role IN ('ambassador', 'organic_eb', 'referral_eb', 'elite_eb')

    UNION

    SELECT pc.user_id
    FROM public.promo_codes pc
    WHERE pc.user_tier IN ('honorary_ambassador', 'early_bird')
      AND pc.user_id IS NOT NULL
  )
  SELECT COUNT(DISTINCT user_id)::integer
  FROM founding_users;
$$;

REVOKE ALL ON FUNCTION public.get_founding_member_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_founding_member_count() TO anon;
GRANT EXECUTE ON FUNCTION public.get_founding_member_count() TO authenticated;
