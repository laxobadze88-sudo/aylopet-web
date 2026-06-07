'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

type Props = {
  children: ReactNode;
};

export function KnowledgeCenterSourcesPanel({ children }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = 'knowledge-center-sources-panel';

  return (
    <div className="lang-ge mt-12 scroll-mt-28 border-t border-slate-200/90 pt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <h3 className="text-lg font-semibold tracking-tight text-[#162616] sm:text-xl">
          გამოყენებული სამეცნიერო წყაროები და ლიტერატურა
        </h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#2d4f1e]/20 bg-white px-5 py-2.5 text-sm font-semibold text-[#21371e] shadow-sm transition hover:border-[#2d4f1e]/35 hover:bg-[#f6f8f3] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2d4f1e]/35 focus-visible:ring-offset-2 sm:py-2"
        >
          {open ? 'აკეცვა' : 'ჩამოშლა'}
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>
      </div>

      {open ? (
        <div id={panelId} className="mt-5">
          {children}
        </div>
      ) : null}
    </div>
  );
}
