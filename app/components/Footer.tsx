'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Lang = 'GE' | 'EN';
const LANG_KEY = 'aylopet-lang';

const footerTranslations: Record<Lang, Record<string, string>> = {
  GE: {
    support: 'მხარდაჭერა / Support',
    supportEmailComing: 'მხარდაჭერის მეილი მალე დაემატება / Support email coming soon',
    forQuestions: 'კითხვებისთვის / For questions:',
    partnershipB2B: 'პარტნიორობა B2B / Partnership B2B',
    ayloperAI: 'AyloperAI',
    smartCollar: 'ჭკვიანი ყელსაბამი / Smart Collar',
    aboutUs: 'ჩვენს შესახებ / About Us',
    faq: 'FAQ / ხშირად დასმული კითხვები',
    myProfile: 'ჩემი პროფილი / My Profile',
    freshFood: 'ნედლი საკვები / Fresh Food',
    blog: 'ბლოგი / Blog',
    privacy: 'Privacy',
    terms: 'Terms',
    accessibility: 'Accessibility',
  },
  EN: {
    support: 'მხარდაჭერა / Support',
    supportEmailComing: 'მხარდაჭერის მეილი მალე დაემატება / Support email coming soon',
    forQuestions: 'კითხვებისთვის / For questions:',
    partnershipB2B: 'პარტნიორობა B2B / Partnership B2B',
    ayloperAI: 'AyloperAI',
    smartCollar: 'ჭკვიანი ყელსაბამი / Smart Collar',
    aboutUs: 'ჩვენს შესახებ / About Us',
    faq: 'FAQ / ხშირად დასმული კითხვები',
    myProfile: 'ჩემი პროფილი / My Profile',
    freshFood: 'ნედლი საკვები / Fresh Food',
    blog: 'ბლოგი / Blog',
    privacy: 'Privacy',
    terms: 'Terms',
    accessibility: 'Accessibility',
  },
};

export function Footer() {
  const [lang, setLang] = useState<Lang>('GE');
  useEffect(() => {
    const stored = localStorage.getItem(LANG_KEY);
    setLang(stored === 'EN' ? 'EN' : 'GE');
  }, []);
  useEffect(() => {
    const handler = () => {
      const stored = localStorage.getItem(LANG_KEY);
      setLang(stored === 'EN' ? 'EN' : 'GE');
    };
    window.addEventListener('aylopet-lang-change', handler);
    return () => window.removeEventListener('aylopet-lang-change', handler);
  }, []);
  const t = footerTranslations[lang];
  return (
    <footer className="bg-[#1A2F1A] text-white/90">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          <div>
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-white/95 mb-4">Links</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/ayloperai-chat" className="text-sm text-white/80 hover:text-white hover:underline underline-offset-2 transition whitespace-nowrap">
                {t.ayloperAI}
              </Link>
              <Link href="/smart-collar" className="text-sm text-white/80 hover:text-white hover:underline underline-offset-2 transition whitespace-nowrap">
                {t.smartCollar}
              </Link>
              <Link href="/about" className="text-sm text-white/80 hover:text-white hover:underline underline-offset-2 transition whitespace-nowrap">
                {t.aboutUs}
              </Link>
              <Link href="/faq" className="text-sm text-white/80 hover:text-white hover:underline underline-offset-2 transition whitespace-nowrap">
                {t.faq}
              </Link>
              <Link href="/profile" className="text-sm text-white/80 hover:text-white hover:underline underline-offset-2 transition whitespace-nowrap">
                {t.myProfile}
              </Link>
              <Link href="/products" className="text-sm text-white/80 hover:text-white hover:underline underline-offset-2 transition whitespace-nowrap">
                {t.freshFood}
              </Link>
              <Link href="/blog" className="text-sm text-white/80 hover:text-white hover:underline underline-offset-2 transition whitespace-nowrap">
                {t.blog}
              </Link>
            </nav>
          </div>
          <div>
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-white/95 mb-4">{t.support}</h3>
            <p className="text-sm text-white/70 mb-3 whitespace-nowrap">{t.supportEmailComing}</p>
            <p className="text-sm text-white/70">
              <span className="whitespace-nowrap">{t.forQuestions}</span>{' '}
              <a href="tel:+995595885625" className="text-white/90 hover:text-white hover:underline underline-offset-2 transition">
                +995 595 88 56 25
              </a>
            </p>
            <p className="text-sm text-white/70 mt-3">
              <Link href="/ayloperai-chat" className="text-white/80 hover:text-white hover:underline underline-offset-2 transition whitespace-nowrap">
                {t.partnershipB2B}
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/60">
          <Link href="/privacy" className="hover:text-white hover:underline underline-offset-2 transition">
            {t.privacy}
          </Link>
          <Link href="/terms" className="hover:text-white hover:underline underline-offset-2 transition">
            {t.terms}
          </Link>
          <Link href="/accessibility" className="hover:text-white hover:underline underline-offset-2 transition">
            {t.accessibility}
          </Link>
        </div>
      </div>
    </footer>
  );
}
