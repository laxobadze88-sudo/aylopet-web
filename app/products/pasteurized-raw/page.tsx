'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProductSubLayout } from '@/app/components/ProductSubLayout';
import dictEn from '@/lib/i18n/en.json';
import dictGe from '@/lib/i18n/ge.json';

type Lang = 'GE' | 'EN';
const LANG_KEY = 'aylopet-lang';

function emphasizeCopy(text: string, lang: Lang): string {
  const pairs =
    lang === 'GE'
      ? [
          ['ნაზი დამუშავების (Gently Cooked)', '<strong>ნაზი დამუშავების (Gently Cooked)</strong>'],
          ['ცოცხალ კვებასა', '<strong>ცოცხალ კვებასა</strong>'],
          ['დაბალტემპერატურული პასტერიზაციის (70-75°C)', '<strong>დაბალტემპერატურული პასტერიზაციის (70-75°C)</strong>'],
          ['200°C-ზე', '<strong>200°C-ზე</strong>'],
          ['უსაფრთხო ცოცხალ საკვებად', '<strong>უსაფრთხო ცოცხალ საკვებად</strong>'],
          ['სინთეზური კონსერვანტების', '<strong>სინთეზური კონსერვანტების</strong>'],
          ['ფარული შაქრებისა', '<strong>ფარული შაქრებისა</strong>'],
        ]
      : [
          ['Fresh Food', '<strong>Fresh Food</strong>'],
          ['Gently Cooked', '<strong>Gently Cooked</strong>'],
          ['Fresh Dog Food', '<strong>Fresh Dog Food</strong>'],
          ['low-temperature pasteurization (70-75°C)', '<strong>low-temperature pasteurization (70-75°C)</strong>'],
          ['200°C', '<strong>200°C</strong>'],
          ['synthetic preservatives', '<strong>synthetic preservatives</strong>'],
          ['hidden sugars', '<strong>hidden sugars</strong>'],
        ];

  return pairs.reduce((acc, [from, to]) => acc.replace(from, to), text);
}

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
      <main className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <h1 className="text-center font-serif text-3xl font-semibold tracking-tight text-[#2d5a27] sm:text-4xl">{t.title}</h1>
        <p className="mx-auto mt-8 text-center text-lg font-medium leading-relaxed text-slate-700 sm:text-xl">{t.intro}</p>

        <div className="mt-10 space-y-10 rounded-3xl bg-gradient-to-b from-[#f9fcf6] via-[#f6faf2] to-transparent p-6 text-slate-700 sm:p-10">
          <p
            className="text-base leading-relaxed sm:text-lg [&_strong]:font-semibold [&_strong]:text-[#2d5a27]"
            dangerouslySetInnerHTML={{ __html: emphasizeCopy(t.p1, lang) }}
          />

          <div>
            <h2 className="font-serif text-xl font-semibold tracking-tight text-[#2d5a27] sm:text-2xl">{t.p2Title}</h2>
            <p
              className="mt-3 text-base leading-relaxed sm:text-lg [&_strong]:font-semibold [&_strong]:text-[#2d5a27]"
              dangerouslySetInnerHTML={{ __html: emphasizeCopy(t.p2, lang) }}
            />
          </div>

          <div>
            <h2 className="font-serif text-xl font-semibold tracking-tight text-[#2d5a27] sm:text-2xl">{t.p3Title}</h2>
            <p
              className="mt-3 text-base leading-relaxed sm:text-lg [&_strong]:font-semibold [&_strong]:text-[#2d5a27]"
              dangerouslySetInnerHTML={{ __html: emphasizeCopy(t.p3, lang) }}
            />
          </div>
        </div>

        <div id="production-video" className="mt-12 rounded-3xl bg-gradient-to-br from-[#eef6e8] via-[#f4faef] to-[#f9fcf6] p-6 text-center sm:p-8">
          <h3 className="font-serif text-xl font-semibold tracking-tight text-[#2d5a27] sm:text-2xl">{t.videoTitle}</h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">{t.videoSubtitle}</p>
          <Link
            href="/about#production"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-[#2d5a27] px-6 py-3 text-sm font-medium text-white shadow-[0_10px_24px_-12px_rgba(45,90,39,0.55)] transition hover:-translate-y-0.5 hover:bg-[#234820] sm:text-base"
          >
            {t.videoCta}
          </Link>
        </div>
      </main>
    </ProductSubLayout>
  );
}
