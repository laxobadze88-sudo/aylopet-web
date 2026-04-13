'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ProductSubLayout } from '@/app/components/ProductSubLayout';
import dictEn from '@/lib/i18n/en.json';
import dictGe from '@/lib/i18n/ge.json';

type Lang = 'GE' | 'EN';
const LANG_KEY = 'aylopet-lang';

export default function SmartCollarPage() {
  const [lang, setLang] = useState<Lang>('GE');

  useEffect(() => {
    const s = localStorage.getItem(LANG_KEY);
    setLang(s === 'EN' ? 'EN' : 'GE');
    const sync = () => setLang(localStorage.getItem(LANG_KEY) === 'EN' ? 'EN' : 'GE');
    window.addEventListener('aylopet-lang-change', sync);
    return () => window.removeEventListener('aylopet-lang-change', sync);
  }, []);

  const t = (lang === 'GE' ? dictGe : dictEn).productPages.smartCollar;

  return (
    <ProductSubLayout headerVariant="dark">
      <div className="relative min-h-[calc(100vh-57px)] overflow-hidden">
        <Image
          src="/images/aylopet-pro-hero.png"
          alt=""
          fill
          priority
          className="object-cover object-[28%_center] sm:object-[32%_center]"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/20 to-black/50"
          aria-hidden
        />

        <main className="relative z-[1] mx-auto flex min-h-[calc(100vh-57px)] max-w-6xl flex-col justify-center px-5 py-14 sm:px-6 sm:py-16 lg:flex-row lg:items-center lg:justify-end lg:gap-10 lg:px-8 lg:py-24">
          <div className="mx-auto mt-8 w-full max-w-lg lg:mx-0 lg:mt-0 lg:shrink-0">
            <div className="rounded-[1.25rem] border border-white/25 bg-white/[0.14] p-7 text-right shadow-[0_25px_80px_-12px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:rounded-3xl sm:p-9 md:p-10">
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {t.title}
              </h1>
              <p className="mt-5 font-sans text-sm font-light leading-relaxed text-white/95 sm:mt-6 sm:text-base">
                {t.lead}
              </p>
            </div>
          </div>
        </main>
      </div>
    </ProductSubLayout>
  );
}
