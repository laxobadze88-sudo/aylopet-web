/**
 * Referral roles — separate from promo_codes / checkout discount codes.
 * Stored on profiles.referral_role
 */
export type ReferralRole = 'ambassador' | 'organic_eb' | 'referral_eb' | 'elite_eb';

/** Tracked referee journey — drives milestones & ambassador kg credit */
export type ReferralTrackingStatus = 'registered' | 'purchased' | 'active_subscription';

export interface ProfileReferralFields {
  referral_role: ReferralRole | null;
  referral_code: string | null;
  referred_by: string | null;
  store_credit_balance: number;
  free_food_kg_balance: number;
  discount_expiry: string | null;
  lifetime_discount_percent: number | null;
}

export interface ReferralTrackingRow {
  id: string;
  referrer_id: string;
  referee_id: string;
  referee_email: string | null;
  referee_name: string | null;
  status: ReferralTrackingStatus;
  kg_contributed: number;
  created_at: string;
  updated_at: string;
}

export interface RewardLogRow {
  id: string;
  user_id: string;
  milestone_key: string;
  reward_type: 'store_credit_gel' | 'free_food_kg' | 'role_upgrade' | 'discount_extension';
  amount_gel: number | null;
  amount_kg: number | null;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export interface ReferralDashboardData {
  profile: ProfileReferralFields;
  /** Friends you invited */
  referrals: ReferralTrackingRow[];
  rewardLogs: RewardLogRow[];
  /** Derived */
  ambassadorCreditGel: number;
  confirmedReferralCount: number;
  registeredReferralCount: number;
  milestoneFlags: {
    m3: boolean;
    m5: boolean;
    m10: boolean;
  };
  dbReady: boolean;
  dbError: string | null;
}
