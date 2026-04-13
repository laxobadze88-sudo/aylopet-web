'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import dictEn from '@/lib/i18n/en.json';
import dictGe from '@/lib/i18n/ge.json';

type Lang = 'GE' | 'EN';
const LANG_KEY = 'aylopet-lang';

type Variant = 'light' | 'dark';

type Props = {
  children: ReactNode;
  headerVariant?: Variant;
};

export function ProductSubLayout({ children, headerVariant = 'light' }: Props) {
  const [lang, setLang] = useState<Lang>('GE');

  useEffect(() => {
    const s = localStorage.getItem(LANG_KEY);
    setLang(s === 'EN' ? 'EN' : 'GE');
    const sync = () => {
      const n = localStorage.getItem(LANG_KEY);
      setLang(n === 'EN' ? 'EN' : 'GE');
    };
    window.addEventListener('aylopet-lang-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('aylopet-lang-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggleLang = () => {
    const next = lang === 'GE' ? 'EN' : 'GE';
    localStorage.setItem(LANG_KEY, next);
    setLang(next);
    window.dispatchEvent(new CustomEvent('aylopet-lang-change'));
  };

  const nav = lang === 'GE' ? dictGe.nav : dictEn.nav;
  const isDark = headerVariant === 'dark';

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900">
      <header
        className={`sticky top-0 z-50 flex items-center justify-between border-b px-4 py-3 shadow-sm backdrop-blur-sm sm:px-6 ${
          isDark
            ? 'border-white/10 bg-[#1a3d17]/95 text-white'
            : 'border-[#D4E4D4] bg-white/90 text-slate-900'
        }`}
      >
        <Link href="/" className={`flex items-center gap-2 no-underline ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold text-white shadow-md ${
              isDark ? 'bg-[#2d5a27]' : 'bg-gradient-to-tr from-[#2D4F1E] to-[#8A9A5B]'
            }`}
          >
            A
          </div>
          <span className="text-sm font-semibold tracking-tight">Aylopet</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLang}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
              isDark ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-[#eef2e7] text-slate-800 hover:bg-[#e2e8d8]'
            }`}
          >
            {lang === 'GE' ? 'EN' : 'GE'}
          </button>
          <Link
            href="/"
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              isDark ? 'bg-[#2d5a27] text-white hover:bg-[#3a6b33]' : 'bg-[#2D4F1E] text-white hover:bg-[#253f18]'
            }`}
          >
            {nav.home}
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
