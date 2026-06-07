'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type Props = {
  /** Stable id for a11y (e.g. kibble-production) */
  sectionId: string;
  title: string;
  children: React.ReactNode;
  /** პირველი სექცია ნაგულისხმევად გახსნილი */
  defaultOpen?: boolean;
};

export function KnowledgeArticleFold({ sectionId, title, children, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `article-fold-panel-${sectionId}`;
  const triggerId = `article-fold-trigger-${sectionId}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#cfe2c7]/90 bg-gradient-to-b from-white to-[#f9faf7] shadow-sm shadow-slate-200/40">
      <button
        type="button"
        id={triggerId}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-[#f3f7ef]/80 sm:gap-4 sm:px-6 sm:py-4"
      >
        <span className="min-w-0 flex-1 text-base font-semibold leading-snug tracking-tight text-[#162616] sm:text-[17px] sm:leading-snug">
          {title}
        </span>
        <ChevronDown
          className={`mt-0.5 h-5 w-5 shrink-0 text-[#2d4f1e] transition-transform duration-200 ease-out ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={triggerId}
          className="border-t border-slate-100/95"
        >
          <div className="space-y-5 px-4 pb-5 pt-4 sm:px-6 sm:pb-6">{children}</div>
        </div>
      ) : null}
    </div>
  );
}
