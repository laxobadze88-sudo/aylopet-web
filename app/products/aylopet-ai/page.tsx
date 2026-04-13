'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ProductSubLayout } from '@/app/components/ProductSubLayout';
import dictEn from '@/lib/i18n/en.json';
import dictGe from '@/lib/i18n/ge.json';

type Lang = 'GE' | 'EN';
const LANG_KEY = 'aylopet-lang';

export default function AylopetAiProductPage() {
  const [lang, setLang] = useState<Lang>('GE');

  useEffect(() => {
    const s = localStorage.getItem(LANG_KEY);
    setLang(s === 'EN' ? 'EN' : 'GE');
    const sync = () => setLang(localStorage.getItem(LANG_KEY) === 'EN' ? 'EN' : 'GE');
    window.addEventListener('aylopet-lang-change', sync);
    return () => window.removeEventListener('aylopet-lang-change', sync);
  }, []);

  const t = (lang === 'GE' ? dictGe : dictEn).productPages.aylopetAi;

  return (
    <ProductSubLayout headerVariant="light">
      <main className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <h1 className="text-center font-serif text-4xl font-semibold tracking-tight text-[#2d5a27] sm:text-5xl">{t.title}</h1>
        <p className="mx-auto mt-8 text-center text-base font-light leading-relaxed text-slate-600 sm:text-lg">{t.lead}</p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-sm">
            <p className="text-3xl font-semibold text-[#2d5a27]">{t.card1Value}</p>
            <p className="mt-2 text-sm text-slate-600">{t.card1Label}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-sm">
            <p className="text-3xl font-semibold text-[#2d5a27]">{t.card2Value}</p>
            <p className="mt-2 text-sm text-slate-600">{t.card2Label}</p>
          </div>
        </div>

        <p className="mt-14 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-[#2d5a27]/80">{t.kicker}</p>

        <div className="mt-8 flex justify-center">
          <Link
            href="/aylopetai-chat"
            className="inline-flex rounded-full bg-[#2D4F1E] px-10 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#2D4F1E]/30 transition hover:bg-[#253f18]"
          >
            {t.cta}
          </Link>
        </div>
      </main>
    </ProductSubLayout>
  );
}
