import type { ReferralRole, ReferralTrackingRow, ReferralTrackingStatus } from './types';

/** GEL per kg purchased by friends (Ambassador Elite 100) */
export const AMBASSADOR_GEL_PER_KG = 5;

export const MILESTONE_THRESHOLDS = [3, 5, 10] as const;

/** Counts referrals that count toward milestones (post-purchase / active) */
export function countConfirmedReferrals(rows: ReferralTrackingRow[]): number {
  return rows.filter((r) =>
    r.status === 'purchased' || r.status === 'active_subscription'
  ).length;
}

export function countRegisteredReferrals(rows: ReferralTrackingRow[]): number {
  return rows.filter((r) => r.status === 'registered').length;
}

/** Ambassador: Total_GEL = sum(kg_contributed) * 5 */
export function ambassadorStoreCreditFromKg(totalKg: number): number {
  return Math.round(totalKg * AMBASSADOR_GEL_PER_KG * 100) / 100;
}

export function sumKgContributed(rows: ReferralTrackingRow[]): number {
  return rows.reduce((acc, r) => acc + (Number(r.kg_contributed) || 0), 0);
}

export interface MilestonePreview {
  at: number;
  rewardLabelKey: 'kg1' | 'kg3' | 'kg5' | 'eliteUpgrade';
}

export function milestonesForRole(role: ReferralRole | null): MilestonePreview[] {
  if (role === 'ambassador') {
    return [
      { at: 3, rewardLabelKey: 'kg1' },
      { at: 5, rewardLabelKey: 'kg3' },
      { at: 10, rewardLabelKey: 'kg5' },
    ];
  }
  if (role === 'organic_eb') {
    return [
      { at: 3, rewardLabelKey: 'kg1' },
      { at: 5, rewardLabelKey: 'eliteUpgrade' },
    ];
  }
  return [];
}

/** "What's next" — pending referrals becoming confirmed */
export function projectNextRewards(
  role: ReferralRole | null,
  confirmed: number,
  pendingRegistered: number
): { nextMilestoneAt: number | null; gap: number; afterAllPending: number } {
  const milestones = milestonesForRole(role).map((m) => m.at);
  const maxM = milestones.length ? Math.max(...milestones) : 0;
  const nextMilestoneAt =
    milestones.find((m) => m > confirmed) ?? null;
  const gap = nextMilestoneAt != null ? nextMilestoneAt - confirmed : 0;
  const afterAllPending = confirmed + pendingRegistered;
  return {
    nextMilestoneAt,
    gap: Math.max(0, gap),
    afterAllPending,
  };
}

export function statusLabel(
  status: ReferralTrackingStatus,
  lang: 'GE' | 'EN'
): string {
  const labels: Record<ReferralTrackingStatus, { GE: string; EN: string }> = {
    registered: { GE: 'რეგისტრირებული', EN: 'Registered' },
    purchased: { GE: 'შეძენილი', EN: 'Purchased' },
    active_subscription: {
      GE: 'აქტიური გამოწერა',
      EN: 'Active subscription',
    },
  };
  return labels[status][lang];
}
