import { supabase } from '@/lib/supabase';

/**
 * Total profiles for "Founding 500": Honorary Ambassador (`ambassador`) plus
 * Early Bird family (`organic_eb`, `referral_eb`, `elite_eb`). Product tier
 * `early_bird` maps to these `referral_role` values in `profiles`.
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
