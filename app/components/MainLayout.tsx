'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import dictEn from '@/lib/i18n/en.json';
import dictGe from '@/lib/i18n/ge.json';
import { Footer } from './Footer';

const LANG_KEY = 'aylopet-lang';

type Lang = 'GE' | 'EN';

function getStoredLang(): Lang {
  if (typeof window === 'undefined') return 'GE';
  const s = localStorage.getItem(LANG_KEY);
  return s === 'EN' || s === 'GE' ? s : 'GE';
}

type MainLayoutProps = {
  children: React.ReactNode;
  /** Shown next to logo area — e.g. page title hint */
  homeLabel: string;
};

const dict = { GE: dictGe, EN: dictEn };

export function MainLayout({ children, homeLabel }: MainLayoutProps) {
  const pathname = usePathname();
  const [lang, setLang] = useState<Lang>('GE');
  const navT = dict[lang].nav;

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

  const toggleLang = () => {
    const next = lang === 'GE' ? 'EN' : 'GE';
    setLang(next);
    localStorage.setItem(LANG_KEY, next);
    window.dispatchEvent(new CustomEvent('aylopet-lang-change'));
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#f6f8f3] via-white to-[#eef2e7] text-slate-900">
      <div className="sticky top-0 z-50 border-b border-slate-100/80 bg-white/85 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex min-w-0 flex-shrink-0 items-center gap-2 no-underline text-slate-900">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#2D4F1E] to-[#8A9A5B] text-white shadow-md">
              <span className="text-lg font-bold">A</span>
            </div>
            <span className="truncate text-lg font-semibold tracking-tight">Aylopet</span>
          </Link>
          <div className="flex flex-shrink-0 items-center gap-2">
            <Link
              href="/"
              className="hidden rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-[#eef2e7] hover:text-[#2D4F1E] sm:inline-flex"
            >
              {homeLabel}
            </Link>
            <Link
              href="/project-status"
              className={`hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition sm:inline-flex ${
                pathname === '/project-status'
                  ? 'bg-[#eef2e7] text-[#2D4F1E] ring-1 ring-[#2D4F1E]/25'
                  : 'text-slate-700 hover:bg-[#eef2e7] hover:text-[#2D4F1E]'
              }`}
            >
              <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {navT.projectStatus}
            </Link>
            <a
              href="/aylopetai-chat"
              className="hidden items-center gap-1.5 rounded-full bg-[#2D4F1E] px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-[#2D4F1E]/25 transition hover:bg-[#253f18] sm:inline-flex"
            >
              AI
            </a>
            <button
              type="button"
              onClick={toggleLang}
              className="rounded-full bg-[#eef2e7] px-3 py-1.5 text-[11px] font-semibold text-slate-800 transition hover:bg-[#e2e8d8]"
            >
              {lang === 'GE' ? 'EN' : 'GE'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col">{children}</div>

      <Footer />
    </div>
  );
}
