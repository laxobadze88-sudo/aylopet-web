'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Lang = 'GE' | 'EN';
const LANG_KEY = 'aylopet-lang';

const footerTranslations: Record<Lang, Record<string, string>> = {
  GE: {
    siteMap: 'საიტის რუკა',
    products: 'პროდუქტები',
    support: 'მხარდაჭერა',
    whatIs: 'რა არის Aylopet',
    story: 'ჩვენი ისტორია',
    process: 'წარმოების პროცესი',
    team: 'გუნდი',
    vision: 'კომპანიის ხედვა',
    aylopetAI: 'AylopetAI',
    aylopetPro: 'Aylopet Pro',
    pasteurized: 'პასტერიზებული ნატურალური და ფრეში საკვები',
    whyHealthy: 'რატომ ჯანსაღი საკვები?',
    faq: 'FAQ',
    myProfile: 'ჩემი პროფილი',
    supportEmail: 'support@aylopet.com',
    forQuestions: 'კითხვებისთვის:',
    deliveryZones: 'მიტანის ზონები',
    privacy: 'Privacy',
    terms: 'Terms',
    accessibility: 'Accessibility',
  },
  EN: {
    siteMap: 'SITE MAP',
    products: 'PRODUCTS',
    support: 'SUPPORT',
    whatIs: 'What is Aylopet',
    story: 'Our Story',
    process: 'Production Process',
    team: 'Team',
    vision: 'Company Vision',
    aylopetAI: 'AylopetAI',
    aylopetPro: 'Aylopet Pro',
    pasteurized: 'Pasteurized Natural and Fresh Food',
    whyHealthy: 'Why Healthy Food?',
    faq: 'FAQ',
    myProfile: 'My Profile',
    supportEmail: 'support@aylopet.com',
    forQuestions: 'For questions:',
    deliveryZones: 'Delivery Zones',
    privacy: 'Privacy',
    terms: 'Terms',
    accessibility: 'Accessibility',
  },
};

export function Footer() {
  const [lang, setLang] = useState<Lang>(() =>
    typeof window !== 'undefined' && localStorage.getItem(LANG_KEY) === 'EN' ? 'EN' : 'GE'
  );

  useEffect(() => {
    const handler = () => {
      const stored = localStorage.getItem(LANG_KEY);
      setLang(stored === 'EN' ? 'EN' : 'GE');
    };
    window.addEventListener('aylopet-lang-change', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('aylopet-lang-change', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);
  const t = footerTranslations[lang];

  return (
    <footer className="bg-[#294d1f] text-white/90">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-14">
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">{t.siteMap}</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/about" className="text-sm text-white/80 transition hover:text-white">
                {t.whatIs}
              </Link>
              <Link href="/about" className="text-sm text-white/80 transition hover:text-white">
                {t.story}
              </Link>
              <Link href="/about" className="text-sm text-white/80 transition hover:text-white">
                {t.process}
              </Link>
              <Link href="/team" className="text-sm text-white/80 transition hover:text-white">
                {t.team}
              </Link>
              <Link href="/about" className="text-sm text-white/80 transition hover:text-white">
                {t.vision}
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">{t.products}</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/aylopetai-chat" className="text-sm text-white/80 transition hover:text-white">
                {t.aylopetAI}
              </Link>
              <Link href="/smart-collar" className="text-sm text-white/80 transition hover:text-white">
                {t.aylopetPro}
              </Link>
              <Link href="/products/pasteurized-raw" className="text-sm text-white/80 transition hover:text-white">
                {t.pasteurized}
              </Link>
              <Link href="/products/why-healthy" className="text-sm text-white/80 transition hover:text-white">
                {t.whyHealthy}
              </Link>
              <Link href="/faq" className="text-sm text-white/80 transition hover:text-white">
                {t.faq}
              </Link>
              <Link href="/profile" className="text-sm text-white/80 transition hover:text-white">
                {t.myProfile}
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">{t.support}</h3>
            <p className="mb-3 text-sm text-white/70">
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=support@aylopet.com&su=Aylopet%20Support"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/90 transition hover:text-white"
              >
                {t.supportEmail}
              </a>
            </p>
            <p className="text-sm text-white/70">
              {t.forQuestions}{' '}
              <a href="tel:+995595885625" className="text-white/90 transition hover:text-white">
                +995 595 88 56 25
              </a>
            </p>
            <p className="mt-3 text-sm text-white/70">
              <Link href="/delivery-zones" className="text-white/90 transition hover:text-white">
                {t.deliveryZones}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-4 text-xs text-white/60">
          <Link href="/privacy" className="transition hover:text-white">
            {t.privacy}
          </Link>
          <Link href="/terms" className="transition hover:text-white">
            {t.terms}
          </Link>
          <Link href="/accessibility" className="transition hover:text-white">
            {t.accessibility}
          </Link>
        </div>
      </div>
    </footer>
  );
}
