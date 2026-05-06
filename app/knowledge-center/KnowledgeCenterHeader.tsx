'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import dictEn from '@/lib/i18n/en.json';
import dictGe from '@/lib/i18n/ge.json';

type Lang = 'GE' | 'EN';
const LANG_KEY = 'aylopet-lang';

function getStoredLang(): Lang {
  if (typeof window === 'undefined') return 'GE';
  const s = localStorage.getItem(LANG_KEY);
  return s === 'EN' ? 'EN' : 'GE';
}

export function KnowledgeCenterHeader() {
  const [lang, setLang] = useState<Lang>('GE');

  useEffect(() => {
    setLang(getStoredLang());
    const sync = () => setLang(getStoredLang());
    window.addEventListener('aylopet-lang-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('aylopet-lang-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const nav = lang === 'GE' ? dictGe.nav : dictEn.nav;

  const toggleLang = () => {
    const next = lang === 'GE' ? 'EN' : 'GE';
    localStorage.setItem(LANG_KEY, next);
    setLang(next);
    window.dispatchEvent(new CustomEvent('aylopet-lang-change'));
  };

  return (
    <div className="sticky top-0 z-50">
      <div className="h-0.5 w-full bg-[#2D4F1E]" aria-hidden />
      <header className="flex items-center justify-between border-b border-[#D4E4D4] bg-white/90 px-4 py-3 text-slate-900 shadow-sm backdrop-blur-sm sm:px-6">
        <Link href="/" className="flex items-center gap-2 no-underline text-slate-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#2D4F1E] to-[#8A9A5B] text-sm font-bold text-white shadow-md">
            A
          </div>
          <span className="text-sm font-semibold tracking-tight">Aylopet</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLang}
            className="rounded-full border border-slate-200/90 bg-[#eef2e7] px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-[#e2e8d8]"
          >
            {lang === 'GE' ? 'EN' : 'GE'}
          </button>
          <Link
            href="/"
            className="rounded-full bg-[#2D4F1E] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#253f18]"
          >
            {nav.home}
          </Link>
        </div>
      </header>
    </div>
  );
}
