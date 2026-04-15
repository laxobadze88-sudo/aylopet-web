'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import dictEn from '@/lib/i18n/en.json';
import dictGe from '@/lib/i18n/ge.json';

type Lang = 'GE' | 'EN';
const LANG_KEY = 'aylopet-lang';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('GE');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const authCopy = (lang === 'GE' ? dictGe : dictEn).auth;

  const localizeAuthError = (err: unknown): string => {
    if (!(err instanceof Error)) return authCopy.genericError;
    const msg = err.message.toLowerCase();
    if (msg.includes('invalid login credentials')) return authCopy.invalidLoginCredentials;
    if (msg.includes('email not confirmed')) return authCopy.emailNotConfirmed;
    if (msg.includes('too many requests') || msg.includes('rate limit')) return authCopy.rateLimitExceeded;
    return err.message;
  };

  useEffect(() => {
    const stored = localStorage.getItem(LANG_KEY);
    setLang(stored === 'EN' ? 'EN' : 'GE');
    const onLang = () => {
      const next = localStorage.getItem(LANG_KEY);
      setLang(next === 'EN' ? 'EN' : 'GE');
    };
    window.addEventListener('aylopet-lang-change', onLang);
    return () => window.removeEventListener('aylopet-lang-change', onLang);
  }, []);

  useEffect(() => {
    const bootstrapRecoverySession = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const type = searchParams.get('type') ?? hashParams.get('type');

      if (type !== 'recovery') return;

      const tokenHash = searchParams.get('token_hash');
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (tokenHash) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          type: 'recovery',
          token_hash: tokenHash,
        });
        if (verifyError) {
          setError(localizeAuthError(verifyError));
          return;
        }
      } else if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) {
          setError(localizeAuthError(sessionError));
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError(authCopy.resetLinkFailed);
      }
    };

    bootstrapRecoverySession().catch(() => setError(authCopy.resetLinkFailed));
  }, [authCopy.resetLinkFailed]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (password.length < 6) {
      setError(authCopy.passwordMinLength);
      return;
    }
    if (password !== confirmPassword) {
      setError(authCopy.passwordsMismatch);
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setNotice(authCopy.passwordUpdated);
      setTimeout(() => router.push('/'), 900);
    } catch (err: unknown) {
      setError(localizeAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f6f8f3] via-white to-[#eef2e7] px-4 py-16">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-[#dbe6d4] bg-white p-6 shadow-[0_20px_60px_-45px_rgba(45,79,30,0.45)] sm:p-8">
        <h1 className="text-2xl font-serif font-semibold tracking-tight text-[#2D4F1E]">
          {authCopy.resetPageTitle}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {authCopy.resetPageSubtitle}
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={authCopy.newPasswordPlaceholder}
            minLength={6}
            required
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-[#2D4F1E] focus:outline-none"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={authCopy.confirmPasswordPlaceholder}
            minLength={6}
            required
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-[#2D4F1E] focus:outline-none"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}
          {notice && <p className="text-sm text-emerald-700">{notice}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#2D4F1E] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#253f18] disabled:opacity-60"
          >
            {loading ? '...' : authCopy.saveNewPassword}
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link href="/" className="text-xs font-medium text-[#2D4F1E] underline underline-offset-2">
            {authCopy.backToHome}
          </Link>
        </div>
      </div>
    </main>
  );
}
