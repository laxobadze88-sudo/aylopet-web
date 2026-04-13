'use client';

import { useEffect, useState } from 'react';
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
      <main className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
        <h1 className="text-center font-serif text-3xl font-semibold tracking-tight text-[#2d5a27] sm:text-4xl">{t.title}</h1>
        <p className="mx-auto mt-8 text-center text-base font-light leading-relaxed text-slate-600 sm:text-lg">{t.lead}</p>
      </main>
    </ProductSubLayout>
  );
}
