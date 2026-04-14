'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

type Lang = 'GE' | 'EN';
const LANG_KEY = 'aylopet-lang';

const translations: Record<
  Lang,
  {
    sectionTitle: string;
    intro: string;
    missionTitle: string;
    mission: string;
    visionTitle: string;
    visionText: string;
    valuesTitle: string;
    valuePersonalizationTitle: string;
    valuePersonalizationBody: string;
    valueTransparencyTitle: string;
    valueTransparencyBody: string;
    valueCommitmentTitle: string;
    valueCommitmentBody: string;
    visionImageAlt: string;
    storyTitle: string;
    story: string;
    productionTitle: string;
    productionIntro: string;
    pasteurizationTitle: string;
    pasteurizationBody: string;
    home: string;
  }
> = {
  GE: {
    sectionTitle: 'ჩვენს შესახებ',
    intro: 'Aylopet არის საიტი, რომელიც ერთწუთიანი გასაუბრების შედეგად გთავაზობთ თქვენი ძაღლისთვის AylopetAI-ისა და საერთაშორისო დონის ნუტრიციოლოგების მიერ შედგენილ პერსონალიზებულ კვების გეგმას.',
    missionTitle: 'ჩვენი მისია',
    mission:
      'Aylopet-ის მისია მარტივია: ვაჩუქოთ ჩვენ ოთხფეხა ოჯახის წევრებს მეტი ჯანსაღი და ბედნიერი წელი AI ნუტრიციისა და ადამიანისთვის განკუთვნილი საკვები ინგრედიენტების სინთეზის საშუალებით.',
    visionTitle: 'კომპანიის ხედვა',
    visionText:
      'ჩვენი ხედვაა დავამკვიდროთ ცხოველებზე ზრუნვის ახალი, უმაღლესი სტანდარტი, სადაც მოწინავე ტექნოლოგიები და ბიოლოგიურად სრულფასოვანი კვება სრულ ჰარმონიაშია. ჩვენ მივისწრაფვით შევქმნათ მომავალი, სადაც ოთხფეხა ოჯახის წევრები იღებენ მათზე მორგებულ, პერსონალიზებულ სიცოცხლის ენერგიას, რაც მათ საშუალებას მისცემს მაქსიმალურად გამოიყენონ საკუთარი გენეტიკური პოტენციალი და გაატარონ უფრო მეტი, ხარისხიანი და ჯანსაღი წელი ჩვენს გვერდით. ჩვენი მიზანია, უმაღლესი ნუტრიციული მეცნიერება ვაქციოთ რეალობად მათთვის, ვისთვისაც კომპრომისი ხარისხში არ არსებობს.',
    valuesTitle: 'ჩვენი ძირითადი ღირებულებები',
    valuePersonalizationTitle: 'პერსონალიზაცია',
    valuePersonalizationBody: 'ყოველი ძაღლი ინდივიდია და მისი რაციონიც ასეთივე უნიკალური უნდა იყოს.',
    valueTransparencyTitle: 'მეცნიერული გამჭვირვალობა',
    valueTransparencyBody: 'ჩვენ ვენდობით მხოლოდ დადასტურებულ მონაცემებს და არა ვარაუდებს.',
    valueCommitmentTitle: 'უპირობო ერთგულება',
    valueCommitmentBody: 'ჩვენ ვქმნით მათთვის, ვინც ჩვენი ოჯახის სრულუფლებიანი წევრია.',
    visionImageAlt: 'ჯანმრთელი და დიდებული ძაღლი',
    storyTitle: 'ჩვენი ისტორია',
    story:
      'Aylopet-ის იდეა ჩაისახა ჩემი პეკინესის, კოკოს ოჯახში შემოსვლიდან მალევე, ხოლო კანე კორსოს, დანტეს მოყვანით ფრთები შეისხა. ვისაც პეკინესი გყავთ ან სხვა პატარა ჯიშებს იცნობს, იცის, რომ მათი კვება ნამდვილი გამოწვევაა. ყოველდღე ვუყურებდი კოკოს ბრძოლას: მშრალი საკვების რთული მონელება, მუდმივი დისკომფორტი და ალერგია ჩვენი ყოველდღიურობის ნაწილი იყო. მიუხედავად მსგავსი, ფართოდ გავრცელებული პრობლემებისა, ვერ ვიპოვე ნუტრიციოლოგი, რომელიც დაგვეხმარებოდა, კვების პერსონალიზაცია ხომ ჩვეულებრივი ვეტერინარიის მიღმა არსებული მეცნიერებაა. შედეგად, კოკოს ცხოვრება ამ კუთხით მუდმივი ბრძოლა აღმოჩნდა. მაშინ პატარა ვიყავი და ვერაფერი დავეხმარე, თუმცა კოკო ჩემს უდიდეს ინსპირაციად იქცა. წლების შემდეგ, როდესაც დანტე ავიყვანე, ეს ისტორია მსუბუქი სახით განმეორდა, მისი სიჯიუტიდან გამომდინარე ხშირად მიწევდა საკვების ცვლა რაც ნუტრიციოლოგების დახმარების გარეშე რთულია. მივხვდი, რომ გამოსავალი თავად უნდა შემექმნა. Aylopet ყველასთვის ხელმისაწვდომს ხდის პერსონალურ ნუტრიციოლოგიასა და უმაღლესი ხარისხის ჯანსაღ საკვებს.',
    productionTitle: 'წარმოების პროცესი და ხარისხი',
    productionIntro:
      'წარმოების პროცესს შეგიძლიათ გაეცნოთ ვიდეოში, ის არის გადაღებული ექსკლუზიურად ჩვენთვის პარტნიორი კომპანიის მიერ, ისრაელში, სახელად Natural Selection, რომელმაც შექმნა Aylopet-ისთვის მორგებული ექსკლუზიური რეცეპტები. Human-Grade (ადამიანის კვებისათვის ხარისხის) ინგრედიენტებით. ეს არის Grain-Free, Non-GMO ფორმულა, რომელიც შედგება მხოლოდ ხორცის პროდუქტებით, ხილით და ბოსტნეულით.',
    pasteurizationTitle:
      'როგორც ხედავთ თქვენი ოთხფეხა მეგობრის საკვები, მის ჯამამდე მარტივ პროცესებს გადის და რაც მთავარია ყველაფერი გამჭვირვალეა. პროცესი უმარტივესი ეტაპებისგან შედგება, ვარჩევთ უმაღლესი ხარისხის პროდუქტებს, ვასუფთავებთ, ვაქცევთ ფარშად, როგორც ვიდეოში ხედავთ, ვფუთავთ, შემდეგ შეგვაქვს პასტერიზაციის აპარატში, რის შემდეგ კი გადავდივართ ბოლო ეტაპზე გაყინვაზე. ალბათ გაგიჩნდათ შეკითხვა თუ რა არის პასტერიზაცია?',
    pasteurizationBody:
      'ეს არის დაბალი ტემპერატურის თერმული დამუშავების მეთოდი, რომლის დროსაც ხორცი 60-80°C-ზე ჩერდება პასტერიზაციის ღუმელში 1-6სთ. მისი მიზანია მავნე ბაქტერიების სრული განადგურება, განსაკუთრებით ისეთი პათოგენების, როგორებიცაა სალმონელა, ლისტერია, ე. კოლი. ეს პროცესი სრულად ანადგურებს მავნე ბაქტერიებს, თუმცა ინარჩუნებს ხორცის ყველა სასარგებლო თვისებას: ამინომჟავებს, ვიტამინებს, მინერალებსა და კოლაგენს. შედეგად ვიღებთ უსაფრთხო, ნოყიერ და წვნიან საკვებს.',
    home: 'მთავარი',
  },
  EN: {
    sectionTitle: 'About Us',
    intro:
      'Aylopet is a website that provides personalized nutrition plans for your dog, crafted by AylopetAI and world-class nutritionists based on a simple one-minute consultation.',
    missionTitle: 'Our Mission',
    mission:
      "Aylopet's mission is simple: to give our four-legged family members more healthy and happy years through the synthesis of AI nutrition and human-grade food ingredients.",
    visionTitle: 'Company Vision',
    visionText:
      "Our vision is to establish a new, highest standard of animal care where advanced technology and biologically complete nutrition exist in full harmony. We strive to build a future in which four-legged family members receive personalized life energy tailored to them, helping them unlock their genetic potential and spend more healthy, high-quality years by our side. Our goal is to turn world-class nutritional science into everyday reality for people who never compromise on quality.",
    valuesTitle: 'Core Values',
    valuePersonalizationTitle: 'Personalization',
    valuePersonalizationBody: 'Every dog is an individual, and its nutrition should be just as unique.',
    valueTransparencyTitle: 'Scientific Transparency',
    valueTransparencyBody: 'We rely only on verified evidence, not assumptions.',
    valueCommitmentTitle: 'Unconditional Commitment',
    valueCommitmentBody: 'We create for those who are full members of our family.',
    visionImageAlt: 'Healthy majestic dog portrait',
    storyTitle: 'Our Story',
    story:
      "The idea for Aylopet was born shortly after my Pekingese, Koko, joined our family, and it took flight when I brought home my Cane Corso, Dante. Anyone who owns a Pekingese or knows other small breeds knows that their nutrition is a real challenge. Every day, I watched Koko struggle: difficult digestion of dry food, constant discomfort, and allergies were part of our daily life. Despite these widespread issues, I couldn't find a nutritionist to help us; after all, nutritional personalization is a science that exists beyond general veterinary medicine. As a result, Koko's life in this regard was a constant struggle. I was young then and couldn't help with anything, but Koko became my greatest inspiration. Years later, when I got Dante, this story repeated itself in a milder form—due to his stubbornness, I often had to change his food, which is difficult without professional nutritional guidance. I realized I had to create the solution myself. This is how the idea for Aylopet was born—a platform that makes personalized nutrition and high-quality healthy food accessible to everyone.",
    productionTitle: 'Production Process & Quality',
    productionIntro:
      'You can view our production process in this video, filmed exclusively for us by our partner company in Israel, Natural Selection, which crafted personalized recipes for Aylopet. Using Human-Grade ingredients, this is a Grain-Free, Non-GMO formula consisting strictly of meat products, fruits, and vegetables.',
    pasteurizationTitle:
      "As you can see, your four-legged friend's food goes through simple processes before reaching their bowl, and most importantly, everything is transparent. The process consists of the simplest stages: we select the highest quality products, clean them, grind them into mince as you see in the video, package them, then place them in the pasteurization machine, followed by the final stage, freezing. You might ask, what is pasteurization?",
    pasteurizationBody:
      "This is a low-temperature thermal processing method where the meat stays in the pasteurization oven at 60-80°C for 1-6 hours. Its purpose is the complete destruction of harmful bacteria, especially pathogens such as Salmonella, Listeria, and E. coli. This process fully eliminates harmful bacteria while preserving all the beneficial properties of the meat: amino acids, vitamins, minerals, and collagen. As a result, we get safe, nutritious, and juicy food.",
    home: 'Home',
  },
};

function getStoredLang(): Lang {
  if (typeof window === 'undefined') return 'GE';
  const stored = localStorage.getItem(LANG_KEY);
  return stored === 'EN' || stored === 'GE' ? stored : 'GE';
}

function highlightStoryNames(text: string, lang: Lang): React.ReactNode {
  const geRegex = /(კოკოს|კოკო|დანტეს|დანტე)/g;
  const enRegex = /(Koko|Dante)/g;
  const regex = lang === 'GE' ? geRegex : enRegex;
  const parts = text.split(regex);
  return parts.map((part, i) => {
    const isName = lang === 'GE'
      ? /^(კოკოს|კოკო|დანტეს|დანტე)$/.test(part)
      : /^(Koko|Dante)$/.test(part);
    return isName ? (
      <span key={i} className="text-[#2d5a27] font-medium">
        {part}
      </span>
    ) : (
      part
    );
  });
}

export default function AboutPage() {
  const [lang, setLang] = useState<Lang>('GE');

  useEffect(() => {
    setLang(getStoredLang());
    const handleStorage = () => setLang(getStoredLang());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (hash === '#what-is') {
        document.getElementById('what-is')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (hash === '#our-story') {
        document.getElementById('our-story')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (hash === '#production') {
        document.getElementById('production')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (hash === '#vision') {
        document.getElementById('vision')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
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
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900">
      {/* Simple header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#D4E4D4] bg-white/90 backdrop-blur-sm px-4 py-3 shadow-sm">
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

      {/* Centered content - luxury minimalism */}
      <main className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-start px-6 py-20">
        <div className="mx-auto w-full max-w-2xl text-center">
          <h1 id="what-is" className="scroll-mt-24 font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#2d5a27] mb-12">
            {t.sectionTitle}
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-slate-700 mb-16">
            {t.intro}
          </p>
          <h2 className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#2d5a27] mb-6">
            {t.missionTitle}
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-slate-700 mb-16">
            {t.mission}
          </p>
          <section id="vision" className="scroll-mt-24 mb-20 rounded-3xl border border-[#d9e5d4] bg-[#fbfdf9] p-6 text-left shadow-[0_20px_60px_-50px_rgba(45,90,39,0.4)] sm:p-8">
            <div className="grid items-center gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#234820] sm:text-3xl">
                  {t.visionTitle}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-700 sm:text-lg">{t.visionText}</p>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-[#d5e2ce] bg-[#f3f8ee]">
                <img
                  src="https://images.unsplash.com/photo-1583512603806-077998240c7a?auto=format&fit=crop&w=1200&q=80"
                  alt={t.visionImageAlt}
                  className="h-full min-h-[240px] w-full object-cover"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1f3d1c]/25 via-transparent to-transparent" />
              </div>
            </div>

            <h3 className="mt-8 font-serif text-xl font-semibold text-[#2d5a27] sm:text-2xl">{t.valuesTitle}</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <article className="rounded-2xl border border-[#dce7d6] bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#2d5a27]/10">
                <h4 className="text-base font-semibold text-[#2d5a27] sm:text-lg">{t.valuePersonalizationTitle}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">{t.valuePersonalizationBody}</p>
              </article>
              <article className="rounded-2xl border border-[#dce7d6] bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#2d5a27]/10">
                <h4 className="text-base font-semibold text-[#2d5a27] sm:text-lg">{t.valueTransparencyTitle}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">{t.valueTransparencyBody}</p>
              </article>
              <article className="rounded-2xl border border-[#dce7d6] bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#2d5a27]/10">
                <h4 className="text-base font-semibold text-[#2d5a27] sm:text-lg">{t.valueCommitmentTitle}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">{t.valueCommitmentBody}</p>
              </article>
            </div>
          </section>
          <section id="our-story" className="scroll-mt-24 mb-16 rounded-3xl border border-[#d9e5d4] bg-gradient-to-b from-white to-[#f7fbf3] p-6 text-left shadow-[0_20px_60px_-50px_rgba(45,90,39,0.4)] sm:p-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#234820] mb-5">
              {t.storyTitle}
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-slate-700">
              {highlightStoryNames(t.story, lang)}
            </p>
          </section>

          <section id="production" className="scroll-mt-24 rounded-3xl border border-[#d9e5d4] bg-gradient-to-b from-[#fbfdf9] to-white p-6 text-left shadow-[0_20px_60px_-50px_rgba(45,90,39,0.4)] sm:p-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#234820] mb-5">
              {t.productionTitle}
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-slate-700 mb-7">
              {t.productionIntro}
            </p>
            <video
              controls
              preload="auto"
              className="w-full h-auto rounded-3xl border border-[#d5e2ce] shadow-xl mb-10"
            >
              <source src="/videos/production-process.mp4.MP4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="rounded-2xl border border-[#D4E4D4] bg-[#f6faf2] p-6 sm:p-8">
              <p className="text-base sm:text-lg leading-relaxed text-slate-700 mb-6">
                {t.pasteurizationTitle}
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-slate-700">
                {t.pasteurizationBody}
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
