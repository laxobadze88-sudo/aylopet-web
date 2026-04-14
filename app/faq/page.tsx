'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaqAccordionSection } from '../components/FaqAccordionSection';
import { Footer } from '../components/Footer';

type Lang = 'GE' | 'EN';
const LANG_KEY = 'aylopet-lang';

const t: Record<Lang, { title: string; home: string }> = {
  GE: { title: 'FAQ', home: 'მთავარი' },
  EN: { title: 'FAQ', home: 'Home' },
};

export default function FAQPage() {
  const [lang, setLang] = useState<Lang>('GE');

  useEffect(() => {
    const getLang = (): Lang => (localStorage.getItem(LANG_KEY) === 'EN' ? 'EN' : 'GE');
    setLang(getLang());
    const sync = () => setLang(getLang());
    window.addEventListener('aylopet-lang-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('aylopet-lang-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const tr = t[lang];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#D4E4D4] bg-white/90 backdrop-blur-sm px-4 py-3 shadow-sm">
        <Link href="/" className="flex items-center gap-2 no-underline text-slate-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2d5a27] text-white font-bold text-sm">A</div>
          <span className="text-sm font-semibold">Aylopet</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const next = lang === 'GE' ? 'EN' : 'GE';
              setLang(next);
              localStorage.setItem(LANG_KEY, next);
              window.dispatchEvent(new CustomEvent('aylopet-lang-change'));
            }}
            className="rounded-full bg-[#eef2e7] px-3 py-1 text-[11px] font-semibold text-slate-800 transition hover:bg-[#e2e8d8]"
          >
            {lang === 'GE' ? 'EN' : 'GE'}
          </button>
          <Link href="/" className="rounded-lg bg-[#2d5a27] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3a6b33]">
            {tr.home}
          </Link>
        </div>
      </header>

      <main>
        <FaqAccordionSection lang={lang} heading={tr.title} />
      </main>

      <Footer />
    </div>
  );
}
