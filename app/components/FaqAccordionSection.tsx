'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import homeFaqContent from '../home-faq-content.json';

type Lang = 'GE' | 'EN';

type Props = {
  lang: Lang;
  heading: string;
  /** When true, wraps in <section id="faq"> for in-page anchors */
  anchorId?: boolean;
};

export function FaqAccordionSection({ lang, heading, anchorId }: Props) {
  const [faqOpenKey, setFaqOpenKey] = useState<string | null>(null);
  const faqCategories = lang === 'GE' ? homeFaqContent.GE : homeFaqContent.EN;
  const faqIntro = lang === 'GE' ? homeFaqContent.intro.GE : homeFaqContent.intro.EN;

  useEffect(() => {
    setFaqOpenKey(null);
  }, [lang]);

  const inner = (
    <div className="mx-auto max-w-6xl">
      <div className="mb-10 text-center lg:text-left">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#2d5a27]">{heading}</h2>
        <p className="mt-2 text-sm text-slate-600 max-w-2xl mx-auto lg:mx-0">{faqIntro}</p>
      </div>
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">
        <nav
          aria-label="FAQ categories"
          className="lg:w-56 shrink-0 lg:sticky lg:top-24 lg:self-start flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 -mx-1 px-1 lg:mx-0 lg:px-0"
        >
          {faqCategories.map((cat) => (
            <a
              key={cat.id}
              href={`#faq-${cat.id}`}
              className="whitespace-nowrap rounded-full border border-slate-200/90 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:border-[#2d5a27]/40 hover:text-[#2d5a27] transition lg:rounded-xl lg:text-left"
            >
              {cat.title}
            </a>
          ))}
        </nav>
        <div className="flex-1 min-w-0 space-y-12">
          {faqCategories.map((cat) => (
            <div key={cat.id} id={`faq-${cat.id}`} className="scroll-mt-28">
              <h3 className="font-serif text-xl font-semibold text-[#2d5a27] mb-4 border-b border-[#2d5a27]/15 pb-2">
                {cat.title}
              </h3>
              <div className="space-y-2">
                {cat.questions.map((item, i) => {
                  const key = `${cat.id}-${i}`;
                  const open = faqOpenKey === key;
                  return (
                    <div
                      key={key}
                      className="rounded-2xl border border-slate-200/90 bg-white shadow-sm shadow-slate-200/40 overflow-hidden"
                    >
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-slate-900 hover:bg-[#f6f8f3]/80 transition"
                        onClick={() => setFaqOpenKey(open ? null : key)}
                        aria-expanded={open}
                      >
                        <span>{item.q}</span>
                        <ChevronDown
                          className={`h-5 w-5 shrink-0 text-[#2d5a27] transition-transform ${open ? 'rotate-180' : ''}`}
                          aria-hidden
                        />
                      </button>
                      {open && (
                        <div className="border-t border-slate-100 px-5 pb-4">
                          <p className="pt-3 text-sm leading-relaxed text-slate-600 whitespace-pre-line">{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (anchorId) {
    return (
      <section id="faq" className="py-16 px-4 bg-[#FAF9F6] border-t border-slate-200/80">
        {inner}
      </section>
    );
  }

  return <div className="py-8 px-4 bg-[#FAF9F6]">{inner}</div>;
}
