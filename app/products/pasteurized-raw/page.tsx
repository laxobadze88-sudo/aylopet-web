'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProductSubLayout } from '@/app/components/ProductSubLayout';
import dictEn from '@/lib/i18n/en.json';
import dictGe from '@/lib/i18n/ge.json';

type Lang = 'GE' | 'EN';
const LANG_KEY = 'aylopet-lang';

export default function PasteurizedRawPage() {
  const [lang, setLang] = useState<Lang>('GE');

  useEffect(() => {
    const s = localStorage.getItem(LANG_KEY);
    setLang(s === 'EN' ? 'EN' : 'GE');
    const sync = () => setLang(localStorage.getItem(LANG_KEY) === 'EN' ? 'EN' : 'GE');
    window.addEventListener('aylopet-lang-change', sync);
    return () => window.removeEventListener('aylopet-lang-change', sync);
  }, []);

  const t = (lang === 'GE' ? dictGe : dictEn).productPages.pasteurizedRaw;

  return (
    <ProductSubLayout headerVariant="light">
      <main className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <h1 className="text-center font-serif text-3xl font-semibold tracking-tight text-[#2d5a27] sm:text-4xl">{t.title}</h1>
        <p className="mx-auto mt-8 text-center text-lg font-medium leading-relaxed text-slate-700 sm:text-xl">{t.intro}</p>

        <div className="mt-10 space-y-8 rounded-3xl border border-[#dce7d5] bg-white/80 p-6 text-slate-700 shadow-sm sm:p-10">
          <p className="text-base leading-relaxed sm:text-lg">{t.p1}</p>

          <div>
            <h2 className="font-serif text-xl font-semibold tracking-tight text-[#2d5a27] sm:text-2xl">{t.p2Title}</h2>
            <p className="mt-3 text-base leading-relaxed sm:text-lg">{t.p2}</p>
          </div>

          <div>
            <h2 className="font-serif text-xl font-semibold tracking-tight text-[#2d5a27] sm:text-2xl">{t.p3Title}</h2>
            <p className="mt-3 text-base leading-relaxed sm:text-lg">{t.p3}</p>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-[#dce7d5] bg-[#f8fbf5] p-6 text-center sm:p-8">
          <h3 className="font-serif text-xl font-semibold tracking-tight text-[#2d5a27] sm:text-2xl">{t.videoTitle}</h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">{t.videoSubtitle}</p>
          <Link
            href="/about#production"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-[#2d5a27] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#234820] sm:text-base"
          >
            {t.videoCta}
          </Link>
        </div>
      </main>
    </ProductSubLayout>
  );
}
