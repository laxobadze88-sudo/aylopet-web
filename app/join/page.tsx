'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const STORAGE_KEY = 'aylopet-ref-code';

function JoinRedirectInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const raw = searchParams.get('ref');
    if (raw && typeof window !== 'undefined') {
      const trimmed = raw.trim();
      if (trimmed.length > 0) {
        sessionStorage.setItem(STORAGE_KEY, trimmed);
      }
    }
    router.replace('/welcome');
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8f3] text-[#2D3A2D]">
      <p className="text-sm font-medium">Redirecting…</p>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f6f8f3] text-[#2D3A2D]">
          <p className="text-sm font-medium">Loading…</p>
        </div>
      }
    >
      <JoinRedirectInner />
    </Suspense>
  );
}
