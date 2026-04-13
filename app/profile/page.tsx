'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { MainLayout } from '@/app/components/MainLayout';
import { ReferralDashboard } from '@/app/components/referrals/ReferralDashboard';

type Lang = 'GE' | 'EN';
const LANG_KEY = 'aylopet-lang';

const copy: Record<Lang, Record<string, string>> = {
  GE: {
    "home": "მთავარი",
    "title": "ჩემი პროფილი",
    "loading": "იტვირთება…",
    "signInTitle": "საჭიროა შესვლა",
    "signInBody": "პროფილის სანახავად გთხოვთ შეხვიდეთ სისტემაში ან შეხმენით ანგარიში მთავარი გვერდიდან.",
    "goHome": "მთავარ გვერდზე",
    "email": "ელ-ფოსტა",
    "name": "სახელი",
    "promoTitle": "პრომო კოდი",
    "promoEmpty": "პრომო კოდი ჯერ არ გახვთ. დაასრულეთ AylopetAI ჩათი ან რეგისტრაცია ჩათიდან.",
    "chatCta": "AylopetAI ჩათი",
    "signOut": "გასვლა",
    "supabaseWarn": "Supabase არ არის კონფიგურირობული. შეამოწმოთ .env.local (NEXT_PUBLIC_SUPABASE_URL და NEXT_PUBLIC_SUPABASE_ANON_KEY)."
  },
  EN: {
    "home": "Home",
    "title": "My profile",
    "loading": "Loading…",
    "signInTitle": "Sign in required",
    "signInBody": "Please sign in or create an account from the home page to view your profile.",
    "goHome": "Back to home",
    "email": "Email",
    "name": "Name",
    "promoTitle": "Promo code",
    "promoEmpty": "No promo code yet. Finish the AylopetAI chat or register from the chat flow.",
    "chatCta": "AylopetAI chat",
    "signOut": "Sign out",
    "supabaseWarn": "Supabase is not configured. Check .env.local for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  },
};

function getLang(): Lang {
  if (typeof window === 'undefined') return 'GE';
  const s = localStorage.getItem(LANG_KEY);
  return s === 'EN' ? 'EN' : 'GE';
}

export default function ProfilePage() {
  const [lang, setLang] = useState<Lang>('GE');
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [promoTier, setPromoTier] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);

  const c = copy[lang];

  useEffect(() => {
    setLang(getLang());
    const sync = () => setLang(getLang());
    window.addEventListener('aylopet-lang-change', sync);
    return () => window.removeEventListener('aylopet-lang-change', sync);
  }, []);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
    setSupabaseConfigured(Boolean(url && key));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        setUserId(null);
        setReady(true);
        return;
      }
      setUserId(user.id);
      setEmail(user.email ?? null);

      const { data: prof } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
      if (!cancelled && prof && typeof prof === 'object' && 'full_name' in prof) {
        setFullName((prof as { full_name: string | null }).full_name ?? null);
      }

      try {
        const { data: promo } = await supabase
          .from('promo_codes')
          .select('user_tier, code')
          .eq('user_id', user.id)
          .maybeSingle();
        if (!cancelled && promo && typeof promo === 'object') {
          const p = promo as { user_tier?: string | null; code?: string | null };
          setPromoTier(p.user_tier ?? null);
          setPromoCode(p.code ?? null);
        }
      } catch {
        /* table or RLS */
      }

      if (!cancelled) setReady(true);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      if (cancelled) return;
      const u = session?.user;
      if (!u) {
        setUserId(null);
        setEmail(null);
        setFullName(null);
        setPromoTier(null);
        setPromoCode(null);
        return;
      }
      setUserId(u.id);
      setEmail(u.email ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserId(null);
    setEmail(null);
    setFullName(null);
    setPromoTier(null);
    setPromoCode(null);
  };

  const hasActiveProfile = Boolean(promoTier || promoCode);

  return (
    <MainLayout homeLabel={c.home}>
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        {!supabaseConfigured && (
          <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            {c.supabaseWarn}
          </div>
        )}

        <h1 className="font-serif text-2xl font-bold text-[#2d5a27] sm:text-3xl">{c.title}</h1>

        {!ready ? (
          <p className="mt-6 text-sm text-slate-600">{c.loading}</p>
        ) : !userId ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{c.signInTitle}</h2>
            <p className="mt-2 text-sm text-slate-600">{c.signInBody}</p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-xl bg-[#2d5a27] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3a6b33]"
            >
              {c.goHome}
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            <div className="rounded-2xl border border-[#D4E4D4] bg-white p-6 shadow-sm">
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">{c.email}</dt>
                  <dd className="font-medium text-slate-900">{email ?? '—'}</dd>
                </div>
                {fullName && (
                  <div>
                    <dt className="text-slate-500">{c.name}</dt>
                    <dd className="font-medium text-slate-900">{fullName}</dd>
                  </div>
                )}
              </dl>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/aylopetai-chat"
                  className="inline-flex rounded-xl bg-[#2d5a27] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3a6b33]"
                >
                  {c.chatCta}
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {c.signOut}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#D4E4D4] bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-[#2D3A2D]">{c.promoTitle}</h2>
              {promoCode ? (
                <code className="mt-3 block rounded-xl bg-[#f6f8f3] px-4 py-3 text-sm font-mono text-[#2d5a27]">{promoCode}</code>
              ) : (
                <p className="mt-2 text-sm text-slate-600">{c.promoEmpty}</p>
              )}
            </div>

            <ReferralDashboard lang={lang} userId={userId} hasActiveProfile={hasActiveProfile} promoUserTier={promoTier} />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
