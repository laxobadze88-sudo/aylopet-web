-- Founding 500: count profiles with ambassador or Early Bird referral roles.
-- Run in Supabase SQL Editor once. Maps product "early_bird" to referral_role variants.
-- Roles: ambassador = Honorary Ambassador; organic_eb, referral_eb, elite_eb = Early Bird family.

CREATE OR REPLACE FUNCTION public.get_founding_member_count()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COUNT(*)::integer
  FROM public.profiles
  WHERE referral_role IN (
    'ambassador',
    'organic_eb',
    'referral_eb',
    'elite_eb'
  );
$$;

REVOKE ALL ON FUNCTION public.get_founding_member_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_founding_member_count() TO anon;
GRANT EXECUTE ON FUNCTION public.get_founding_member_count() TO authenticated;
