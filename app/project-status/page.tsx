'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import dictEn from '@/lib/i18n/en.json';
import dictGe from '@/lib/i18n/ge.json';
import { fetchFoundingMemberCount } from '@/lib/project-status/founding-count';
import { MainLayout } from '../components/MainLayout';
import { FadeInSection } from '../components/FadeInSection';

type Lang = 'GE' | 'EN';
const LANG_KEY = 'aylopet-lang';
const FOUNDING_GOAL = 500;

const dict = { GE: dictGe, EN: dictEn };

type Stage = {
  phase: string;
  title: string;
  badge: string;
  body: string;
};

export default function ProjectStatusPage() {
  const [lang, setLang] = useState<Lang>('GE');
  const [foundingCount, setFoundingCount] = useState<number | null>(null);

  const t = dict[lang].projectStatusPage;
  const homeLabel = dict[lang].nav.home;

  useEffect(() => {
    const stored = localStorage.getItem(LANG_KEY);
    setLang(stored === 'EN' ? 'EN' : 'GE');
  }, []);

  useEffect(() => {
    const handler = () => {
      const stored = localStorage.getItem(LANG_KEY);
      setLang(stored === 'EN' ? 'EN' : 'GE');
    };
    window.addEventListener('aylopet-lang-change', handler);
    return () => window.removeEventListener('aylopet-lang-change', handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const n = await fetchFoundingMemberCount();
      if (!cancelled) setFoundingCount(n);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const progressPct = useMemo(() => {
    if (foundingCount == null) return 0;
    return Math.min(100, (foundingCount / FOUNDING_GOAL) * 100);
  }, [foundingCount]);

  const countLabel =
    foundingCount == null
      ? t.community.countLoading
      : t.community.countFormat.replace('{current}', String(foundingCount)).replace('{goal}', String(FOUNDING_GOAL));

  const roadmapStages: Stage[] = [t.roadmap.stage1, t.roadmap.stage2, t.roadmap.stage3, t.roadmap.stage4];

  return (
    <MainLayout homeLabel={homeLabel}>
      <main className="relative flex-1 overflow-x-hidden bg-gradient-to-b from-[#FAF9F6] via-white to-[#f6f8f3]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[min(85vh,640px)] bg-[radial-gradient(ellipse_90%_55%_at_50%_-8%,rgba(45,79,30,0.07),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_20%,rgba(194,65,12,0.05),transparent)]"
          aria-hidden
        />

        {/* Hero */}
        <FadeInSection className="relative mx-auto max-w-3xl px-6 pb-20 pt-24 sm:px-10 sm:pb-28 sm:pt-32">
          <p className="mb-8 text-center text-[10px] font-medium uppercase tracking-[0.42em] text-[#2D4F1E]/55 sm:text-left">
            {t.hero.kicker}
          </p>
          <h1 className="text-center font-serif text-[clamp(1.875rem,5vw,3rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-slate-900 sm:text-left">
            {t.hero.title}
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-center text-[1.0625rem] font-light leading-[1.65] text-slate-600 sm:mx-0 sm:text-left sm:text-lg">
            {t.hero.subtitle}
          </p>
        </FadeInSection>

        {/* Status card */}
        <FadeInSection className="relative mx-auto max-w-3xl px-6 sm:px-10">
          <div className="rounded-[2rem] border border-[#dfe9da] bg-gradient-to-br from-white via-[#fdfefb] to-[#f6f8f3] p-9 shadow-[0_20px_60px_-45px_rgba(45,79,30,0.4)] sm:p-11 md:p-14">
            <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-[#2D4F1E]/12 bg-[#f6f8f3]/90 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2D4F1E]">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c2410c]/50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ea580c]" />
              </span>
              {t.statusCard.badge}
            </div>
            <p className="text-[1.0625rem] font-light leading-[1.85] text-slate-700 md:text-lg">
              {t.statusCard.title}. {t.statusCard.body}
            </p>
          </div>
        </FadeInSection>

        {/* Intent */}
        <FadeInSection className="relative mx-auto max-w-3xl px-6 py-24 sm:px-10 sm:py-32">
          <div className="rounded-[2rem] border border-[#dfe9da] bg-gradient-to-br from-white via-[#fdfefb] to-[#f6f8f3] p-9 shadow-[0_20px_60px_-45px_rgba(45,79,30,0.4)] sm:p-11 md:p-14">
            <h2 className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-[#2D4F1E]/12 bg-[#f6f8f3]/90 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2D4F1E]">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ea580c]" />
              {t.intent.title}
            </h2>
            <p className="text-[1.0625rem] font-light leading-[1.85] text-slate-700 md:text-lg">{t.intent.body}</p>
          </div>
        </FadeInSection>

        {/* Founding 500 */}
        <FadeInSection className="relative mx-auto max-w-3xl px-6 pb-24 sm:px-10 sm:pb-32">
          <div className="rounded-[2rem] border border-[#dfe9da] bg-gradient-to-br from-white via-[#fdfefb] to-[#f6f8f3] p-9 shadow-[0_20px_60px_-45px_rgba(45,79,30,0.4)] sm:p-11 md:p-14">
            <h2 className="font-serif text-[1.375rem] font-semibold tracking-tight text-slate-900 sm:text-2xl">{t.community.title}</h2>
            <p className="mt-5 max-w-2xl text-[0.9375rem] font-light leading-relaxed text-slate-600 sm:text-base">{t.community.description}</p>

            <div className="mt-12">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">{t.community.progressCaption}</span>
                <span className="font-mono text-sm tabular-nums tracking-tight text-slate-900">{countLabel}</span>
              </div>
              <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-100/90 ring-1 ring-slate-200/40">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#2D4F1E] via-[#4a7c3f] to-[#8A9A5B] shadow-[0_0_24px_-4px_rgba(45,79,30,0.45)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.div
                  className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                  style={{ width: '40%' }}
                />
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* Roadmap — horizontal on xl */}
        <FadeInSection className="relative mx-auto max-w-6xl px-6 pb-32 sm:px-10 sm:pb-40">
          <h2 className="mb-16 font-serif text-[1.375rem] font-semibold tracking-tight text-slate-900 sm:text-2xl">{t.roadmap.heading}</h2>

          <div className="hidden xl:block">
            <div className="relative flex gap-0">
              {roadmapStages.map((stage, i) => {
                const isCurrent = i === 0;
                return (
                  <div key={stage.phase} className="relative flex-1 px-4 first:pl-0 last:pr-0">
                    {i < roadmapStages.length - 1 ? (
                      <div
                        className="absolute left-[calc(50%+0.75rem)] right-[-0.5rem] top-[0.65rem] h-px bg-gradient-to-r from-[#2D4F1E]/25 via-slate-200 to-slate-100"
                        aria-hidden
                      />
                    ) : null}
                    <div className="relative flex flex-col items-start">
                      <span
                        className={`relative z-[1] mb-6 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 ${
                          isCurrent
                            ? 'border-[#ea580c] bg-[#fff7ed] shadow-[0_0_0_6px_rgba(234,88,12,0.1)]'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${isCurrent ? 'bg-[#ea580c]' : 'bg-[#2D4F1E]/35'}`} />
                      </span>
                      <div className="flex flex-wrap items-center gap-2 gap-y-1">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2D4F1E]/75">{stage.phase}</span>
                        {stage.badge ? (
                          <span className="rounded-full bg-[#fff7ed] px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#9a3412]">
                            {stage.badge}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-3 text-base font-semibold tracking-tight text-slate-900">{stage.title}</h3>
                      <p className="mt-3 max-w-[14rem] text-sm font-light leading-relaxed text-slate-600">{stage.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="xl:hidden">
            <div className="relative">
              <div
                className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-[#2D4F1E]/30 via-[#ea580c]/18 to-slate-200 sm:left-[11px]"
                aria-hidden
              />
              <ul className="space-y-14">
                {roadmapStages.map((stage, i) => {
                  const isCurrent = i === 0;
                  return (
                    <li key={stage.phase} className="relative pl-10 sm:pl-14">
                      <span
                        className={`absolute left-0 top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 sm:top-2 sm:h-5 sm:w-5 ${
                          isCurrent
                            ? 'border-[#ea580c] bg-[#fff7ed] shadow-[0_0_0_4px_rgba(234,88,12,0.1)]'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${isCurrent ? 'bg-[#ea580c]' : 'bg-[#2D4F1E]/35'}`} />
                      </span>
                      <div className="flex flex-wrap items-center gap-2 gap-y-1">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2D4F1E]/75">{stage.phase}</span>
                        {stage.badge ? (
                          <span className="rounded-full bg-[#fff7ed] px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#9a3412]">
                            {stage.badge}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-1 text-base font-semibold text-slate-900">{stage.title}</h3>
                      <p className="mt-2 max-w-prose text-sm font-light leading-relaxed text-slate-600 sm:text-base">{stage.body}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </FadeInSection>
      </main>
    </MainLayout>
  );
}
