'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, FileText, ShieldCheck, Sparkles } from 'lucide-react';
import { ProductSubLayout } from '@/app/components/ProductSubLayout';
import dictEn from '@/lib/i18n/en.json';
import dictGe from '@/lib/i18n/ge.json';

type Lang = 'GE' | 'EN';
const LANG_KEY = 'aylopet-lang';

export default function WhyHealthyPage() {
  const [lang, setLang] = useState<Lang>('GE');

  useEffect(() => {
    const s = localStorage.getItem(LANG_KEY);
    setLang(s === 'EN' ? 'EN' : 'GE');
    const sync = () => setLang(localStorage.getItem(LANG_KEY) === 'EN' ? 'EN' : 'GE');
    window.addEventListener('aylopet-lang-change', sync);
    return () => window.removeEventListener('aylopet-lang-change', sync);
  }, []);

  const t = (lang === 'GE' ? dictGe : dictEn).productPages.whyHealthy;

  return (
    <ProductSubLayout headerVariant="light">
      <main className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <div className="relative overflow-hidden rounded-[2rem] border border-[#d8e6d2] bg-gradient-to-b from-[#f9fcf6] via-white to-[#f5faef] px-6 py-10 shadow-[0_20px_70px_-40px_rgba(45,90,39,0.45)] sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute -top-16 -right-14 h-48 w-48 rounded-full bg-[#7eb26f]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-[#4f7f45]/10 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#cfe1c8] bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[#2d5a27]">
              <Sparkles className="h-3.5 w-3.5" />
              Aylopet Science
            </span>
            <h1 className="mt-5 text-center font-serif text-3xl font-semibold tracking-tight text-[#234820] sm:text-4xl">{t.title}</h1>
            <p className="mx-auto mt-7 max-w-2xl text-center text-base leading-relaxed text-slate-700 sm:text-lg">{t.intro}</p>
          </div>
        </div>

        <section className="mt-10 space-y-6 rounded-3xl border border-[#dce7d5] bg-white/90 p-6 shadow-[0_20px_60px_-45px_rgba(45,90,39,0.35)] sm:p-10">
          <p className="flex items-start gap-3 text-base leading-relaxed text-slate-700 sm:text-lg">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#2d5a27]" />
            <span>{t.evidenceLead}</span>
          </p>

          <article className="group rounded-2xl border border-[#e1eadb] bg-gradient-to-b from-[#fbfdf9] to-[#f4f9ef] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
            <h2 className="font-serif text-xl font-semibold tracking-tight text-[#2d5a27] sm:text-2xl">{t.study1Title}</h2>
            <p className="mt-3 text-base leading-relaxed text-slate-700 sm:text-lg">{t.study1Body}</p>
            <Link
              href={t.study1Url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#2d5a27] bg-white px-4 py-2 text-sm font-medium text-[#2d5a27] transition hover:bg-[#2d5a27] hover:text-white"
            >
              <FileText className="h-4 w-4" />
              {t.study1Cta}
              <ExternalLink className="h-4 w-4" />
            </Link>
          </article>

          <article className="group rounded-2xl border border-[#e1eadb] bg-gradient-to-b from-[#fbfdf9] to-[#f4f9ef] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
            <h2 className="font-serif text-xl font-semibold tracking-tight text-[#2d5a27] sm:text-2xl">{t.study2Title}</h2>
            <p className="mt-3 text-base leading-relaxed text-slate-700 sm:text-lg">{t.study2Body}</p>
            <Link
              href={t.study2Url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#2d5a27] bg-white px-4 py-2 text-sm font-medium text-[#2d5a27] transition hover:bg-[#2d5a27] hover:text-white"
            >
              <FileText className="h-4 w-4" />
              {t.study2Cta}
              <ExternalLink className="h-4 w-4" />
            </Link>
          </article>

          <div className="rounded-2xl border border-[#e1eadb] bg-[#f8fbf5] p-5 sm:p-6">
            <p className="text-base leading-relaxed text-slate-700 sm:text-lg">{t.outro}</p>
          </div>
        </section>
      </main>
    </ProductSubLayout>
  );
}
