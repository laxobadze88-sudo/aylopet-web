'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Camera, Loader2, PawPrint, Scale, Pencil, Save, X } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { supabase } from '@/lib/supabase';
import { MainLayout } from '@/app/components/MainLayout';
import { ReferralDashboard } from '@/app/components/referrals/ReferralDashboard';
import { appendWeightHistoryPoint, fetchWeightTimeline } from '@/lib/weight-monitoring';

type Lang = 'GE' | 'EN';
const LANG_KEY = 'aylopet-lang';

const copy: Record<Lang, Record<string, string>> = {
  GE: {
    "home": "მთავარი",
    "title": "ჩემი პროფილი",
    "loading": "იტვირთება…",
    "signInTitle": "საჭიროა შესვლა",
    "signInBody": "პროფილის სანახავად გთხოვთ შეხვიდეთ სისტემაში ან შეხმენით ანგარიში მთავარი გვერდიდან.",
    "goHome": "მთავარ გვერდზე",
    "email": "ელ-ფოსტა",
    "name": "სახელი",
    "promoTitle": "პრომო კოდი",
    "promoEmpty": "პრომო კოდი ჯერ არ გახვთ. დაასრულეთ AylopetAI ჩათი ან რეგისტრაცია ჩათიდან.",
    "chatCta": "AylopetAI ჩათი",
    "signOut": "გასვლა",
    "supabaseWarn": "Supabase არ არის კონფიგურირობული. შეამოწმოთ .env.local (NEXT_PUBLIC_SUPABASE_URL და NEXT_PUBLIC_SUPABASE_ANON_KEY).",
    "myDogs": "ჩემი ძაღლები",
    "noDogs": "ძაღლის მონაცემები ჯერ არ ჩანს. შეავსეთ AylopetAI ჩათი.",
    "photoHint": "ფოტოს ატვირთვა",
    "uploading": "იტვირთება...",
    "weightTitle": "წონის კონტროლი",
    "newWeight": "ახალი წონა (კგ)",
    "saveWeight": "შენახვა",
    "weightHistory": "წონის ისტორია",
    "latestWeight": "ბოლო წონა",
    "breed": "ჯიში",
    "age": "ასაკი",
    "goal": "მიზანი",
    "dashboardTitle": "მოვლის დაფა",
    "dashboardSubtitle": "ყველა მონაცემი ერთ სივრცეში",
    "dataSaved": "მონაცემები განახლდა",
    "dataSaveError": "შენახვა ვერ მოხერხდა",
    "sectionAccount": "ჩემი ანგარიში",
    "sectionDog": "ძაღლის პროფილი",
    "sectionReferral": "რეფერალები",
    "edit": "რედაქტირება",
    "cancel": "გაუქმება",
    "save": "შენახვა",
    "noChartData": "მონაცემები ჯერ არ არის",
    "healthMonitorTitle": "ვაქცინა / დამუშავების მონიტორინგი",
    "rabies": "ცოფის აცრა",
    "deworming": "ჭიაზე დამუშავება",
    "complex": "კომპლექსური აცრა",
    "lastDoneDate": "ბოლო გაკეთების თარიღი",
    "nextDueDate": "შემდეგი თარიღი",
    "notes": "შენიშვნა",
    "saveRecord": "ჩანაწერის შენახვა",
    "reminderRule": "რემაინდერი: აცრებზე 2 კვირით ადრე, ჭიაზე 1 კვირით ადრე",
    "reminderAt": "რემაინდერის თარიღი",
    "dueSoon": "მალე გასაკეთებელია",
    "enableReminders": "რემაინდერების ჩართვა"
  },
  EN: {
    "home": "Home",
    "title": "My profile",
    "loading": "Loading…",
    "signInTitle": "Sign in required",
    "signInBody": "Please sign in or create an account from the home page to view your profile.",
    "goHome": "Back to home",
    "email": "Email",
    "name": "Name",
    "promoTitle": "Promo code",
    "promoEmpty": "No promo code yet. Finish the AylopetAI chat or register from the chat flow.",
    "chatCta": "AylopetAI chat",
    "signOut": "Sign out",
    "supabaseWarn": "Supabase is not configured. Check .env.local for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    "myDogs": "My dogs",
    "noDogs": "No dog records yet. Complete the AylopetAI chat first.",
    "photoHint": "Upload photo",
    "uploading": "Uploading...",
    "weightTitle": "Weight control",
    "newWeight": "New weight (kg)",
    "saveWeight": "Save",
    "weightHistory": "Weight history",
    "latestWeight": "Latest weight",
    "breed": "Breed",
    "age": "Age",
    "goal": "Goal",
    "dashboardTitle": "Care dashboard",
    "dashboardSubtitle": "All dog data in one place",
    "dataSaved": "Data updated",
    "dataSaveError": "Could not save changes",
    "sectionAccount": "My account",
    "sectionDog": "Dog profile",
    "sectionReferral": "Referrals",
    "edit": "Edit",
    "cancel": "Cancel",
    "save": "Save",
    "noChartData": "No data yet",
    "healthMonitorTitle": "Vaccination & Treatment Monitoring",
    "rabies": "Rabies vaccine",
    "deworming": "Deworming",
    "complex": "Complex vaccine",
    "lastDoneDate": "Last done date",
    "nextDueDate": "Next due date",
    "notes": "Notes",
    "saveRecord": "Save record",
    "reminderRule": "Reminder: 2 weeks before vaccines, 1 week before deworming",
    "reminderAt": "Reminder date",
    "dueSoon": "Due soon",
    "enableReminders": "Enable reminders"
  },
};

function getLang(): Lang {
  if (typeof window === 'undefined') return 'GE';
  const s = localStorage.getItem(LANG_KEY);
  return s === 'EN' ? 'EN' : 'GE';
}

type DogRow = {
  id: string;
  name: string | null;
  breed: string | null;
  gender?: string | null;
  neutered?: string | null;
  age_years: number | null;
  age_months: number | null;
  goal: string | null;
  current_weight: number | null;
  target_weight?: number | null;
  activity_level?: string | null;
  body_condition?: string | null;
  appetite?: string | null;
  current_diet?: string | null;
  diet_brand?: string | null;
  health_issues?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
};

type WeightPoint = {
  timestamp: string;
  label: string;
  weight: number;
};

type SectionKey = 'account' | 'dog' | 'referral';
type DogFieldKey =
  | 'name'
  | 'breed'
  | 'age'
  | 'goal'
  | 'activity_level'
  | 'target_weight'
  | 'gender'
  | 'neutered'
  | 'current_diet'
  | 'diet_brand'
  | 'health_issues';
type MedicalRecordType = 'rabies' | 'deworming' | 'complex';
type MedicalRecordRow = {
  id: string;
  dog_id: string;
  record_type: MedicalRecordType;
  last_done_date: string | null;
  next_due_date: string | null;
  notes: string | null;
};

function statusAndPrice(lang: Lang, promoTier: string | null, promoCode: string | null) {
  const isGe = lang === 'GE';
  if (promoTier === 'honorary_ambassador') {
    return {
      status: isGe ? 'Honorary Ambassador' : 'Honorary Ambassador',
      price: isGe ? '40%-იანი ფასდაკლება (Honorary Ambassador_ის პირობები)' : '40% discount (Honorary Ambassador terms)',
    };
  }
  if (promoTier === 'early_bird') {
    return {
      status: isGe ? 'Early Bird' : 'Early Bird',
      price: isGe ? '20%-იანი ფასდაკლება' : '20% discount',
    };
  }
  if (promoCode) {
    return {
      status: isGe ? 'აქტიური წევრი' : 'Active member',
      price: isGe ? 'პერსონალური შეთავაზება აქტიურია' : 'Personal offer is active',
    };
  }
  return {
    status: isGe ? 'სტანდარტული' : 'Standard',
    price: isGe ? 'სტანდარტული ფასი' : 'Standard price',
  };
}

function fmtDogValue(value: string | number | null | undefined) {
  if (value == null || value === '') return '—';
  return String(value);
}

function getDogCurrentWeight(dog: DogRow | null): number | null {
  if (!dog) return null;
  const candidates = [dog.current_weight, dog.target_weight, dog['weight']];
  for (const candidate of candidates) {
    const n = Number(candidate);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

const SUPABASE_CONFIGURED = Boolean(
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '') && (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '')
);

function detectPhotoUrl(dog: DogRow | null): string | null {
  if (!dog) return null;
  const candidates = ['photo_url', 'image_url', 'avatar_url', 'dog_photo_url'];
  for (const key of candidates) {
    const value = dog[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return null;
}

function formatAge(lang: Lang, years: number | null, months: number | null): string {
  if (!years && !months) return '—';
  if (lang === 'GE') return `${years ?? 0} წ. ${months ?? 0} თვ.`;
  return `${years ?? 0}y ${months ?? 0}m`;
}

function mergeWeightPoints(a: WeightPoint[], b: WeightPoint[]): WeightPoint[] {
  const map = new Map<string, WeightPoint>();
  [...a, ...b].forEach((p) => {
    const key = `${p.timestamp}|${p.weight}`;
    map.set(key, p);
  });
  return Array.from(map.values()).sort(
    (x, y) => new Date(x.timestamp).getTime() - new Date(y.timestamp).getTime()
  );
}

function reminderLeadDays(type: MedicalRecordType): number {
  return type === 'deworming' ? 7 : 14;
}

function reminderDate(nextDueDate: string | null, type: MedicalRecordType): string | null {
  if (!nextDueDate) return null;
  const d = new Date(nextDueDate);
  if (Number.isNaN(d.getTime())) return null;
  d.setDate(d.getDate() - reminderLeadDays(type));
  return d.toISOString().slice(0, 10);
}

function isDueSoon(nextDueDate: string | null, type: MedicalRecordType): boolean {
  if (!nextDueDate) return false;
  const due = new Date(nextDueDate);
  if (Number.isNaN(due.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= reminderLeadDays(type);
}

function defaultNextDueFromLastDone(lastDoneDate: string | null, type: MedicalRecordType): string | null {
  if (!lastDoneDate) return null;
  const d = new Date(lastDoneDate);
  if (Number.isNaN(d.getTime())) return null;
  if (type === 'deworming') d.setMonth(d.getMonth() + 3);
  else d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

export default function ProfilePage() {
  const [lang, setLang] = useState<Lang>(getLang());
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [promoTier, setPromoTier] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [dogs, setDogs] = useState<DogRow[]>([]);
  const [activeDogId, setActiveDogId] = useState<string | null>(null);
  const [weightSeries, setWeightSeries] = useState<WeightPoint[]>([]);
  const [newWeight, setNewWeight] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [savingWeight, setSavingWeight] = useState(false);
  const [inlineNotice, setInlineNotice] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>('account');
  const [editingAccount, setEditingAccount] = useState(false);
  const [accountNameDraft, setAccountNameDraft] = useState('');
  const [editingDogField, setEditingDogField] = useState<DogFieldKey | null>(null);
  const [startWeightByDog, setStartWeightByDog] = useState<Record<string, number>>({});
  const [medicalRecords, setMedicalRecords] = useState<Record<MedicalRecordType, MedicalRecordRow>>({
    rabies: { id: '', dog_id: '', record_type: 'rabies', last_done_date: null, next_due_date: null, notes: null },
    deworming: { id: '', dog_id: '', record_type: 'deworming', last_done_date: null, next_due_date: null, notes: null },
    complex: { id: '', dog_id: '', record_type: 'complex', last_done_date: null, next_due_date: null, notes: null },
  });
  const [savingMedicalType, setSavingMedicalType] = useState<MedicalRecordType | null>(null);
  const [dogDraft, setDogDraft] = useState({
    name: '',
    breed: '',
    ageYears: '',
    ageMonths: '',
    goal: '',
    targetWeight: '',
    activityLevel: '',
    gender: '',
    neutered: '',
    currentDiet: '',
    dietBrand: '',
    healthIssues: '',
    appetite: '',
    bodyCondition: '',
  });

  const c = copy[lang];
  const activeDog = useMemo(
    () => dogs.find((dog) => dog.id === activeDogId) ?? (dogs[0] ?? null),
    [dogs, activeDogId]
  );
  const photoUrl = detectPhotoUrl(activeDog);
  const hasActiveProfile = Boolean(promoTier || promoCode || dogs.length > 0);
  const statusPrice = statusAndPrice(lang, promoTier, promoCode);
  const displayedTargetWeight =
    activeDog?.target_weight != null && activeDog?.current_weight != null && activeDog.target_weight === activeDog.current_weight
      ? null
      : activeDog?.target_weight ?? null;
  const chartData = useMemo(() => {
    if (!activeDog) return weightSeries;
    const baseline = startWeightByDog[activeDog.id] ?? (Number(activeDog.target_weight) > 0 ? Number(activeDog.target_weight) : null);
    if (!baseline || baseline <= 0) return weightSeries;
    if (weightSeries.length === 0) {
      return [{ timestamp: new Date().toISOString(), label: lang === 'GE' ? 'საწყისი' : 'Start', weight: baseline }];
    }
    const first = weightSeries[0];
    if (Math.abs(first.weight - baseline) < 0.0001) return weightSeries;
    const firstTs = new Date(first.timestamp).getTime();
    const baselineTs = Number.isFinite(firstTs) ? new Date(firstTs - 1000).toISOString() : new Date().toISOString();
    return [{ timestamp: baselineTs, label: lang === 'GE' ? 'საწყისი' : 'Start', weight: baseline }, ...weightSeries];
  }, [activeDog, startWeightByDog, weightSeries, lang]);

  useEffect(() => {
    const sync = () => setLang(getLang());
    window.addEventListener('aylopet-lang-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('aylopet-lang-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        setUserId(null);
        setReady(true);
        return;
      }
      setUserId(user.id);
      setEmail(user.email ?? null);

      const { data: prof } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
      if (!cancelled && prof && typeof prof === 'object' && 'full_name' in prof) {
        setFullName((prof as { full_name: string | null }).full_name ?? null);
      }

      try {
        const { data: promo } = await supabase
          .from('promo_codes')
          .select('user_tier, code')
          .eq('user_id', user.id)
          .maybeSingle();
        if (!cancelled && promo && typeof promo === 'object') {
          const p = promo as { user_tier?: string | null; code?: string | null };
          setPromoTier(p.user_tier ?? null);
          setPromoCode(p.code ?? null);
        }
      } catch {
        /* table or RLS */
      }

      try {
        const { data: dogsData } = await supabase
          .from('dogs')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: true });

        if (!cancelled) {
          const rows = (dogsData ?? []) as DogRow[];
          setDogs(rows);
          setStartWeightByDog((prev) => {
            const next = { ...prev };
            for (const row of rows) {
              const baselineCandidate =
                (row.target_weight != null && Number(row.target_weight) > 0 ? Number(row.target_weight) : null) ??
                (row.current_weight != null && Number(row.current_weight) > 0 ? Number(row.current_weight) : null) ??
                (row['weight'] != null && Number(row['weight']) > 0 ? Number(row['weight']) : null);
              if (next[row.id] == null && baselineCandidate != null) {
                next[row.id] = baselineCandidate;
              }
            }
            return next;
          });
          if (rows.length > 0) setActiveDogId(rows[0].id);
        }
      } catch {
        /* optional */
      }

      if (!cancelled) setReady(true);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      if (cancelled) return;
      const u = session?.user;
      if (!u) {
        setUserId(null);
        setEmail(null);
        setFullName(null);
        setPromoTier(null);
        setPromoCode(null);
        setDogs([]);
        setActiveDogId(null);
        setWeightSeries([]);
        return;
      }
      setUserId(u.id);
      setEmail(u.email ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserId(null);
    setEmail(null);
    setFullName(null);
    setPromoTier(null);
    setPromoCode(null);
    setDogs([]);
    setActiveDogId(null);
    setWeightSeries([]);
    setMedicalRecords({
      rabies: { id: '', dog_id: '', record_type: 'rabies', last_done_date: null, next_due_date: null, notes: null },
      deworming: { id: '', dog_id: '', record_type: 'deworming', last_done_date: null, next_due_date: null, notes: null },
      complex: { id: '', dog_id: '', record_type: 'complex', last_done_date: null, next_due_date: null, notes: null },
    });
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!activeDogId) {
        setWeightSeries([]);
        return;
      }
      try {
        const points = await fetchWeightTimeline(activeDogId);
        if (cancelled) return;
        const dbPoints = points.map((p) => ({
          timestamp: p.timestamp,
          label: new Date(p.timestamp).toLocaleDateString(lang === 'GE' ? 'ka-GE' : 'en-US', {
            month: 'short',
            day: 'numeric',
          }),
          weight: p.weight,
        }));
        setWeightSeries(dbPoints);
      } catch {
        if (!cancelled) setWeightSeries([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeDogId, lang, userId]);

  useEffect(() => {
    if (!activeDog) return;
    if (weightSeries.length > 0) return;
    const current = getDogCurrentWeight(activeDog);
    if (!current || current <= 0) return;
    setWeightSeries([
      {
        timestamp: new Date().toISOString(),
        label: new Date().toLocaleDateString(lang === 'GE' ? 'ka-GE' : 'en-US', { month: 'short', day: 'numeric' }),
        weight: Number(current),
      },
    ]);
  }, [activeDog, weightSeries.length, lang]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!activeDogId) {
        setMedicalRecords({
          rabies: { id: '', dog_id: '', record_type: 'rabies', last_done_date: null, next_due_date: null, notes: null },
          deworming: { id: '', dog_id: '', record_type: 'deworming', last_done_date: null, next_due_date: null, notes: null },
          complex: { id: '', dog_id: '', record_type: 'complex', last_done_date: null, next_due_date: null, notes: null },
        });
        return;
      }
      const { data } = await supabase.from('medical_records').select('*').eq('dog_id', activeDogId);
      if (cancelled) return;
      const base: Record<MedicalRecordType, MedicalRecordRow> = {
        rabies: { id: '', dog_id: activeDogId, record_type: 'rabies', last_done_date: null, next_due_date: null, notes: null },
        deworming: { id: '', dog_id: activeDogId, record_type: 'deworming', last_done_date: null, next_due_date: null, notes: null },
        complex: { id: '', dog_id: activeDogId, record_type: 'complex', last_done_date: null, next_due_date: null, notes: null },
      };
      for (const row of (data ?? []) as MedicalRecordRow[]) {
        if (row.record_type in base) base[row.record_type] = { ...base[row.record_type], ...row };
      }
      setMedicalRecords(base);
    })();
    return () => {
      cancelled = true;
    };
  }, [activeDogId]);

  const reloadMedicalRecords = async (dogId: string) => {
    const { data } = await supabase.from('medical_records').select('*').eq('dog_id', dogId);
    const base: Record<MedicalRecordType, MedicalRecordRow> = {
      rabies: { id: '', dog_id: dogId, record_type: 'rabies', last_done_date: null, next_due_date: null, notes: null },
      deworming: { id: '', dog_id: dogId, record_type: 'deworming', last_done_date: null, next_due_date: null, notes: null },
      complex: { id: '', dog_id: dogId, record_type: 'complex', last_done_date: null, next_due_date: null, notes: null },
    };
    for (const row of (data ?? []) as MedicalRecordRow[]) {
      if (row.record_type in base) base[row.record_type] = { ...base[row.record_type], ...row };
    }
    setMedicalRecords(base);
  };

  useEffect(() => {
    if (!activeDog) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    (['rabies', 'deworming', 'complex'] as MedicalRecordType[]).forEach((type) => {
      const row = medicalRecords[type];
      if (!row.next_due_date || !isDueSoon(row.next_due_date, type)) return;
      const key = `aylopet-reminder:${activeDog.id}:${type}:${row.next_due_date}`;
      if (localStorage.getItem(key) === '1') return;
      const title = lang === 'GE' ? 'Aylopet შეხსენება' : 'Aylopet Reminder';
      const body = `${activeDog.name ?? 'Dog'} — ${copy[lang][type]} (${copy[lang].nextDueDate}: ${row.next_due_date})`;
      new Notification(title, { body });
      localStorage.setItem(key, '1');
    });
  }, [medicalRecords, activeDog, lang]);

  const showNotice = (msg: string) => {
    setInlineNotice(msg);
    setTimeout(() => setInlineNotice(null), 2000);
  };

  const startEditDog = (field: DogFieldKey) => {
    if (!activeDog) return;
    setDogDraft({
      name: activeDog.name ?? '',
      breed: activeDog.breed ?? '',
      ageYears: String(activeDog.age_years ?? ''),
      ageMonths: String(activeDog.age_months ?? ''),
      goal: activeDog.goal ?? '',
      targetWeight: activeDog.target_weight != null ? String(activeDog.target_weight) : '',
      activityLevel: activeDog.activity_level ?? '',
      gender: activeDog.gender ?? '',
      neutered: activeDog.neutered ?? '',
      currentDiet: activeDog.current_diet ?? '',
      dietBrand: activeDog.diet_brand ?? '',
      healthIssues: activeDog.health_issues ?? '',
      appetite: activeDog.appetite ?? '',
      bodyCondition: activeDog.body_condition ?? '',
    });
    setEditingDogField(field);
  };

  const handleSaveAccount = async () => {
    if (!userId) return;
    try {
      await supabase.from('profiles').upsert({ id: userId, full_name: accountNameDraft || null });
      setFullName(accountNameDraft || null);
      setEditingAccount(false);
      showNotice(c.dataSaved);
    } catch {
      showNotice(c.dataSaveError);
    }
  };

  const handleSaveDog = async () => {
    if (!activeDog || !userId) return;
    if (!editingDogField) return;
    let payload: Record<string, string | number | null>;
    switch (editingDogField) {
      case 'name':
        payload = { name: dogDraft.name || null };
        break;
      case 'breed':
        payload = { breed: dogDraft.breed || null };
        break;
      case 'age':
        payload = {
          age_years: dogDraft.ageYears ? Number(dogDraft.ageYears) : null,
          age_months: dogDraft.ageMonths ? Number(dogDraft.ageMonths) : null,
        };
        break;
      case 'goal':
        payload = { goal: dogDraft.goal || null };
        break;
      case 'activity_level':
        payload = { activity_level: dogDraft.activityLevel || null };
        break;
      case 'target_weight':
        payload = { target_weight: dogDraft.targetWeight ? Number(dogDraft.targetWeight) : null };
        break;
      case 'gender':
        payload = { gender: dogDraft.gender || null };
        break;
      case 'neutered':
        payload = { neutered: dogDraft.neutered || null };
        break;
      case 'current_diet':
        payload = { current_diet: dogDraft.currentDiet || null };
        break;
      case 'diet_brand':
        payload = { diet_brand: dogDraft.dietBrand || null };
        break;
      case 'health_issues':
        payload = { health_issues: dogDraft.healthIssues || null };
        break;
      default:
        payload = {};
        break;
    }
    try {
      const { error } = await supabase.from('dogs').update(payload).eq('id', activeDog.id).eq('owner_id', userId);
      if (error) throw error;
      setDogs((prev) => prev.map((dog) => (dog.id === activeDog.id ? { ...dog, ...payload } : dog)));
      setEditingDogField(null);
      showNotice(c.dataSaved);
    } catch {
      showNotice(c.dataSaveError);
    }
  };

  const handlePhotoUpload = async (file: File | null) => {
    if (!file || !userId || !activeDogId) return;
    setPhotoUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const storagePath = `${userId}/${activeDogId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('dog-photos').upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('dog-photos').getPublicUrl(storagePath);
      const url = urlData.publicUrl;

      const photoColumns = ['photo_url', 'image_url', 'avatar_url', 'dog_photo_url'];
      let updated = false;
      for (const column of photoColumns) {
        const { error } = await supabase.from('dogs').update({ [column]: url }).eq('id', activeDogId).eq('owner_id', userId);
        if (!error) {
          updated = true;
          break;
        }
      }
      if (!updated) throw new Error('photo update failed');

      setDogs((prev) => prev.map((dog) => (dog.id === activeDogId ? { ...dog, photo_url: url } : dog)));
      showNotice(c.dataSaved);
    } catch {
      showNotice(c.dataSaveError);
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSaveWeight = async () => {
    if (!activeDogId || !userId) return;
    const value = Number(newWeight);
    if (!Number.isFinite(value) || value <= 0) return;
    setSavingWeight(true);
    try {
      await supabase.from('dogs').update({ current_weight: value }).eq('id', activeDogId).eq('owner_id', userId);
      const nowIso = new Date().toISOString();
      const inserted = await appendWeightHistoryPoint(activeDogId, value, nowIso);
      setDogs((prev) => prev.map((dog) => (dog.id === activeDogId ? { ...dog, current_weight: value } : dog)));
      setWeightSeries((prev) => {
        return mergeWeightPoints(prev, [
          {
            timestamp: nowIso,
            label: new Date(nowIso).toLocaleDateString(lang === 'GE' ? 'ka-GE' : 'en-US', { month: 'short', day: 'numeric' }),
            weight: value,
          },
        ]);
      });
      setNewWeight('');
      showNotice(inserted ? c.dataSaved : `${c.dataSaved} (history fallback)`);
    } catch {
      showNotice(c.dataSaveError);
    } finally {
      setSavingWeight(false);
    }
  };

  const updateMedicalRecord = (type: MedicalRecordType, patch: Partial<MedicalRecordRow>) => {
    setMedicalRecords((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        ...patch,
      },
    }));
  };

  const saveMedicalRecord = async (type: MedicalRecordType) => {
    if (!activeDogId) return;
    const row = medicalRecords[type];
    setSavingMedicalType(type);
    try {
      if (row.id) {
        const { error } = await supabase
          .from('medical_records')
          .update({
            last_done_date: row.last_done_date,
            next_due_date: row.next_due_date,
            notes: row.notes,
          })
          .eq('id', row.id)
          .eq('dog_id', activeDogId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('medical_records')
          .insert({
            dog_id: activeDogId,
            record_type: type,
            last_done_date: row.last_done_date,
            next_due_date: row.next_due_date,
            notes: row.notes,
          });
        if (error) throw error;
      }
      await reloadMedicalRecords(activeDogId);
      showNotice(c.dataSaved);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showNotice(`${c.dataSaveError}: ${msg}`);
    } finally {
      setSavingMedicalType(null);
    }
  };

  return (
    <MainLayout homeLabel={c.home}>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
        {!SUPABASE_CONFIGURED && (
          <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            {c.supabaseWarn}
          </div>
        )}

        <div className="rounded-2xl border border-[#dbe6d3] bg-gradient-to-r from-[#eef5e7] to-[#f9fcf6] p-4 shadow-sm">
          <h1 className="font-serif text-2xl font-bold text-[#2d5a27] sm:text-3xl">{c.title}</h1>
          <p className="mt-1 text-sm text-slate-600">{c.dashboardSubtitle}</p>
        </div>

        {!ready ? (
          <p className="mt-6 text-sm text-slate-600">{c.loading}</p>
        ) : !userId ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{c.signInTitle}</h2>
            <p className="mt-2 text-sm text-slate-600">{c.signInBody}</p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-xl bg-[#2d5a27] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3a6b33]"
            >
              {c.goHome}
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {inlineNotice && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
                {inlineNotice}
              </div>
            )}

            <div className="mx-auto w-full max-w-3xl rounded-2xl border border-[#dce7d6] bg-[#edf4e8] p-3 shadow-sm">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {([
                  ['account', c.sectionAccount],
                  ['dog', c.sectionDog],
                  ['referral', c.sectionReferral],
                ] as [SectionKey, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveSection(key)}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      activeSection === key
                        ? 'bg-white text-[#2d5a27] shadow-sm'
                        : 'bg-transparent text-[#5c6d58] hover:bg-white/70'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {activeSection === 'account' && (
              <section className="mx-auto w-full max-w-3xl rounded-2xl border border-[#D4E4D4] bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-semibold text-[#2D3A2D]">{c.sectionAccount}</h2>
                    <dl className="mt-3 space-y-2 text-sm">
                      <div>
                        <dt className="text-slate-500">{c.email}</dt>
                        <dd className="font-medium text-slate-900">{email ?? '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">{c.name}</dt>
                        {editingAccount ? (
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <input
                              value={accountNameDraft}
                              onChange={(e) => setAccountNameDraft(e.target.value)}
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-900 focus:border-[#2d5a27] focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={handleSaveAccount}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#2d5a27] px-2.5 py-1.5 text-xs font-semibold text-white"
                            >
                              <Save className="h-3.5 w-3.5" /> {c.save}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAccount(false);
                                setAccountNameDraft(fullName ?? '');
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700"
                            >
                              <X className="h-3.5 w-3.5" /> {c.cancel}
                            </button>
                          </div>
                        ) : (
                          <dd className="flex items-center gap-2 font-medium text-slate-900">
                            {fullName ?? '—'}
                            <button
                              type="button"
                              onClick={() => {
                                setAccountNameDraft(fullName ?? '');
                                setEditingAccount(true);
                              }}
                              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              <Pencil className="h-3.5 w-3.5" /> {c.edit}
                            </button>
                          </dd>
                        )}
                      </div>
                      <div>
                        <dt className="text-slate-500">{lang === 'GE' ? 'სტატუსი' : 'Status'}</dt>
                        <dd className="font-medium text-slate-900">{statusPrice.status}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">{lang === 'GE' ? 'ფასი / შეთავაზება' : 'Price / Offer'}</dt>
                        <dd className="font-medium text-[#2d5a27]">{statusPrice.price}</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/aylopetai-chat"
                      className="inline-flex rounded-lg bg-[#2d5a27] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3a6b33]"
                    >
                      {c.chatCta}
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="inline-flex rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {c.signOut}
                    </button>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-[#e2ebdb] bg-[#fbfdf8] p-4">
                  <h3 className="text-sm font-semibold text-[#2D3A2D]">{c.promoTitle}</h3>
                  {promoCode ? (
                    <code className="mt-3 block rounded-lg bg-white px-3 py-2 text-xs font-mono text-[#2d5a27] ring-1 ring-[#e2eadc]">
                      {promoCode}
                    </code>
                  ) : (
                    <p className="mt-2 text-sm text-slate-600">{c.promoEmpty}</p>
                  )}
                </div>
              </section>
            )}

            {activeSection === 'dog' && (
              <section className="mx-auto w-full max-w-3xl space-y-4">
                <div className="rounded-2xl border border-[#D4E4D4] bg-[#edf4e8] p-4 shadow-sm">
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#2D3A2D]">
                    <PawPrint className="h-4 w-4 text-[#2d5a27]" />
                    {c.myDogs}
                  </h2>
                  {dogs.length === 0 ? (
                    <p className="text-sm text-slate-600">{c.noDogs}</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {dogs.map((dog) => (
                        <button
                          key={dog.id}
                          type="button"
                          onClick={() => setActiveDogId(dog.id)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                            activeDog?.id === dog.id
                              ? 'bg-[#2d5a27] text-white'
                              : 'bg-[#eef4e8] text-[#2d5a27] hover:bg-[#e2edd9]'
                          }`}
                        >
                          {dog.name || 'Dog'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {activeDog && (
                  <div className="rounded-2xl border border-[#D4E4D4] bg-[#edf4e8] p-4 shadow-sm">
                    <div className="mx-auto max-w-md">
                      <div className="relative overflow-hidden rounded-xl bg-white ring-1 ring-[#dde7d6]">
                        {photoUrl ? (
                          <img src={photoUrl} alt={activeDog.name ?? 'Dog'} className="h-32 w-full object-contain bg-[#f7faf4]" />
                        ) : (
                          <div className="flex h-32 items-center justify-center text-slate-400">
                            <PawPrint className="h-10 w-10" />
                          </div>
                        )}
                        <label className="absolute bottom-2 right-2 inline-flex cursor-pointer items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#2d5a27] shadow">
                          {photoUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                          {photoUploading ? c.uploading : c.photoHint}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] ?? null;
                              handlePhotoUpload(file);
                              e.target.value = '';
                            }}
                          />
                        </label>
                      </div>

                      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-lg bg-white p-2.5 ring-1 ring-[#dfe8d8]">
                          <dt className="text-[11px] text-slate-500">{c.name}</dt>
                          {editingDogField === 'name' ? (
                            <input
                              value={dogDraft.name}
                              onChange={(e) => setDogDraft((prev) => ({ ...prev, name: e.target.value }))}
                              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-[#2d5a27] focus:outline-none"
                            />
                          ) : (
                            <dd
                              className="flex cursor-pointer items-center justify-between gap-2 text-xs font-semibold text-slate-900"
                              onClick={() => startEditDog('name')}
                            >
                              <span>{activeDog.name ?? '—'}</span>
                              <Pencil className="h-3.5 w-3.5 text-slate-400" />
                            </dd>
                          )}
                        </div>
                        <div className="rounded-lg bg-white p-2.5 ring-1 ring-[#dfe8d8]">
                          <dt className="text-[11px] text-slate-500">{c.breed}</dt>
                          {editingDogField === 'breed' ? (
                            <input
                              value={dogDraft.breed}
                              onChange={(e) => setDogDraft((prev) => ({ ...prev, breed: e.target.value }))}
                              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-[#2d5a27] focus:outline-none"
                            />
                          ) : (
                            <dd
                              className="flex cursor-pointer items-center justify-between gap-2 text-xs font-semibold text-slate-900"
                              onClick={() => startEditDog('breed')}
                            >
                              <span>{activeDog.breed || '—'}</span>
                              <Pencil className="h-3.5 w-3.5 text-slate-400" />
                            </dd>
                          )}
                        </div>
                        <div className="rounded-lg bg-white p-2.5 ring-1 ring-[#dfe8d8]">
                          <dt className="text-[11px] text-slate-500">{c.age}</dt>
                          {editingDogField === 'age' ? (
                            <div className="mt-1 flex gap-2">
                              <input
                                type="number"
                                min="0"
                                value={dogDraft.ageYears}
                                onChange={(e) => setDogDraft((prev) => ({ ...prev, ageYears: e.target.value }))}
                                className="w-16 rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-[#2d5a27] focus:outline-none"
                              />
                              <input
                                type="number"
                                min="0"
                                max="11"
                                value={dogDraft.ageMonths}
                                onChange={(e) => setDogDraft((prev) => ({ ...prev, ageMonths: e.target.value }))}
                                className="w-16 rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-[#2d5a27] focus:outline-none"
                              />
                            </div>
                          ) : (
                            <dd
                              className="flex cursor-pointer items-center justify-between gap-2 text-xs font-semibold text-slate-900"
                              onClick={() => startEditDog('age')}
                            >
                              <span>{formatAge(lang, activeDog.age_years ?? null, activeDog.age_months ?? null)}</span>
                              <Pencil className="h-3.5 w-3.5 text-slate-400" />
                            </dd>
                          )}
                        </div>
                        <div className="rounded-lg bg-white p-2.5 ring-1 ring-[#dfe8d8]">
                          <dt className="text-[11px] text-slate-500">{c.goal}</dt>
                          {editingDogField === 'goal' ? (
                            <input
                              value={dogDraft.goal}
                              onChange={(e) => setDogDraft((prev) => ({ ...prev, goal: e.target.value }))}
                              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-[#2d5a27] focus:outline-none"
                            />
                          ) : (
                            <dd
                              className="flex cursor-pointer items-center justify-between gap-2 text-xs font-semibold text-slate-900"
                              onClick={() => startEditDog('goal')}
                            >
                              <span>{activeDog.goal || '—'}</span>
                              <Pencil className="h-3.5 w-3.5 text-slate-400" />
                            </dd>
                          )}
                        </div>
                        <div className="rounded-lg bg-white p-2.5 ring-1 ring-[#dfe8d8]">
                          <dt className="text-[11px] text-slate-500">{lang === 'GE' ? 'აქტივობა' : 'Activity'}</dt>
                          {editingDogField === 'activity_level' ? (
                            <input
                              value={dogDraft.activityLevel}
                              onChange={(e) => setDogDraft((prev) => ({ ...prev, activityLevel: e.target.value }))}
                              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-[#2d5a27] focus:outline-none"
                            />
                          ) : (
                            <dd
                              className="flex cursor-pointer items-center justify-between gap-2 text-xs font-semibold text-slate-900"
                              onClick={() => startEditDog('activity_level')}
                            >
                              <span>{fmtDogValue(activeDog.activity_level)}</span>
                              <Pencil className="h-3.5 w-3.5 text-slate-400" />
                            </dd>
                          )}
                        </div>
                        <div className="rounded-lg bg-white p-2.5 ring-1 ring-[#dfe8d8]">
                          <dt className="text-[11px] text-slate-500">{lang === 'GE' ? 'საწყისი წონა' : 'Starting weight'}</dt>
                          {editingDogField === 'target_weight' ? (
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={dogDraft.targetWeight}
                              onChange={(e) => setDogDraft((prev) => ({ ...prev, targetWeight: e.target.value }))}
                              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-[#2d5a27] focus:outline-none"
                            />
                          ) : (
                            <dd
                              className="flex cursor-pointer items-center justify-between gap-2 text-xs font-semibold text-slate-900"
                              onClick={() => startEditDog('target_weight')}
                            >
                              <span>{displayedTargetWeight != null ? `${displayedTargetWeight} kg` : '—'}</span>
                              <Pencil className="h-3.5 w-3.5 text-slate-400" />
                            </dd>
                          )}
                        </div>
                        <div className="rounded-lg bg-white p-2.5 ring-1 ring-[#dfe8d8]">
                          <dt className="text-[11px] text-slate-500">{lang === 'GE' ? 'სქესი' : 'Gender'}</dt>
                          {editingDogField === 'gender' ? (
                            <input
                              value={dogDraft.gender}
                              onChange={(e) => setDogDraft((prev) => ({ ...prev, gender: e.target.value }))}
                              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-[#2d5a27] focus:outline-none"
                            />
                          ) : (
                            <dd
                              className="flex cursor-pointer items-center justify-between gap-2 text-xs font-semibold text-slate-900"
                              onClick={() => startEditDog('gender')}
                            >
                              <span>{fmtDogValue(activeDog.gender)}</span>
                              <Pencil className="h-3.5 w-3.5 text-slate-400" />
                            </dd>
                          )}
                        </div>
                        <div className="rounded-lg bg-white p-2.5 ring-1 ring-[#dfe8d8]">
                          <dt className="text-[11px] text-slate-500">{lang === 'GE' ? 'სტერილიზაცია' : 'Neutered'}</dt>
                          {editingDogField === 'neutered' ? (
                            <input
                              value={dogDraft.neutered}
                              onChange={(e) => setDogDraft((prev) => ({ ...prev, neutered: e.target.value }))}
                              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-[#2d5a27] focus:outline-none"
                            />
                          ) : (
                            <dd
                              className="flex cursor-pointer items-center justify-between gap-2 text-xs font-semibold text-slate-900"
                              onClick={() => startEditDog('neutered')}
                            >
                              <span>{fmtDogValue(activeDog.neutered)}</span>
                              <Pencil className="h-3.5 w-3.5 text-slate-400" />
                            </dd>
                          )}
                        </div>
                        <div className="rounded-lg bg-white p-2.5 ring-1 ring-[#dfe8d8]">
                          <dt className="text-[11px] text-slate-500">{lang === 'GE' ? 'კვების ტიპი' : 'Diet type'}</dt>
                          {editingDogField === 'current_diet' ? (
                            <input
                              value={dogDraft.currentDiet}
                              onChange={(e) => setDogDraft((prev) => ({ ...prev, currentDiet: e.target.value }))}
                              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-[#2d5a27] focus:outline-none"
                            />
                          ) : (
                            <dd
                              className="flex cursor-pointer items-center justify-between gap-2 text-xs font-semibold text-slate-900"
                              onClick={() => startEditDog('current_diet')}
                            >
                              <span>{fmtDogValue(activeDog.current_diet)}</span>
                              <Pencil className="h-3.5 w-3.5 text-slate-400" />
                            </dd>
                          )}
                        </div>
                        <div className="rounded-lg bg-white p-2.5 ring-1 ring-[#dfe8d8]">
                          <dt className="text-[11px] text-slate-500">{lang === 'GE' ? 'ბრენდი' : 'Brand'}</dt>
                          {editingDogField === 'diet_brand' ? (
                            <input
                              value={dogDraft.dietBrand}
                              onChange={(e) => setDogDraft((prev) => ({ ...prev, dietBrand: e.target.value }))}
                              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-[#2d5a27] focus:outline-none"
                            />
                          ) : (
                            <dd
                              className="flex cursor-pointer items-center justify-between gap-2 text-xs font-semibold text-slate-900"
                              onClick={() => startEditDog('diet_brand')}
                            >
                              <span>{fmtDogValue(activeDog.diet_brand)}</span>
                              <Pencil className="h-3.5 w-3.5 text-slate-400" />
                            </dd>
                          )}
                        </div>
                        <div className="col-span-2 rounded-lg bg-white p-2.5 ring-1 ring-[#dfe8d8]">
                          <dt className="text-[11px] text-slate-500">{lang === 'GE' ? 'ჯანმრთელობის შენიშვნები' : 'Health notes'}</dt>
                          {editingDogField === 'health_issues' ? (
                            <input
                              value={dogDraft.healthIssues}
                              onChange={(e) => setDogDraft((prev) => ({ ...prev, healthIssues: e.target.value }))}
                              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-[#2d5a27] focus:outline-none"
                            />
                          ) : (
                            <dd
                              className="flex cursor-pointer items-center justify-between gap-2 text-xs font-semibold text-slate-900"
                              onClick={() => startEditDog('health_issues')}
                            >
                              <span>{fmtDogValue(activeDog.health_issues)}</span>
                              <Pencil className="h-3.5 w-3.5 text-slate-400" />
                            </dd>
                          )}
                        </div>
                      </dl>
                      <div className="mt-4 flex gap-2">
                        {editingDogField ? (
                          <>
                            <button
                              type="button"
                              onClick={handleSaveDog}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#2d5a27] px-3 py-1.5 text-xs font-semibold text-white"
                            >
                              <Save className="h-3.5 w-3.5" /> {c.save}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingDogField(null)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                            >
                              <X className="h-3.5 w-3.5" /> {c.cancel}
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEditDog('name')}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil className="h-3.5 w-3.5" /> {c.edit}
                          </button>
                        )}
                      </div>
                      <div className="mt-4 rounded-xl bg-white p-3 ring-1 ring-[#dfe8d8]">
                      <h3 className="flex items-center gap-2 font-semibold text-[#2D3A2D]">
                        <Scale className="h-4 w-4 text-[#2d5a27]" />
                        {c.weightTitle}
                      </h3>
                      <p className="mt-1 text-xs text-slate-600">
                        {c.latestWeight}: <span className="font-semibold text-[#2d5a27]">{getDogCurrentWeight(activeDog) ?? '—'} kg</span>
                      </p>

                      <div className="mt-3 h-44 w-full rounded-lg border border-[#e4ecdf] bg-[#fcfdfb] p-2">
                        {chartData.length === 0 ? (
                          <div className="flex h-full items-center justify-center text-xs font-medium text-slate-500">
                            {c.noChartData}
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5ece2" />
                              <XAxis
                                dataKey="timestamp"
                                tick={{ fontSize: 10, fill: '#5f6f60' }}
                                tickLine={false}
                                axisLine={{ stroke: '#d9e3d3' }}
                                tickFormatter={(v: string) =>
                                  new Date(v).toLocaleDateString(lang === 'GE' ? 'ka-GE' : 'en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                }
                                minTickGap={24}
                              />
                              <YAxis
                                tick={{ fontSize: 10, fill: '#5f6f60' }}
                                tickLine={false}
                                axisLine={{ stroke: '#d9e3d3' }}
                                width={34}
                              />
                              <Tooltip
                                labelFormatter={(_, payload) => {
                                  const item = payload?.[0]?.payload as WeightPoint | undefined;
                                  if (!item?.timestamp) return '';
                                  return new Date(item.timestamp).toLocaleString(lang === 'GE' ? 'ka-GE' : 'en-US');
                                }}
                                formatter={(value: number | undefined) => [`${value ?? '-'} kg`, lang === 'GE' ? 'წონა' : 'Weight']}
                              />
                              <Line
                                type="monotone"
                                dataKey="weight"
                                stroke="#2d5a27"
                                strokeWidth={2.5}
                                dot={{ r: 3, fill: '#2d5a27' }}
                                activeDot={{ r: 5 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>

                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={newWeight}
                          onChange={(e) => setNewWeight(e.target.value)}
                          placeholder={c.newWeight}
                          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-[#2d5a27] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleSaveWeight}
                          disabled={savingWeight}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2d5a27] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          {savingWeight && <Loader2 className="h-4 w-4 animate-spin" />}
                          {c.saveWeight}
                        </button>
                      </div>

                      <div className="mt-4 rounded-xl bg-white p-3 ring-1 ring-[#dfe8d8]">
                        <h3 className="text-sm font-semibold text-[#2D3A2D]">{c.healthMonitorTitle}</h3>
                        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[11px] text-slate-500">{c.reminderRule}</p>
                          <button
                            type="button"
                            onClick={() => {
                              if (typeof window === 'undefined' || !('Notification' in window)) return;
                              if (Notification.permission === 'default') Notification.requestPermission();
                            }}
                            className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            {c.enableReminders}
                          </button>
                        </div>
                        <div className="mt-3 space-y-3">
                          {(['rabies', 'deworming', 'complex'] as MedicalRecordType[]).map((type) => {
                            const row = medicalRecords[type];
                            const remAt = reminderDate(row.next_due_date, type);
                            const dueSoon = isDueSoon(row.next_due_date, type);
                            return (
                              <div key={type} className="rounded-lg border border-[#e3ebde] bg-[#fbfdf9] p-3">
                                <div className="mb-2 flex items-center justify-between gap-2">
                                  <h4 className="text-xs font-semibold text-[#2D3A2D]">{c[type]}</h4>
                                  {dueSoon && (
                                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                                      {c.dueSoon}
                                    </span>
                                  )}
                                </div>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                  <div>
                                    <label className="mb-1 block text-[11px] text-slate-500">{c.lastDoneDate}</label>
                                    <input
                                      type="date"
                                      value={row.last_done_date ?? ''}
                                      onChange={(e) => {
                                        const v = e.target.value || null;
                                        updateMedicalRecord(type, {
                                          last_done_date: v,
                                          next_due_date: defaultNextDueFromLastDone(v, type),
                                        });
                                      }}
                                      className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs focus:border-[#2d5a27] focus:outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="mb-1 block text-[11px] text-slate-500">{c.nextDueDate}</label>
                                    <input
                                      type="date"
                                      value={row.next_due_date ?? ''}
                                      onChange={(e) => updateMedicalRecord(type, { next_due_date: e.target.value || null })}
                                      className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs focus:border-[#2d5a27] focus:outline-none"
                                    />
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <label className="mb-1 block text-[11px] text-slate-500">{c.notes}</label>
                                  <input
                                    type="text"
                                    value={row.notes ?? ''}
                                    onChange={(e) => updateMedicalRecord(type, { notes: e.target.value || null })}
                                    className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs focus:border-[#2d5a27] focus:outline-none"
                                  />
                                </div>
                                <div className="mt-2 flex items-center justify-between gap-2">
                                  <span className="text-[11px] text-slate-500">
                                    {c.reminderAt}: {remAt ?? '—'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => saveMedicalRecord(type)}
                                    disabled={savingMedicalType === type}
                                    className="inline-flex items-center gap-1 rounded-md bg-[#2d5a27] px-2.5 py-1.5 text-[11px] font-semibold text-white disabled:opacity-60"
                                  >
                                    {savingMedicalType === type ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                                    {c.saveRecord}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {activeSection === 'referral' && (
              <section className="mx-auto w-full max-w-3xl">
                <ReferralDashboard lang={lang} userId={userId} hasActiveProfile={hasActiveProfile} promoUserTier={promoTier} />
              </section>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
