'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Lang = 'GE' | 'EN';
const LANG_KEY = 'aylopet-lang';
const SUPPORT_EMAIL = 'support@aylopet.com';
const SUPPORT_GMAIL_URL = 'https://mail.google.com/mail/?view=cm&fs=1&to=support@aylopet.com&su=Aylopet%20Support';

function renderWithSupportEmail(text: string) {
  const chunks = text.split(SUPPORT_EMAIL);
  return chunks.map((chunk, idx) => (
    <span key={`${chunk}-${idx}`}>
      {chunk}
      {idx < chunks.length - 1 ? (
        <a href={SUPPORT_GMAIL_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-[#2d5a27] underline">
          {SUPPORT_EMAIL}
        </a>
      ) : null}
    </span>
  ));
}

const t: Record<Lang, { title: string; updatedAt: string; home: string }> = {
  GE: { title: 'ხელმისაწვდომობის განცხადება', updatedAt: 'ბოლოს განახლდა: 2026 წლის 27 თებერვალი', home: 'მთავარი' },
  EN: { title: 'Accessibility Statement', updatedAt: 'Last updated: February 27, 2026', home: 'Home' },
};

const geSections: Array<{ heading: string; body: string[]; bullets?: string[] }> = [
  {
    heading: 'ჩვენი ვალდებულება',
    body: [
      'Aylopet ისწრაფვის, რომ ვებგვერდი მაქსიმალურად ხელმისაწვდომი იყოს ყველასთვის, მათ შორის შეზღუდული შესაძლებლობის მქონე მომხმარებლებისთვის.',
      'ჩვენ ეტაპობრივად ვაუმჯობესებთ დიზაინსა და ფუნქციონალს, რათა საიტით სარგებლობა იყოს უფრო მარტივი, გასაგები და კომფორტული.',
    ],
  },
  {
    heading: 'როგორ ვმუშაობთ ხელმისაწვდომობაზე',
    body: ['ვხელმძღვანელობთ საერთაშორისო საუკეთესო პრაქტიკით და ვაკვირდებით ხელმისაწვდომობის სტანდარტებს (მათ შორის WCAG პრინციპებს).'],
    bullets: [
      'კონტენტის მკაფიო სტრუქტურა და სათაურების ლოგიკური იერარქია',
      'კონტრასტის, ტექსტის წაკითხვადობის და ინტერფეისის სიცხადის გაუმჯობესება',
      'კლავიატურით ნავიგაციის მხარდაჭერის გაუმჯობესება',
      'ფორმების და ღილაკების ეტიკეტების მაქსიმალურად გასაგებად წარმოდგენა',
      'რეგულარული მონიტორინგი და ეტაპობრივი გაუმჯობესება',
    ],
  },
  {
    heading: 'მესამე მხარის კომპონენტები',
    body: [
      'საიტის გარკვეული ნაწილები შეიძლება მოიცავდეს მესამე მხარის სერვისებს ან ბმულებს. მიუხედავად იმისა, რომ ვირჩევთ სანდო პარტნიორებს, მათ ხელმისაწვდომობაზე სრული კონტროლი ყოველთვის ჩვენს მხარეს არ არის.',
      'ასეთ შემთხვევებშიც ვცდილობთ, მომხმარებლისთვის შევთავაზოთ ყველაზე კომფორტული და გასაგები გამოცდილება.',
    ],
  },
  {
    heading: 'უკუკავშირი და დახმარება',
    body: [
      'თუ საიტზე შეამჩნიეთ ხელმისაწვდომობასთან დაკავშირებული ბარიერი ან გჭირდებათ კონკრეტული დახმარება, დაგვიკავშირდით და ვეცდებით გონივრულ ვადაში რეაგირებას.',
      'შეგიძლიათ მოგვწეროთ რა გვერდზე ან პროცესში შეგექმნათ სირთულე, რათა სწრაფად გამოვასწოროთ.',
    ],
    bullets: [
      'ელფოსტა: support@aylopet.com',
      'ტელეფონი: +995595885625',
    ],
  },
];

const enSections: Array<{ heading: string; body: string[]; bullets?: string[] }> = [
  {
    heading: 'Our Commitment',
    body: [
      'Aylopet strives to make our website as accessible as reasonably possible for all users, including people with disabilities.',
      'We improve design and functionality on an ongoing, best-effort basis to provide a clearer and more usable experience.',
    ],
  },
  {
    heading: 'How We Approach Accessibility',
    body: ['We align our work with international best practices and accessibility standards, including WCAG principles.'],
    bullets: [
      'Clear content structure and logical heading hierarchy',
      'Improved contrast, readability, and interface clarity',
      'Ongoing improvement of keyboard navigation support',
      'Clear labels for forms, controls, and actions',
      'Regular review and iterative accessibility enhancements',
    ],
  },
  {
    heading: 'Third-Party Content',
    body: [
      'Some parts of our website may include third-party services or links. While we choose reliable providers, we may not fully control their accessibility implementation.',
      'Where possible, we provide alternatives and keep the overall journey understandable and practical for users.',
    ],
  },
  {
    heading: 'Feedback and Contact',
    body: [
      'If you encounter an accessibility barrier or need support using any feature on our website, please contact us and we will do our best to assist promptly.',
      'When contacting us, please include the page or flow where the issue happened so we can resolve it faster.',
    ],
    bullets: ['Email: support@aylopet.com', 'Phone: +995595885625'],
  },
];

export default function AccessibilityPage() {
  const [lang, setLang] = useState<Lang>('GE');

  useEffect(() => {
    const sync = () => {
      const stored = localStorage.getItem(LANG_KEY);
      setLang(stored === 'EN' ? 'EN' : 'GE');
    };
    sync();
    window.addEventListener('aylopet-lang-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('aylopet-lang-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const tr = t[lang];
  const sections = lang === 'EN' ? enSections : geSections;

  const toggleLang = () => {
    const next = lang === 'GE' ? 'EN' : 'GE';
    localStorage.setItem(LANG_KEY, next);
    setLang(next);
    window.dispatchEvent(new CustomEvent('aylopet-lang-change'));
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#D4E4D4] bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm sm:px-6">
        <Link href="/" className="flex items-center gap-2 no-underline text-slate-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2d5a27] text-white font-bold text-sm">A</div>
          <span className="text-sm font-semibold">Aylopet</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLang}
            className="rounded-full border border-slate-200/90 bg-[#eef2e7] px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-[#e2e8d8]"
          >
            {lang === 'GE' ? 'EN' : 'GE'}
          </button>
          <Link href="/" className="rounded-lg bg-[#2d5a27] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3a6b33]">
            {tr.home}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
        <h1 className="mb-2 font-serif text-3xl font-semibold text-[#1f3f16] sm:text-4xl">{tr.title}</h1>
        <p className="mb-8 text-sm text-slate-500">{tr.updatedAt}</p>

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.heading} className="space-y-3 border-b border-slate-100 pb-6 last:border-b-0 last:pb-0">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#2d5a27]">{section.heading}</h2>
              {section.body.map((paragraph, idx) => (
                <p key={`${section.heading}-p-${idx}`} className="text-sm leading-7 text-slate-700">
                  {renderWithSupportEmail(paragraph)}
                </p>
              ))}
              {section.bullets && (
                <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
                  {section.bullets.map((bullet, idx) => (
                    <li key={`${section.heading}-b-${idx}`}>{renderWithSupportEmail(bullet)}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
