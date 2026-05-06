'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Lang = 'GE' | 'EN';
const LANG_KEY = 'aylopet-lang';
const COOKIE_PREFS_KEY = 'aylopet-cookie-consent-v1';
const COOKIE_SESSION_KEY = 'aylopet-cookie-session-id-v1';
const COOKIE_POLICY_VERSION = '2026-02-27';

type CookiePrefs = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

const copy = {
  GE: {
    title: 'Cookies-ის პარამეტრები',
    body: 'ჩვენ ვიყენებთ აუცილებელ cookies-ს საიტის სწორად მუშაობისთვის და სურვილისამებრ ანალიტიკურ/მარკეტინგულ cookies-ს გამოცდილების გასაუმჯობესებლად.',
    essential: 'აუცილებელი',
    analytics: 'ანალიტიკური',
    marketing: 'მარკეტინგული',
    essentialDesc: 'აუცილებელია და ვერ გამოირთვება.',
    analyticsDesc: 'გვეხმარება გამოყენების ტენდენციების ანალიზში.',
    marketingDesc: 'რელევანტური შეთავაზებების ჩვენებისთვის.',
    acceptAll: 'Accept all',
    rejectNonEssential: 'Reject non-essential',
    savePrefs: 'Save preferences',
    manage: 'Manage',
    policy: 'Cookie Policy',
  },
  EN: {
    title: 'Cookie Preferences',
    body: 'We use essential cookies to make the website work and optional analytics/marketing cookies to improve your experience.',
    essential: 'Essential',
    analytics: 'Analytics',
    marketing: 'Marketing',
    essentialDesc: 'Required and always active.',
    analyticsDesc: 'Helps us understand usage trends.',
    marketingDesc: 'Used to improve relevance of offers and campaigns.',
    acceptAll: 'Accept all',
    rejectNonEssential: 'Reject non-essential',
    savePrefs: 'Save preferences',
    manage: 'Manage',
    policy: 'Cookie Policy',
  },
} as const;

function getLang(): Lang {
  if (typeof window === 'undefined') return 'GE';
  return localStorage.getItem(LANG_KEY) === 'EN' ? 'EN' : 'GE';
}

function getOrCreateSessionId(): string {
  const existing = localStorage.getItem(COOKIE_SESSION_KEY);
  if (existing) return existing;
  const next = crypto.randomUUID();
  localStorage.setItem(COOKIE_SESSION_KEY, next);
  return next;
}

export function CookieConsentBanner() {
  const [lang, setLang] = useState<Lang>('GE');
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const sync = () => setLang(getLang());
    sync();
    window.addEventListener('aylopet-lang-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('aylopet-lang-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(COOKIE_PREFS_KEY);
    if (!raw) {
      setVisible(true);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as CookiePrefs;
      setAnalytics(Boolean(parsed.analytics));
      setMarketing(Boolean(parsed.marketing));
      setVisible(false);
    } catch {
      setVisible(true);
    }
  }, []);

  const tr = useMemo(() => copy[lang], [lang]);

  const persist = (next: { analytics: boolean; marketing: boolean }) => {
    if (typeof window === 'undefined') return;
    const sessionId = getOrCreateSessionId();
    const payload: CookiePrefs = {
      essential: true,
      analytics: next.analytics,
      marketing: next.marketing,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_PREFS_KEY, JSON.stringify(payload));

    const consentStatus = next.analytics && next.marketing
      ? 'accepted_all'
      : !next.analytics && !next.marketing
        ? 'rejected_non_essential'
        : 'customized';

    // Log consent server-side (best effort, does not block UX).
    supabase.auth.getSession().then(({ data }) => {
      const accessToken = data.session?.access_token;
      fetch('/api/cookie-consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          session_id: sessionId,
          essential: true,
          analytics: next.analytics,
          marketing: next.marketing,
          consent_status: consentStatus,
          consent_version: COOKIE_POLICY_VERSION,
          locale: lang,
          source: 'banner',
        }),
      }).catch(() => undefined);
    });

    setVisible(false);
    setExpanded(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[120] p-3 sm:p-4">
      <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-[#d8e5d2]/90 bg-gradient-to-br from-[#ffffff] via-[#fbfdf9] to-[#f3f8ef] p-4 shadow-[0_18px_45px_rgba(21,46,26,0.16)] backdrop-blur-md sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(132,164,108,0.14),transparent_40%)]" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="relative max-w-3xl">
            <span className="inline-flex rounded-full border border-[#d5e3ce] bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2d5a27]">
              Privacy Choices
            </span>
            <h3 className="mt-2 text-sm font-bold text-[#1f4018] sm:text-base">{tr.title}</h3>
            <p className="mt-1 text-xs leading-6 text-slate-600 sm:text-sm">{tr.body}</p>
            <Link href="/cookies" className="mt-2 inline-flex text-xs font-semibold text-[#2d5a27] underline underline-offset-2">
              {tr.policy}
            </Link>
          </div>
          <div className="relative flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setExpanded((p) => !p)}
              className="rounded-xl border border-[#d3ddd0] bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {tr.manage}
            </button>
            <button
              type="button"
              onClick={() => persist({ analytics: false, marketing: false })}
              className="rounded-xl border border-[#d3ddd0] bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {tr.rejectNonEssential}
            </button>
            <button
              type="button"
              onClick={() => persist({ analytics: true, marketing: true })}
              className="rounded-xl bg-gradient-to-r from-[#2d5a27] via-[#35662f] to-[#447d3b] px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_18px_rgba(45,90,39,0.35)] transition hover:brightness-105"
            >
              {tr.acceptAll}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="relative mt-4 grid gap-3 rounded-2xl border border-[#dde8d9] bg-white/80 p-3 sm:grid-cols-3 sm:p-4">
            <div className="rounded-xl border border-[#e5eee1] bg-white p-3">
              <p className="text-xs font-semibold text-slate-900">{tr.essential}</p>
              <p className="mt-1 text-xs text-slate-600">{tr.essentialDesc}</p>
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#e5eee1] bg-white p-3">
              <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#2d5a27]" />
              <span>
                <p className="text-xs font-semibold text-slate-900">{tr.analytics}</p>
                <p className="mt-1 text-xs text-slate-600">{tr.analyticsDesc}</p>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#e5eee1] bg-white p-3">
              <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#2d5a27]" />
              <span>
                <p className="text-xs font-semibold text-slate-900">{tr.marketing}</p>
                <p className="mt-1 text-xs text-slate-600">{tr.marketingDesc}</p>
              </span>
            </label>
            <div className="sm:col-span-3">
              <button
                type="button"
                onClick={() => persist({ analytics, marketing })}
                className="rounded-xl bg-[#2d5a27] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_16px_rgba(45,90,39,0.28)] transition hover:bg-[#3a6b33]"
              >
                {tr.savePrefs}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

