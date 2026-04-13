'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Copy, Check, Users, TrendingUp, Gift, AlertCircle, Info } from 'lucide-react';
import type { ReferralRole } from '@/lib/referrals/types';
import { fetchReferralDashboard } from '@/lib/referrals/data';
import {
  AMBASSADOR_GEL_PER_KG,
  milestonesForRole,
  projectNextRewards,
  statusLabel,
} from '@/lib/referrals/calculations';

type Lang = 'GE' | 'EN';

const copy: Record<
  Lang,
  Record<string, string>
> = {
  GE: {
    title: 'რეფერალები',
    subtitle: 'მოიწვიე მეგობრები და მიიღე ჯილდოები',
    needProfile: 'რეფერალური სისტემა ხელმისაწვდომია მას შემდეგ, რაც პროფილში დაემატება მინიმუმ ერთი ძაღლი.',
    goChat: 'ჩატის დაწყება',
    dbPending: 'ბაზის მიგრაცია მიმდინარეობს. რეფერალური მონაცემები მალე გამოჩნდება — გაუშვით SQL ფაილი Supabase-ში.',
    yourLink: 'თქვენი უნიკალური ბმული',
    copy: 'კოპირება',
    copied: 'კოპირებულია',
    role: 'სტატუსი',
    roleAmbassador: 'Honorary Ambassador (Elite 100)',
    roleOrganic: 'Organic Early Bird',
    roleReferral: 'Referral Early Bird',
    roleElite: 'Elite Early Bird',
    invitedTitle: 'მოწვეული მეგობრები',
    statusCol: 'სტატუსი',
    nameCol: 'სახელი / ელფოსტა',
    noInvites: 'ჯერ არავინ გიწვევიათ.',
    milestoneTitle: 'ვეიპოინტები (3 / 5 / 10)',
    financialTitle: 'ფინანსური მიმოხილვა',
    storeCredit: 'მაღაზიის კრედიტი (₾)',
    freeFood: 'უფასო საკვები (კგ)',
    whatsNext: 'რა მოგელის შემდეგ',
    pendingHint: 'დარეგისტრირებული, მაგრამ ჯერ არ შეუძენიათ',
    nextMilestone: 'შემდეგი ვეიპოინტი',
    referralsConfirmed: 'დადასტურებული რეფერალი',
    kgFromFriends: 'კგ (მეგობრების შენაძენი)',
    formula: `ფორმულა: კგ × ${AMBASSADOR_GEL_PER_KG} ₾`,
    discountExpiry: 'ფასდაკლების ვადა',
    lifetimePct: 'სიცოცხლის ფასდაკლება',
    rewardKg1: '+1 კგ უფასო საკვები',
    rewardKg3: '+3 კგ უფასო საკვები',
    rewardKg5: '+5 კგ უფასო საკვები',
    rewardElite: 'Elite სტატუსი + 10% სიცოცხლის ფასდაკლება',
    extensionNote: 'Referral EB: თითო შეძენაზე +30 დღე 20% ფასდაკლებაზე',
  },
  EN: {
    title: 'Referrals',
    subtitle: 'Invite friends and earn rewards',
    needProfile: 'The referral program is available once you add at least one dog to your profile.',
    goChat: 'Start chat',
    dbPending: 'Database migration pending. Referral data will appear after you run the SQL migration in Supabase.',
    yourLink: 'Your unique link',
    copy: 'Copy',
    copied: 'Copied',
    role: 'Role',
    roleAmbassador: 'Honorary Ambassador (Elite 100)',
    roleOrganic: 'Organic Early Bird',
    roleReferral: 'Referral Early Bird',
    roleElite: 'Elite Early Bird',
    invitedTitle: 'Invited friends',
    statusCol: 'Status',
    nameCol: 'Name / Email',
    noInvites: 'No invites yet.',
    milestoneTitle: 'Milestones (3 / 5 / 10)',
    financialTitle: 'Financial overview',
    storeCredit: 'Store credit (GEL)',
    freeFood: 'Free food (kg)',
    whatsNext: "What's next",
    pendingHint: 'Registered — not purchased yet',
    nextMilestone: 'Next milestone',
    referralsConfirmed: 'Confirmed referrals',
    kgFromFriends: 'kg (friends’ purchases)',
    formula: `Formula: kg × ${AMBASSADOR_GEL_PER_KG} GEL`,
    discountExpiry: 'Discount expiry',
    lifetimePct: 'Lifetime discount',
    rewardKg1: '+1 kg free food',
    rewardKg3: '+3 kg free food',
    rewardKg5: '+5 kg free food',
    rewardElite: 'Elite status + 10% lifetime discount',
    extensionNote: 'Referral EB: +30 days to your 20% discount for each friend purchase',
  },
};

function inferRoleFromPromo(tier: string | null | undefined): ReferralRole | null {
  if (!tier) return null;
  if (tier === 'honorary_ambassador') return 'ambassador';
  if (tier === 'early_bird') return 'organic_eb';
  return null;
}

function displayRole(
  dbRole: ReferralRole | null,
  promoTier: string | null | undefined,
  lang: Lang
): { key: string; label: string } {
  const r = dbRole ?? inferRoleFromPromo(promoTier);
  const c = copy[lang];
  if (r === 'ambassador') return { key: 'ambassador', label: c.roleAmbassador };
  if (r === 'organic_eb') return { key: 'organic_eb', label: c.roleOrganic };
  if (r === 'referral_eb') return { key: 'referral_eb', label: c.roleReferral };
  if (r === 'elite_eb') return { key: 'elite_eb', label: c.roleElite };
  return { key: 'unknown', label: promoTier ? String(promoTier) : '—' };
}

type Props = {
  lang: Lang;
  userId: string;
  hasActiveProfile: boolean;
  promoUserTier: string | null;
};

export function ReferralDashboard({ lang, userId, hasActiveProfile, promoUserTier }: Props) {
  const c = copy[lang];
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchReferralDashboard>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const d = await fetchReferralDashboard(userId);
      if (!cancelled) {
        setData(d);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const code = data?.profile.referral_code;
  const referralUrl = code ? `${baseUrl}/join?ref=${encodeURIComponent(code)}` : '';

  const roleInfo = useMemo(
    () => displayRole(data?.profile.referral_role ?? null, promoUserTier, lang),
    [data?.profile.referral_role, promoUserTier, lang]
  );

  const effectiveRole = (data?.profile.referral_role ?? inferRoleFromPromo(promoUserTier)) as ReferralRole | null;

  const pendingRegistered = useMemo(() => {
    if (!data?.referrals) return 0;
    return data.referrals.filter((r) => r.status === 'registered').length;
  }, [data?.referrals]);

  const nextInfo = useMemo(() => {
    if (!effectiveRole || !data) return null;
    return projectNextRewards(
      effectiveRole,
      data.confirmedReferralCount,
      pendingRegistered
    );
  }, [effectiveRole, data, pendingRegistered]);

  const milestones = milestonesForRole(effectiveRole);

  const handleCopy = async () => {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  if (!hasActiveProfile) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50/90 p-6 text-center">
        <Info className="mx-auto mb-3 h-10 w-10 text-amber-700" />
        <p className="text-sm font-medium text-amber-950">{c.needProfile}</p>
        <Link
          href="/aylopetai-chat"
          className="mt-4 inline-flex rounded-xl bg-[#2d5a27] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3a6b33]"
        >
          {c.goChat}
        </Link>
      </section>
    );
  }

  if (loading || !data) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 rounded-xl bg-slate-200/80" />
        <div className="h-32 rounded-2xl bg-slate-200/60" />
        <div className="h-48 rounded-2xl bg-slate-200/60" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {!data.dbReady && (
        <div className="flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-700" />
          <p>{c.dbPending}</p>
        </div>
      )}

      <div className="rounded-2xl border border-[#D4E4D4] bg-white/90 p-6 shadow-sm">
        <h2 className="font-serif text-xl font-bold text-[#2D3A2D]">{c.title}</h2>
        <p className="mt-1 text-sm text-[#5a6b5a]">{c.subtitle}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-[#2D3A2D]">{c.role}:</span>
          <span className="rounded-full bg-[#E8EFE8] px-3 py-1 text-xs font-semibold text-[#2d5a27]">
            {roleInfo.label}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-[#D4E4D4] bg-gradient-to-br from-white to-[#f6f8f3] p-6 shadow-sm">
        <h3 className="flex items-center gap-2 font-semibold text-[#2D3A2D]">
          <Users className="h-5 w-5 text-[#2d5a27]" />
          {c.yourLink}
        </h3>
        <p className="mt-1 text-xs text-[#5a6b5a]">
          {lang === 'GE'
            ? 'განცალკევებულია პრომო კოდებისგან — მხოლოდ მოწვევის იდენტიფიკატორია.'
            : 'Separate from promo/discount codes — invitation ID only.'}
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <code className="flex-1 break-all rounded-xl border border-[#D4E4D4] bg-white px-4 py-3 text-xs text-[#2D3A2D]">
            {referralUrl || (lang === 'GE' ? 'კოდი გენერირდება მიგრაციის შემდეგ' : 'Code appears after DB migration')}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!referralUrl}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2d5a27] px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? c.copied : c.copy}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#D4E4D4] bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 font-semibold text-[#2D3A2D]">
            <TrendingUp className="h-5 w-5 text-[#2d5a27]" />
            {c.financialTitle}
          </h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-[#eef2e7] pb-2">
              <dt className="text-[#5a6b5a]">{c.storeCredit}</dt>
              <dd className="font-bold text-[#2d5a27]">
                {(effectiveRole === 'ambassador' ? data.ambassadorCreditGel : data.profile.store_credit_balance).toFixed(2)} ₾
              </dd>
            </div>
            {effectiveRole === 'ambassador' && (
              <p className="text-xs text-[#5a6b5a]">
                {c.formula} · {c.kgFromFriends}:{' '}
                {data.referrals.reduce((a, r) => a + (r.kg_contributed || 0), 0).toFixed(2)}
              </p>
            )}
            <div className="flex justify-between gap-4 border-b border-[#eef2e7] pb-2">
              <dt className="text-[#5a6b5a]">{c.freeFood}</dt>
              <dd className="font-bold text-[#2d5a27]">
                {data.profile.free_food_kg_balance.toFixed(2)} kg
              </dd>
            </div>
            {data.profile.discount_expiry && (
              <div className="flex justify-between gap-4">
                <dt className="text-[#5a6b5a]">{c.discountExpiry}</dt>
                <dd className="font-medium text-[#2D3A2D]">
                  {new Date(data.profile.discount_expiry).toLocaleDateString(lang === 'GE' ? 'ka-GE' : 'en-US')}
                </dd>
              </div>
            )}
            {data.profile.lifetime_discount_percent != null && data.profile.lifetime_discount_percent > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-[#5a6b5a]">{c.lifetimePct}</dt>
                <dd className="font-bold text-[#2d5a27]">{data.profile.lifetime_discount_percent}%</dd>
              </div>
            )}
          </dl>
          {effectiveRole === 'referral_eb' && <p className="mt-3 text-xs text-[#5a6b5a]">{c.extensionNote}</p>}
        </div>

        <div className="rounded-2xl border border-[#D4E4D4] bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 font-semibold text-[#2D3A2D]">
            <Gift className="h-5 w-5 text-[#2d5a27]" />
            {c.milestoneTitle}
          </h3>
          <ul className="mt-4 space-y-2">
            {milestones.length === 0 && (
              <li className="text-sm text-[#5a6b5a]">—</li>
            )}
            {milestones.map((m) => {
              const done = data.confirmedReferralCount >= m.at;
              const claimed =
                (m.at === 3 && data.milestoneFlags.m3) ||
                (m.at === 5 && data.milestoneFlags.m5) ||
                (m.at === 10 && data.milestoneFlags.m10);
              return (
                <li
                  key={m.at}
                  className="flex items-center justify-between rounded-lg border border-[#eef2e7] px-3 py-2 text-sm"
                >
                  <span>
                    {m.at} {lang === 'GE' ? 'რეფ.' : 'ref.'} —{' '}
                    {m.rewardLabelKey === 'kg1' && c.rewardKg1}
                    {m.rewardLabelKey === 'kg3' && c.rewardKg3}
                    {m.rewardLabelKey === 'kg5' && c.rewardKg5}
                    {m.rewardLabelKey === 'eliteUpgrade' && c.rewardElite}
                  </span>
                  <span className={done ? 'text-green-600' : 'text-slate-400'}>
                    {claimed ? '✓' : done ? '○' : '…'}
                  </span>
                </li>
              );
            })}
          </ul>
          {nextInfo && nextInfo.nextMilestoneAt != null && (
            <p className="mt-4 text-xs text-[#5a6b5a]">
              {c.nextMilestone}: {nextInfo.nextMilestoneAt} · {c.referralsConfirmed}: {data.confirmedReferralCount}{' '}
              · +{pendingRegistered} {c.pendingHint}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-[#D4E4D4] bg-[#f6f8f3]/80 p-6">
        <h3 className="font-semibold text-[#2D3A2D]">{c.invitedTitle}</h3>
        {data.referrals.length === 0 ? (
          <p className="mt-3 text-sm text-[#5a6b5a]">{c.noInvites}</p>
        ) : (
          <ul className="mt-4 divide-y divide-[#D4E4D4]">
            {data.referrals.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <p className="font-medium text-[#2D3A2D]">
                    {r.referee_name || r.referee_email || r.referee_id.slice(0, 8)}
                  </p>
                  {r.referee_email && r.referee_name && (
                    <p className="text-xs text-[#5a6b5a]">{r.referee_email}</p>
                  )}
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#2d5a27] ring-1 ring-[#D4E4D4]">
                  <span
                    className={
                      r.status === 'registered'
                        ? 'h-2.5 w-2.5 shrink-0 rounded-full bg-green-500'
                        : 'h-2.5 w-2.5 shrink-0 rounded-full border-2 border-slate-300 bg-white'
                    }
                    aria-hidden
                  />
                  {statusLabel(r.status, lang)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {nextInfo && (
        <div className="rounded-2xl border border-dashed border-[#2d5a27]/40 bg-white/60 p-5">
          <h3 className="font-semibold text-[#2D3A2D]">{c.whatsNext}</h3>
          <p className="mt-2 text-sm text-[#5a6b5a]">
            {lang === 'GE'
              ? `თუ დაელოდებით ${pendingRegistered} რეგისტრაცია(ებ)ი გადაიქცევა შეძენად, დადასტურებული რეფერალების რაოდენობა იქნება ${nextInfo.afterAllPending}.`
              : `If ${pendingRegistered} registered invite(s) convert to purchases, your confirmed count could reach ${nextInfo.afterAllPending}.`}
          </p>
        </div>
      )}
    </div>
  );
}
