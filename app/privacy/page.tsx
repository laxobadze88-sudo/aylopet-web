import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900">
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="font-serif text-3xl font-semibold text-[#1f3f16] sm:text-4xl">Privacy Policy</h1>
        <p className="mt-4 text-sm text-slate-600 sm:text-base">Coming soon.</p>
        <Link
          href="/"
          className="mt-8 rounded-lg bg-[#2d5a27] px-5 py-2 text-sm font-semibold text-white no-underline hover:bg-[#3a6b33]"
        >
          Back to Home
        </Link>
      </main>
    </div>
  );
}
