import { supabase } from '@/lib/supabase';
import type {
  ProfileReferralFields,
  ReferralDashboardData,
  ReferralRole,
  ReferralTrackingRow,
  ReferralTrackingStatus,
  RewardLogRow,
} from './types';
import {
  ambassadorStoreCreditFromKg,
  countConfirmedReferrals,
  countRegisteredReferrals,
  sumKgContributed,
} from './calculations';

const defaultProfile = (): ProfileReferralFields => ({
  referral_role: null,
  referral_code: null,
  referred_by: null,
  store_credit_balance: 0,
  free_food_kg_balance: 0,
  discount_expiry: null,
  lifetime_discount_percent: null,
});

function mapRow(r: Record<string, unknown>): ReferralTrackingRow {
  return {
    id: String(r.id),
    referrer_id: String(r.referrer_id),
    referee_id: String(r.referee_id),
    referee_email: r.referee_email != null ? String(r.referee_email) : null,
    referee_name: r.referee_name != null ? String(r.referee_name) : null,
    status: r.status as ReferralTrackingStatus,
    kg_contributed: Number(r.kg_contributed ?? 0),
    created_at: String(r.created_at ?? ''),
    updated_at: String(r.updated_at ?? ''),
  };
}

function mapReward(r: Record<string, unknown>): RewardLogRow {
  return {
    id: String(r.id),
    user_id: String(r.user_id),
    milestone_key: String(r.milestone_key ?? ''),
    reward_type: r.reward_type as RewardLogRow['reward_type'],
    amount_gel: r.amount_gel != null ? Number(r.amount_gel) : null,
    amount_kg: r.amount_kg != null ? Number(r.amount_kg) : null,
    meta: (r.meta as Record<string, unknown>) ?? null,
    created_at: String(r.created_at ?? ''),
  };
}

/**
 * Loads referral dashboard data. If tables/columns are missing (migration not run),
 * returns dbReady: false with safe defaults.
 */
export async function fetchReferralDashboard(userId: string): Promise<ReferralDashboardData> {
  let dbReady = true;
  let dbError: string | null = null;
  let profile = defaultProfile();
  let referrals: ReferralTrackingRow[] = [];
  let rewardLogs: RewardLogRow[] = [];

  try {
    const { data: prof, error: pErr } = await supabase
      .from('profiles')
      .select(
        'referral_role, referral_code, referred_by, store_credit_balance, free_food_kg_balance, discount_expiry, lifetime_discount_percent'
      )
      .eq('id', userId)
      .maybeSingle();

    if (pErr) {
      if (
        pErr.code === '42703' ||
        pErr.message?.includes('column') ||
        pErr.message?.includes('does not exist')
      ) {
        dbReady = false;
        dbError = 'referral_columns_missing';
      } else {
        dbReady = false;
        dbError = pErr.message;
      }
    } else if (prof) {
      const p = prof as Record<string, unknown>;
      profile = {
        referral_role: (p.referral_role as ReferralRole) ?? null,
        referral_code: p.referral_code != null ? String(p.referral_code) : null,
        referred_by: p.referred_by != null ? String(p.referred_by) : null,
        store_credit_balance: Number(p.store_credit_balance ?? 0),
        free_food_kg_balance: Number(p.free_food_kg_balance ?? 0),
        discount_expiry: p.discount_expiry != null ? String(p.discount_expiry) : null,
        lifetime_discount_percent:
          p.lifetime_discount_percent != null ? Number(p.lifetime_discount_percent) : null,
      };
    }
  } catch (e) {
    dbReady = false;
    dbError = e instanceof Error ? e.message : 'unknown';
  }

  if (dbReady) {
    try {
      const { data: tr, error: tErr } = await supabase
        .from('referrals_tracking')
        .select('*')
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (tErr) {
        if (tErr.code === '42P01' || tErr.message?.includes('relation')) {
          dbReady = false;
          dbError = 'referrals_tracking_missing';
        }
      } else {
        referrals = (tr ?? []).map((r) => mapRow(r as Record<string, unknown>));
      }
    } catch {
      dbReady = false;
      dbError = 'referrals_tracking_missing';
    }
  }

  if (dbReady) {
    try {
      const { data: logs, error: lErr } = await supabase
        .from('reward_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (lErr) {
        if (lErr.code === '42P01' || lErr.message?.includes('relation')) {
          dbReady = false;
          dbError = 'reward_logs_missing';
        }
      } else {
        rewardLogs = (logs ?? []).map((r) => mapReward(r as Record<string, unknown>));
      }
    } catch {
      dbReady = false;
      dbError = 'reward_logs_missing';
    }
  }

  const totalKg = sumKgContributed(referrals);
  const ambassadorCreditGel =
    profile.referral_role === 'ambassador'
      ? ambassadorStoreCreditFromKg(totalKg)
      : profile.store_credit_balance;

  const confirmed = countConfirmedReferrals(referrals);
  const registeredOnly = countRegisteredReferrals(referrals);

  const milestoneFlags = {
    m3: rewardLogs.some((l) => l.milestone_key === 'm3_free_kg'),
    m5: rewardLogs.some((l) => l.milestone_key === 'm5_free_kg' || l.milestone_key === 'm5_elite_upgrade'),
    m10: rewardLogs.some((l) => l.milestone_key === 'm10_free_kg'),
  };

  return {
    profile,
    referrals,
    rewardLogs,
    ambassadorCreditGel:
      profile.referral_role === 'ambassador' ? ambassadorCreditGel : profile.store_credit_balance,
    confirmedReferralCount: confirmed,
    registeredReferralCount: registeredOnly,
    milestoneFlags,
    dbReady,
    dbError,
  };
}
