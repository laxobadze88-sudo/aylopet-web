'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Lang = 'GE' | 'EN';
const LANG_KEY = 'aylopet-lang';

const t: Record<Lang, { title: string; comingSoon: string; home: string }> = {
  GE: { title: 'კონფიდენციალურობის პოლიტიკა', comingSoon: 'მალე დაგვემატება', home: 'მთავარი' },
  EN: { title: 'Privacy Policy', comingSoon: 'Coming soon', home: 'Home' },
};

export default function PrivacyPage() {
  const [lang, setLang] = useState<Lang>('GE');
  useEffect(() => {
    const stored = localStorage.getItem(LANG_KEY);
    setLang(stored === 'EN' ? 'EN' : 'GE');
  }, []);
  const tr = t[lang];
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#D4E4D4] bg-white/90 backdrop-blur-sm px-4 py-3 shadow-sm">
        <Link href="/" className="flex items-center gap-2 no-underline text-slate-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2d5a27] text-white font-bold text-sm">A</div>
          <span className="text-sm font-semibold">Aylopet</span>
        </Link>
        <Link href="/" className="rounded-lg bg-[#2d5a27] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3a6b33]">{tr.home}</Link>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="font-serif text-2xl font-bold text-[#2d5a27] mb-4">{tr.title}</h1>
        <p className="text-slate-600">{tr.comingSoon}</p>
      </main>
    </div>
  );
}
