'use client';

import { useEffect, useState } from 'react';
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

const t: Record<Lang, { title: string; home: string; updatedAt: string; comingSoon: string }> = {
  GE: {
    title: 'კონფიდენციალურობის პოლიტიკა',
    home: 'მთავარი',
    updatedAt: 'ბოლოს განახლდა: 2026 წლის 27 თებერვალი',
    comingSoon: 'English version coming soon.',
  },
  EN: {
    title: 'Privacy Policy',
    home: 'Home',
    updatedAt: 'Last updated: February 27, 2026',
    comingSoon: 'Coming soon.',
  },
};

const enSections: Array<{ heading: string; body: string[]; bullets?: string[] }> = [
  {
    heading: 'Introduction',
    body: [
      'This Privacy Notice for Aylopet LLC ("we," "us," or "our"), describes how and why we might access, collect, store, use, and/or share ("process") your personal information when you use our services ("Services").',
      'Questions or concerns? Reading this Privacy Notice will help you understand your privacy rights and choices. If you do not agree with our policies and practices, please do not use our Services. For questions, contact support@aylopet.com.',
    ],
    bullets: [
      'Visit our website at aylopet.com or any website of ours that links to this Privacy Notice.',
      'Use Personalized Fresh Dog Food Subscriptions & Retail, AI Nutrition Architect, Smart GPS Tracking Hardware, Health Reminders & Partner Loyalty Program.',
      'Engage with us in other related ways, including any marketing or events.',
    ],
  },
  {
    heading: 'Aylopet Ecosystem',
    body: ['Aylopet provides an integrated ecosystem for pet wellness, offering:'],
    bullets: [
      'Nutrition: Sales and recurring subscriptions of pasteurized raw dog food with various specialized formulas.',
      'Hardware & Tech: A smart GPS collar that tracks location and physical activity (distance traveled) to calculate precise caloric needs via our AI-driven nutrition engine.',
      'AI Services: An interactive AI Nutrition Architect for nutritional guidance and automated health reminders (vaccinations, deworming).',
      'Retail & Partners: Direct retail sales and a loyalty network offering third-party partner discounts.',
      'Data Integration: We sync physical activity data from our hardware to customize food portions and health insights.',
    ],
  },
  {
    heading: 'Summary of Key Points',
    body: [
      'What personal information do we process? We may process personal information depending on how you interact with us, what choices you make, and which products/features you use.',
      'Do we process sensitive personal information? We may process sensitive personal information when necessary with your consent or as otherwise permitted by applicable law.',
      'Do we collect from third parties? We do not collect information from third parties, except certain profile information when you register/login with social media.',
      'How do we process information? To provide, improve, and administer Services, communicate with you, ensure security/fraud prevention, and comply with law, or with your consent for other purposes.',
      'When do we share information? In specific situations and with specific categories of third parties.',
      'How do we keep data safe? We maintain organizational and technical safeguards.',
    ],
  },
  {
    heading: 'What Are Your Rights?',
    body: ['In accordance with applicable laws of Georgia, you have the right:'],
    bullets: [
      'to obtain information regarding data types, processing means, and duration;',
      'to request correction, update, or completion of inaccurate/incomplete data;',
      'to request cessation of processing, erasure, or destruction of your personal data, including profiling;',
      'to request blocking of your personal data;',
      'to withdraw consent at any time without explanation.',
      'You may also review/update your account by logging into your account settings.',
      'To exercise your rights, send a formal request to support@aylopet.com.',
    ],
  },
  {
    heading: 'Why Do We Process Your Personal Data?',
    body: [],
    bullets: [
      'To deliver targeted advertising and personalized content.',
      'To protect our Services, including fraud monitoring and prevention.',
      'To evaluate and improve Services, products, marketing, and user experience.',
      'To identify usage trends.',
      'To comply with legal obligations and defend legal rights.',
      'Pet Health Monitoring and AI Nutrition Recommendations via your device/pet data.',
    ],
  },
  {
    heading: 'How Do We Handle Your Social Logins?',
    body: [
      'If you choose social login (such as Facebook or X), we may receive profile information from that provider (for example name, email, friends list, profile image, and public profile data).',
      'We use that information only for purposes described in this notice or made clear on the Services. We do not control third-party social platform privacy practices; review their privacy notices for details.',
    ],
  },
  {
    heading: 'How Long Do We Keep Your Information?',
    body: [
      'We keep your information only as long as necessary for the purposes in this Privacy Notice, unless a longer period is required or permitted by law (e.g., tax, accounting, legal requirements).',
      'No purpose requires retention longer than the period you maintain an account with us. When there is no ongoing legitimate business need, we delete or anonymize information, or securely isolate it in backup archives until deletion is possible.',
    ],
  },
  {
    heading: 'Do We Collect Information From Minors?',
    body: [
      'We do not knowingly collect, solicit, or market to children under 18, nor knowingly sell such personal information.',
      'By using the Services, you represent you are at least 18 (or parent/guardian consent applies). If we learn data from minors under 18 was collected, we deactivate the account and promptly delete data from records.',
      'If you become aware of such data, contact support@aylopet.com.',
    ],
  },
  {
    heading: 'Contact',
    body: ['If you have questions or comments about your privacy rights, email support@aylopet.com.'],
  },
];

const geSections: Array<{ heading: string; body: string[]; bullets?: string[] }> = [
  {
    heading: 'შესავალი',
    body: [
      'ეს კონფიდენციალურობის შეტყობინება შპს Aylopet-ისთვის აღწერს როგორ და რატომ შეიძლება მივიღოთ წვდომა, შევაგროვოთ, შევინახოთ, გამოვიყენოთ და/ან გავაზიაროთ თქვენი პერსონალური ინფორმაცია, როდესაც იყენებთ ჩვენს სერვისებს.',
      'დაგვიკავშირდებით: support@aylopet.com ან ფოსტით — დავით აღმაშენებლის გამზირი, ნომერი 200, სამტრედია, საქართველო.',
      'თუ არ ეთანხმებით ჩვენს პოლიტიკას და პრაქტიკას, გთხოვთ, არ გამოიყენოთ ჩვენი სერვისები.',
    ],
    bullets: [
      'ეწვევით ვებსაიტს aylopet.com ან სხვა გვერდებს, რომლებიც ბმულდება ამ შეტყობინებაზე.',
      'იყენებთ პერსონალიზებულ ახალი ძაღლის საკვების გამოწერებსა და საცალო ვაჭრობას, AI კვების არქიტექტორს, ჭკვიან GPS აპარატურას, ჯანმრთელობის შეხსენებებსა და პარტნიორთა ლოიალობის პროგრამას.',
      'დაგვიკავშირდებით სხვა შესაბამისი გზებით, მათ შორის მარკეტინგისა და ღონისძიებების ფარგლებში.',
    ],
  },
  {
    heading: 'Aylopet-ის ეკოსისტემა',
    body: ['Aylopet უზრუნველყოფს ცხოველთა კეთილდღეობის ინტეგრირებულ ეკოსისტემას, რომელიც მოიცავს:'],
    bullets: [
      'კვება: პასტერიზებული უმი ძაღლის საკვების საცალო გაყიდვები და განმეორებადი გამოწერები.',
      'აპარატურა და ტექნოლოგია: ჭკვიანი GPS საყელო, მდებარეობისა და ფიზიკური აქტივობის მონიტორინგით.',
      'AI სერვისები: ინტერაქტიული AI კვების არქიტექტორი და ჯანმრთელობის შეხსენებები.',
      'საცალო ვაჭრობა და პარტნიორები: ფასდაკლებები მესამე მხარის პარტნიორებთან.',
      'მონაცემთა ინტეგრაცია: ფიზიკური აქტივობის მონაცემების სინქრონიზაცია პორციებისა და ინსაითების მოსარგებად.',
    ],
  },
  {
    heading: 'ძირითადი პუნქტების რეზიუმე',
    body: [
      'ჩვენ შეიძლება დავამუშაოთ პერსონალური ინფორმაცია იმის მიხედვით, თუ როგორ ურთიერთობთ ჩვენთან და სერვისებთან, რა არჩევანს აკეთებთ და რა პროდუქტებს/ფუნქციებს იყენებთ.',
      'ჩვენ შეიძლება დავამუშაოთ მგრძნობიარე პერსონალური ინფორმაცია მხოლოდ თანხმობით ან მოქმედი კანონმდებლობით ნებადართულ ფარგლებში.',
      'მესამე მხარეებისგან პირდაპირ მონაცემებს არ ვაგროვებთ, გარდა სოციალური შესვლისას მიღებული პროფილის ინფორმაციისა.',
      'ინფორმაციას ვამუშავებთ სერვისების მიწოდების, გაუმჯობესების, უსაფრთხოების, თაღლითობის პრევენციისა და კანონის დაცვის მიზნით.',
      'ინფორმაცია შეიძლება გაზიარდეს მხოლოდ განსაზღვრულ სიტუაციებში და შესაბამის კატეგორიის მესამე მხარეებთან.',
      'თქვენი ინფორმაციის დასაცავად გვაქვს ორგანიზაციული და ტექნიკური ზომები.',
    ],
  },
  {
    heading: 'თქვენი უფლებები',
    body: ['საქართველოს მოქმედი კანონმდებლობის შესაბამისად, თქვენ გაქვთ უფლება:'],
    bullets: [
      'მიიღოთ ინფორმაცია მონაცემთა ტიპებზე, დამუშავების საშუალებებსა და ხანგრძლივობაზე.',
      'მოითხოვოთ არაზუსტი/არასწორი/არასრული მონაცემების გასწორება, განახლება ან შევსება.',
      'მოითხოვოთ დამუშავების შეწყვეტა, წაშლა ან განადგურება, პროფაილინგის ჩათვლით.',
      'მოითხოვოთ მონაცემთა დაბლოკვა.',
      'ნებისმიერ დროს გაიხმოთ თანხმობა განმარტების გარეშე.',
    ],
  },
  {
    heading: 'რატომ ვამუშავებთ თქვენს პერსონალურ მონაცემებს',
    body: [],
    bullets: [
      'მიზნობრივი რეკლამისთვის და პერსონალიზებული კონტენტის საჩვენებლად.',
      'სერვისების დაცვა, უსაფრთხოება, თაღლითობის მონიტორინგი და პრევენცია.',
      'სერვისების/პროდუქტების/მარკეტინგის შეფასება და გაუმჯობესება.',
      'გამოყენების ტენდენციების იდენტიფიცირება.',
      'სამართლებრივი ვალდებულებების შესრულება და უფლებების დაცვა.',
      'შინაური ცხოველების ჯანმრთელობის მონიტორინგი და AI კვების რეკომენდაციები.',
    ],
  },
  {
    heading: 'სოციალური შესვლები',
    body: [
      'თუ ირჩევთ რეგისტრაციას ან შესვლას სოციალური მედიის ანგარიშით, შეიძლება მივიღოთ გარკვეული პროფილის ინფორმაცია (მაგ. სახელი, ელფოსტა, პროფილის სურათი და სხვა).',
      'ამ ინფორმაციას ვიყენებთ მხოლოდ ამ კონფიდენციალურობის შეტყობინებაში აღწერილი მიზნებისთვის. მესამე მხარის პლატფორმების მიერ თქვენი ინფორმაციის გამოყენებას ჩვენ არ ვაკონტროლებთ.',
    ],
  },
  {
    heading: 'რამდენ ხანს ვინახავთ ინფორმაციას',
    body: [
      'ინფორმაციას ვინახავთ იმდენ ხანს, რამდენიც აუცილებელია ამ შეტყობინებაში განსაზღვრული მიზნებისთვის, თუ კანონით არ მოითხოვება/ნებადართულია უფრო ხანგრძლივი ვადა.',
      'როდესაც აღარ არსებობს მონაცემთა დამუშავების მიმდინარე ლეგიტიმური ბიზნეს საჭიროება, ინფორმაცია იშლება ან ანონიმური ხდება.',
      'თუ წაშლა შეუძლებელია (მაგალითად, სარეზერვო არქივებში), ინფორმაცია უსაფრთხოდ ინახება და იზოლირდება შემდგომი დამუშავებისგან, სანამ წაშლა შესაძლებელი გახდება.',
    ],
  },
  {
    heading: 'არასრულწლოვნები',
    body: [
      'ჩვენ შეგნებულად არ ვაგროვებთ მონაცემებს და არ ვახორციელებთ მარკეტინგს 18 წლამდე პირებზე.',
      'თუ აღმოვაჩენთ, რომ 18 წლამდე პირის მონაცემი შეგროვდა, ანგარიშს გავაუქმებთ და მონაცემებს წავშლით გონივრულ ვადაში.',
    ],
  },
  {
    heading: 'დაგვიკავშირდით',
    body: [
      'კონფიდენციალურობასთან დაკავშირებული კითხვებისთვის ან უფლებების გამოსაყენებლად დაგვიკავშირდით: support@aylopet.com.',
    ],
  },
];

export default function PrivacyPage() {
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2d5a27] text-sm font-bold text-white">A</div>
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

        {lang === 'GE' ? (
          <div className="space-y-8">
            {geSections.map((section) => (
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
        ) : (
          <div className="space-y-8">
            {enSections.map((section) => (
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
        )}
      </main>
    </div>
  );
}
