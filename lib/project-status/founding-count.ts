import { supabase } from '@/lib/supabase';

/**
 * Founding 500 total (distinct users) via RPC.
 * The SQL function should aggregate from BOTH:
 * - profiles.referral_role (ambassador / organic_eb / referral_eb / elite_eb)
 * - promo_codes.user_tier (honorary_ambassador / early_bird)
 * Requires RPC `get_founding_member_count` (see supabase/founding-500-count.sql)
 * so anon clients can read the aggregate under RLS.
 */
export async function fetchFoundingMemberCount(): Promise<number> {
  const { data, error } = await supabase.rpc('get_founding_member_count');
  if (error || data == null) {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.warn('[founding-count]', error?.message ?? 'get_founding_member_count unavailable');
    }
    return 0;
  }
  const n = typeof data === 'number' ? data : Number(data);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}
