'use client';

import { useEffect } from 'react';

const LANG_KEY = 'aylopet-lang';

function syncLang() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const stored = localStorage.getItem(LANG_KEY);
  const lang = stored === 'EN' ? 'EN' : 'GE';
  document.documentElement.setAttribute('data-lang', lang);
}

export function LangSync() {
  useEffect(() => {
    syncLang();
    window.addEventListener('storage', syncLang);
    window.addEventListener('aylopet-lang-change', syncLang);
    return () => {
      window.removeEventListener('storage', syncLang);
      window.removeEventListener('aylopet-lang-change', syncLang);
    };
  }, []);
  return null;
}
