'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Lang = 'GE' | 'EN';
const LANG_KEY = 'aylopet-lang';

const translations: Record<
  Lang,
  {
    title: string;
    subtitle: string;
    description: string;
    home: string;
  }
> = {
  GE: {
    title: 'ჩვენი გუნდი',
    subtitle: 'მალე დაგვემატება',
    description:
      'ჩვენი პროფესიონალების გუნდი ამჟამად ფორმირების პროცესშია. მალე გაგაცნობთ იმ ადამიანებს, რომლებიც დგანან Aylopet-ის უკან.',
    home: 'მთავარი',
  },
  EN: {
    title: 'Our Team',
    subtitle: 'Coming Soon',
    description:
      'Our team of professionals is currently being assembled. Soon, we will introduce you to the people behind Aylopet.',
    home: 'Home',
  },
};

function getStoredLang(): Lang {
  if (typeof window === 'undefined') return 'GE';
  const stored = localStorage.getItem(LANG_KEY);
  return stored === 'EN' || stored === 'GE' ? stored : 'GE';
}

export default function TeamPage() {
  const [lang, setLang] = useState<Lang>('GE');

  useEffect(() => {
    setLang(getStoredLang());
    const handleStorage = () => setLang(getStoredLang());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setLangAndStore = (l: Lang) => {
    setLang(l);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANG_KEY, l);
      window.dispatchEvent(new CustomEvent('aylopet-lang-change'));
    }
  };

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-slate-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#E8E4DE] bg-white/90 backdrop-blur-sm px-4 py-3 shadow-sm">
        <Link
          href="/"
          className="flex items-center gap-2 no-underline text-slate-900"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2d5a27] text-white font-bold text-sm">
            A
          </div>
          <span className="text-sm font-semibold">Aylopet</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLangAndStore(lang === 'GE' ? 'EN' : 'GE')}
            className="rounded-lg bg-[#E8EFE8] px-3 py-2 text-xs font-medium text-[#2D3A2D] border border-[#D4E4D4] hover:bg-[#D4E4D4] transition"
          >
            {lang === 'GE' ? 'EN' : 'GE'}
          </button>
          <Link
            href="/"
            className="rounded-lg bg-[#2d5a27] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3a6b33] transition"
          >
            {t.home}
          </Link>
        </div>
      </header>

      {/* Centered content with fade-in */}
      <main className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-6 py-24">
        <div className="mx-auto w-full max-w-xl text-center team-fade-in">
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#2d5a27] mb-4">
            {t.title}
          </h1>
          {/* Decorative divider - Aylopet logo */}
          <div className="flex justify-center my-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2d5a27]/10 text-[#2d5a27] font-bold text-lg">
              A
            </div>
          </div>
          <p className="font-serif text-lg sm:text-xl font-medium text-[#2d5a27]/90 mb-6">
            {t.subtitle}
          </p>
          <p className="text-base sm:text-lg leading-relaxed text-slate-600">
            {t.description}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E4DE] py-6 px-4">
        <div className="mx-auto max-w-2xl flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-slate-500">
          <Link href="/" className="hover:text-[#2d5a27] transition">
            {t.home}
          </Link>
          <span className="hidden sm:inline">·</span>
          <Link href="/about" className="hover:text-[#2d5a27] transition">
            {lang === 'GE' ? 'ჩვენს შესახებ' : 'About'}
          </Link>
        </div>
      </footer>
    </div>
  );
}
