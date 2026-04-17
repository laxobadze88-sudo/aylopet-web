'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Lang = 'GE' | 'EN';
const LANG_KEY = 'aylopet-lang';

const copy = {
  GE: {
    navLogin: 'შესვლა',
    title: 'მიტანის ზონები',
    subtitle: 'ამ ეტაპზე მიტანის სერვისი ვრცელდება მხოლოდ ქვემოთ ჩამოთვლილ ქალაქებში.',
    availableNow: 'ამჟამად ხელმისაწვდომია',
    cities: ['თბილისი', 'ქუთაისი', 'ბათუმი'],
    requestTitle: 'სად ისურვებდით მიტანის სერვისის დამატებას?',
    requestHint: 'ქალაქი მოგვწერეთ და მოთხოვნებს დავაგროვებთ, რათა გაფართოების პრიორიტეტები სწორად დავგეგმოთ.',
    cityLabel: 'სასურველი ქალაქი',
    nameLabel: 'თქვენი სახელი (არასავალდებულო)',
    emailLabel: 'ელ.ფოსტა (არასავალდებულო)',
    noteLabel: 'კომენტარი (არასავალდებულო)',
    submit: 'მოთხოვნის გაგზავნა',
    success: 'მადლობა! თქვენი მოთხოვნა შენახულია.',
    error: 'ვერ შევინახეთ მოთხოვნა. სცადეთ თავიდან.',
    requiredCity: 'გთხოვთ ქალაქი შეიყვანოთ.',
    cityPlaceholder: 'მაგ.: რუსთავი',
    namePlaceholder: 'მაგ.: ნიკა',
    emailPlaceholder: 'you@example.com',
    notePlaceholder: 'მაგ.: მოთხოვნა ამ რაიონზეც გვექნება.',
  },
  EN: {
    navLogin: 'Login',
    title: 'Delivery Zones',
    subtitle: 'At this stage, delivery service is available only in the cities listed below.',
    availableNow: 'Currently Available',
    cities: ['Tbilisi', 'Kutaisi', 'Batumi'],
    requestTitle: 'Where would you like delivery service to be added?',
    requestHint: 'Share your city and we will aggregate requests to prioritize expansion.',
    cityLabel: 'Requested City',
    nameLabel: 'Your Name (optional)',
    emailLabel: 'Email (optional)',
    noteLabel: 'Comment (optional)',
    submit: 'Send Request',
    success: 'Thanks! Your request has been saved.',
    error: 'Could not save your request. Please try again.',
    requiredCity: 'Please enter a city.',
    cityPlaceholder: 'e.g. Rustavi',
    namePlaceholder: 'e.g. Nika',
    emailPlaceholder: 'you@example.com',
    notePlaceholder: 'e.g. We have demand in this area too.',
  },
} as const;

export default function DeliveryZonesPage() {
  const [lang, setLang] = useState<Lang>(() =>
    typeof window !== 'undefined' && localStorage.getItem(LANG_KEY) === 'EN' ? 'EN' : 'GE'
  );
  const [city, setCity] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setLang(localStorage.getItem(LANG_KEY) === 'EN' ? 'EN' : 'GE');
    window.addEventListener('aylopet-lang-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('aylopet-lang-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const t = useMemo(() => copy[lang], [lang]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNotice(null);
    const trimmedCity = city.trim();
    if (!trimmedCity) {
      setNotice(t.requiredCity);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        requested_city: trimmedCity,
        requester_name: name.trim() || null,
        requester_email: email.trim() || null,
        note: note.trim() || null,
        source: 'delivery-zones-page',
      };
      const { error } = await supabase.from('delivery_zone_requests').insert(payload);
      if (error) throw error;

      setCity('');
      setName('');
      setEmail('');
      setNote('');
      setNotice(t.success);
    } catch {
      setNotice(t.error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f8f2] text-[#1f3320]">
      <header className="sticky top-0 z-40 border-b border-slate-100/80 bg-white/90 px-4 py-2.5 shadow-sm backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 text-slate-900 no-underline">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-[#2D4F1E] to-[#8A9A5B] text-xs font-bold text-white">A</span>
            <span className="text-sm font-semibold">Aylopet</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const next = lang === 'GE' ? 'EN' : 'GE';
                localStorage.setItem(LANG_KEY, next);
                setLang(next);
                window.dispatchEvent(new CustomEvent('aylopet-lang-change'));
              }}
              className="rounded-md bg-[#eef2e7] px-2.5 py-1.5 text-[11px] font-semibold text-slate-800 transition hover:bg-[#e2e8d8]"
            >
              {lang === 'GE' ? 'EN' : 'GE'}
            </button>
            <Link href="/" className="rounded-md bg-[#2D4F1E] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#253f18]">
              {t.navLogin}
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-6 max-w-4xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#d9e6d4] sm:mt-8 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.title}</h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">{t.subtitle}</p>

        <section className="mt-6 rounded-2xl bg-[#f7fbf5] p-5 ring-1 ring-[#dce9d7]">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#2d5a27]">{t.availableNow}</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {t.cities.map((item) => (
              <div key={item} className="rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-[#2d5a27] ring-1 ring-[#dce9d7]">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-[#fcfdfb] p-5 ring-1 ring-[#e3ecdf]">
          <h2 className="text-lg font-semibold text-[#223923]">{t.requestTitle}</h2>
          <p className="mt-1 text-sm text-slate-600">{t.requestHint}</p>

          <form className="mt-4 space-y-3" onSubmit={onSubmit}>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">{t.cityLabel}</span>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t.cityPlaceholder}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#2d5a27]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">{t.nameLabel}</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePlaceholder}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#2d5a27]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">{t.emailLabel}</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#2d5a27]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">{t.noteLabel}</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t.notePlaceholder}
                rows={4}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#2d5a27]"
              />
            </label>

            <div className="pt-1">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-xl bg-[#2d5a27] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#244a20] disabled:opacity-60"
              >
                {t.submit}
              </button>
            </div>
          </form>

          {notice && <p className="mt-3 text-sm text-slate-700">{notice}</p>}
        </section>
      </div>
    </main>
  );
}
