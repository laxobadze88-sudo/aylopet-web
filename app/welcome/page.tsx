'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Dog } from 'lucide-react';
import { MainLayout } from '../components/MainLayout';
import welcomeCopy from '@/lib/welcome/translations.json';
import { supabase } from '@/lib/supabase';

const LANG_KEY = 'aylopet-lang';
type Lang = 'GE' | 'EN';

function getLang(): Lang {
  if (typeof window === 'undefined') return 'GE';
  const s = localStorage.getItem(LANG_KEY);
  return s === 'EN' ? 'EN' : 'GE';
}

export default function WelcomePage() {
  const [lang, setLang] = useState<Lang>('GE');
  const [slotsFull, setSlotsFull] = useState<boolean | null>(null);

  useEffect(() => {
    setLang(getLang());
    const onSync = () => setLang(getLang());
    window.addEventListener('aylopet-lang-change', onSync);
    window.addEventListener('storage', onSync);
    return () => {
      window.removeEventListener('aylopet-lang-change', onSync);
      window.removeEventListener('storage', onSync);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.rpc('get_ambassador_count');
        if (cancelled) return;
        if (error) {
          setSlotsFull(false);
          return;
        }
        setSlotsFull((data ?? 0) >= 100);
      } catch {
        if (!cancelled) setSlotsFull(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const t = welcomeCopy[lang];
  const chatHrefAmbassador = '/aylopetai-chat?welcome=ambassador';
  const chatHrefEarlyBird = '/aylopetai-chat?welcome=early_bird';

  return (
    <MainLayout homeLabel={t.metaHome}>
      <main className="relative flex flex-1 flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-[#e8f0e4]/95 via-[#f6f8f3]/50 to-transparent"
        />
        <div className="relative mx-auto w-full max-w-4xl flex-1 px-4 pb-20 pt-12 sm:px-6 sm:pt-16">
          <header className="text-center">
            <div className="mx-auto mb-8 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#fff7ed] to-[#ffedd5] shadow-lg shadow-orange-200/40 ring-1 ring-orange-100/80">
                <Dog className="h-9 w-9 text-[#c2410c]" strokeWidth={1.5} aria-hidden />
              </div>
            </div>
            <h1 className="font-serif text-2xl font-semibold leading-snug tracking-tight text-[#1e3a2f] sm:text-3xl md:text-[1.65rem] md:leading-tight">
              {t.headline}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg font-normal leading-relaxed text-slate-700 sm:text-xl md:text-[1.35rem] md:leading-relaxed">
              {t.subheadline}
            </p>
            <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed text-[#2d5a27] sm:text-xl md:text-[1.35rem] md:leading-relaxed">
              {t.emotionalHook}
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href="#gifts"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#2D4F1E] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#2D4F1E]/30 transition hover:bg-[#253f18]"
              >
                {t.primaryCta}
              </a>
              <Link
                href="/"
                className="text-sm font-semibold text-[#2d5a27] underline decoration-[#2d5a27]/40 underline-offset-4 transition hover:text-[#1e3a2f]"
              >
                {t.exploreHome}
              </Link>
            </div>
          </header>

          <section className="mt-16 grid gap-6 md:grid-cols-2">
            <Link
              href="/products/fresh-food"
              className="group relative overflow-hidden rounded-2xl border border-[#D4E4D4] bg-white/90 p-8 shadow-md shadow-slate-200/50 transition hover:border-[#2D4F1E]/40 hover:shadow-lg"
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-amber-100/80 to-orange-50/50" />
              <h2 className="relative font-serif text-xl font-semibold text-[#2d5a27]">{t.freshFoodTitle}</h2>
              <p className="relative mt-2 text-sm text-slate-600">{t.freshFoodSubtitle}</p>
              <span className="relative mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[#2D4F1E] group-hover:underline">
                →
              </span>
            </Link>

            <div className="rounded-2xl border border-slate-100 bg-white/80 p-8 shadow-sm backdrop-blur-sm">
              <h2 className="font-serif text-lg font-semibold text-[#2d5a27]">Aylopet</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{t.about}</p>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-[#eef2e7] bg-[#f6f8f3]/80 p-8 shadow-inner">
            <p className="text-sm font-medium leading-relaxed text-slate-800">{t.mission}</p>
            <p className="mt-5 text-sm leading-relaxed text-slate-600">{t.mvpStatus}</p>
          </section>

          <section
            id="gifts"
            className="mt-16 scroll-mt-28 rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50/90 via-white to-[#f0f8f0] p-8 shadow-[0_20px_60px_-15px_rgba(45,79,30,0.12)] sm:p-10"
          >
            <h2 className="text-center font-serif text-2xl font-semibold text-[#1e3a2f]">{t.giftsHeading}</h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-base leading-relaxed text-slate-600 sm:text-[1.05rem]">
              {t.preSaleCommitment}
            </p>

            <div className="mx-auto mt-10 flex max-w-md flex-col gap-4">
              {slotsFull === null ? (
                <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-200/80" aria-hidden />
              ) : slotsFull ? (
                <Link
                  href={chatHrefEarlyBird}
                  className="inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#2D4F1E] to-[#3d6b4a] px-6 py-3.5 text-center text-sm font-semibold text-white shadow-lg transition hover:opacity-[0.97]"
                >
                  {t.btnEarlyBird}
                </Link>
              ) : (
                <Link
                  href={chatHrefAmbassador}
                  className="inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#2D4F1E] to-[#3d6b4a] px-6 py-3.5 text-center text-sm font-semibold text-white shadow-lg transition hover:opacity-[0.97]"
                >
                  {t.btnAmbassador}
                </Link>
              )}
            </div>
          </section>
        </div>
      </main>
    </MainLayout>
  );
}