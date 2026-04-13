'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { withRetry } from '@/lib/supabase-retry';
import { breeds as breedsFallback } from '@/app/data/breeds';
import { diseases as diseasesFallback } from '@/app/data/diseases';
import { CITY_OPTIONS, getCityDisplayName, normalizeCityKey, isDeliveryCity } from '@/app/data/cities';

type Lang = 'GE' | 'EN';
const LANG_KEY = 'aylopet-lang';
type Step = 'intro' | 'menu' | 'contact' | 'city' | 'quantity' | 'dog' | 'offer' | 'closing' | 'priority_greeting' | 'priority_city' | 'priority_contact' | 'priority_done' | 'early_bird_redirect';

interface BreedItem {
  id: string;
  nameKa: string;
  nameEn: string;
}

interface DiseaseItem {
  id: string;
  nameKa: string;
  nameEn: string;
}

interface DogProfile {
  name: string;
  ageYears: number;
  ageMonths: number;
  gender: string;
  neutered: string;
  breed: BreedItem | { id: 'custom'; nameKa: string; nameEn: string } | null;
  weight: number;
  condition: string;
  activity: string;
  appetite: string;
  diet: string;
  dietBrand?: string;
  healthIds: string[];
  healthCustom?: string;
  healthStepCompleted?: boolean;
  goal: string;
  goalCustom?: string;
}

interface UserAnswers {
  userName: string;
  email: string;
  phone: string;
  city: string;
  dogCount: number;
  dogs: DogProfile[];
}

type EditRef = { step: Step; dogIndex?: number; substep?: number };

const DOG_SUBSTEPS = ['name', 'age', 'gender', 'status', 'breed', 'weight', 'condition', 'activity', 'appetite', 'diet', 'health', 'goal'] as const;
const MIXED_BREED: BreedItem = { id: 'mixed-breed', nameKa: 'მიქსი ჯიში', nameEn: 'Mixed Breed' };

const AMBASSADOR_CITY_OPTIONS = [
  { key: 'tbilisi', nameGe: 'თბილისი', nameEn: 'Tbilisi' },
  { key: 'batumi', nameGe: 'ბათუმი', nameEn: 'Batumi' },
  { key: 'kutaisi', nameGe: 'ქუთაისი', nameEn: 'Kutaisi' },
  { key: 'other', nameGe: 'სხვა', nameEn: 'Other' },
] as const;


const translations: Record<Lang, Record<string, string>> = {
  GE: {
    step1: 'მოგესალმებით, მე ვარ AylopetAI - თქვენი ძაღლის პერსონალური ნუტრიციოლოგი. სანამ დავიწყებდეთ, როგორ მოგმართოთ?',
    stepMenuGreeting: '{userName}, სასიამოვნოა თქვენი გაცნობა. როგორ გსურთ ჩათის გაგრძელება?',
    menuBtnA: '🐾 შევქმნათ პერსონალიზირებული კვების რაციონი და პროფილი',
    menuBtnB: '✨ გახდი Honorary Ambassador 100-ის წევრი',
    step2: 'სასიამოვნოა, {userName}! გთხოვთ, მიუთითოთ თქვენი მეილი და მობილურის ნომერი (ორივე აუცილებელია).',
    stepCity: 'რომელ ქალაქში ცხოვრობთ თქვენ და თქვენი ოთხფეხა მეგობარი?',
    step3: 'რამდენი ძაღლი გყავთ?',
    dogName: 'რა ჰქვია თქვენს ოთხფეხა მეგობარს?',
    dogAge: 'რამდენი წლის და რამდენი თვისაა {dogName}?',
    dogGender: '{dogName}-ს სქესი?',
    dogStatus: 'არის თუ არა {dogName} კასტრირებული ან სტერილიზებული?',
    dogBreed: 'რა ჯიშისაა {dogName}?',
    dogWeight: 'დაახლოებით რამდენი კილოგრამია {dogName}?',
    dogCondition: 'როგორ ფორმაშია {dogName}?',
    dogActivity: 'რამდენად აქტიურია {dogName}?',
    dogAppetite: 'კვების დროს {dogName}...',
    dogDiet: 'ძირითადად რას მიირთმევს {dogName}?',
    dogDietBrand: 'რომელი ბრენდის?',
    dogHealth: 'აქვს თუ არა {dogName}-ს რაიმე ჯანმრთელობის პრობლემა?',
    dogGoal: 'რა არის თქვენი მთავარი მიზანი {dogName}-სთვის?',
    offer: 'მადლობა, რომ გამესაუბრეთ! ბოდიში, რომ ახლავე ვერ გთავაზობთ თქვენს ძაღლზე მორგებულ კვების რაციონს. ამ უხერხულობისთვის, Aylopet-ისგან გჩუქნით პერსონალურ პრომო კოდს, რომლითაც მიიღებთ **20%-იან ფასდაკლებას** 6 თვის განმავლობაში. გსურთ მიიღოთ ეს კოდი და დაემატოთ Aylopet-ის **Early Bird** სიაში?',
    offerWaitlist: 'მადლობა, რომ გამესაუბრეთ! ბოდიში, რომ ახლავე ვერ გთავაზობთ თქვენს ძაღლზე მორგებულ კვების რაციონს. ამ უხერხულობისთვის, Aylopet-ისგან გჩუქნით პერსონალურ პრომო კოდს, რომლითაც მიიღებთ **20%-იან ფასდაკლებას** 6 თვის განმავლობაში. გსურთ მიიღოთ ეს კოდი და დაემატოთ Aylopet-ის **Early Bird** სიაში?',
    offerYes: 'დიახ, მსურს',
    offerNo: 'არა, გმადლობთ',
    closing: "მადლობა, რომ გამესაუბრეთ! ბოდიში, რომ ახლავე ვერ გთავაზობთ თქვენს ძაღლზე მორგებულ კვების რაციონს. ამ უხერხულობისთვის Aylopet-ისგან გჩუქნით პერსონალურ პრომო კოდს, რომლითაც მიიღებთ 20%-იან ფასდაკლებას 6 თვის განმავლობაში. პრომო კოდის მისაღებად, გთხოვთ გაიაროთ რეგისტრაცია. კოდი არის პერსონალური და გამოჩნდება თქვენს პირად კაბინეტში რეგისტრაციის შემდეგ.",
    closingNo: 'მადლობა, რომ გამესაუბრეთ! იმედი გვაქვს მალე გნახოთ.',
    ambassadorGreeting: '{userName}, მადლობას გიხდით, რომ აირჩიეთ Honorary Ambassador 100-ის გზა. თქვენი ნდობა ჩვენი პირველი ნაბიჯების ეტაპზე Aylopet-ის გუნდისთვის უდიდესი სტიმულია. 🐾 საპასუხოდ, მოხარულნი ვართ გაგაცნოთ ის განსაკუთრებული პირობები, რომლითაც მხოლოდ ჩვენი საპატიო წევრები ისარგებლებენ:',
    ambassadorPackage1: '🐾 Aylopet Starter Kit — უფასო პერსონალიზირებული სადეგუსტაციო ნაკრები.',
    ambassadorPackage2: '🥗 Ambassador Pricing — 40%_იანი ფასდაკლება საკვებზე (6 თვე) + 20% Lifetime ფასდაკლება. (სტანდარტული ღირებულება: 40-50ლ/კგ. დღიური ნორმა: საშუალოდ ძაღლის სხეულის წონის 2%)',
    ambassadorPackage3: '📱 AI Access — 6-თვიანი უფასო წვდომა AylopetAI-ზე. (სტანდარტული ღირებულება: 10ლ/თვე)',
    ambassadorPackage4: '🐕‍🦺 Smart Hardware — საჩუქრად ჭკვიანი ყელსაბამი + 6-თვიანი მომსახურება უფასოდ. (სტანდარტული ღირებულება: 25ლ/თვე — მოიცავს მონაცემთა ანალიტიკას და AI მხარდაჭერას)',
    ambassadorPackage5: '💎 Permanent Privilege — მაქსიმალური შეღავათები მომავალ ფუნქციონალებზე.',
    ambassadorCityQuestion: 'რომელ ქალაქში ცხოვრობთ?',
    ambassadorContactStep: 'გთხოვთ, მიუთითოთ თქვენი მეილი და მობილურის ნომერი (ორივე აუცილებელია).',
    cityWaitlistMsg: 'სამწუხაროდ, ამ ეტაპზე თქვენს ქალაქში მომსახურება ხელმისაწვდომი არ არის. თუმცა, თქვენ მოხვდით სპეციალურ 50-კაციან სიაში და პრივილეგიებით ისარგებლებთ როგორ კი თქვენს ლოკაციაზე შემოვალთ.',
    earlyBirdRedirectMsg: 'Honorary Ambassador 100-ის ყველა ადგილი დაკავებულია. თუმცა, შეგიძლიათ გახდეთ **Early Bird** წევრი და მიიღოთ 20%-იანი ფასდაკლება 6 თვის განმავლობაში.',
    priorityDone: 'მადლობა! თქვენ შეიყვანეთ პრიორიტეტულ სიაში. რეგისტრაციის შესასრულებლად გთხოვთ დააჭიროთ ქვემოთ მოცემულ ღილაკს.',
    registerCta: 'რეგისტრაცია და კოდის მიღება',
    male: 'ხვადი',
    female: 'ძუ',
    yes: 'კი',
    no: 'არა',
    years: 'წელი',
    months: 'თვე',
    kg: 'კგ',
    condition1: 'ძალიან სუსტი',
    condition2: 'იდეალური',
    condition3: 'მომრგვალებული',
    condition4: 'ჭარბწონიანი',
    activity1: 'საერთოდ არა',
    activity2: 'აქტიური',
    activity3: 'სუპერაქტიური',
    activity4: 'ათლეტი',
    appetite1: 'იწუნებს საჭმელს',
    appetite2: 'შეიძლება დაიწუნოს',
    appetite3: 'კარგად ჭამს',
    appetite4: 'ყველაფერს ჭამს',
    diet1: 'მშრალი',
    diet2: 'სველი',
    diet3: 'უმი ხორცი',
    diet4: 'გამომშრალი',
    diet5: 'Fresh Food',
    goal1: 'წონის კლება',
    goal2: 'შენარჩუნება',
    goal3: 'მომატება',
    goal4: 'უჭმელობის მოგვარება',
    goalCustom: 'სხვა',
    noIssues: 'არაფერი',
    editHint: 'ჩასასწორებლად დააჭირეთ',
    exitBtn: 'ჩატის დასრულება / მთავარზე დაბრუნება',
    myProfile: 'ჩემი პროფილი',
    namePlaceholder: 'თქვენი სახელი',
    cityPlaceholder: 'ქალაქის ძებნა...',
    emailPlaceholder: 'ელფოსტა',
    phonePlaceholder: 'ტელეფონი',
    breedPlaceholder: 'ჯიშის ძებნა...',
    healthPlaceholder: 'აირჩიეთ ან ჩაწერეთ საკუთარი',
    goalCustomPlaceholder: 'დაწერეთ თქვენი მიზანი',
    weightPlaceholder: 'კგ',
    supabaseWarn:
      'შეწიგება: Supabase არ არის კონფიგურირობული. შეამოწმოთ .env.local (NEXT_PUBLIC_SUPABASE_URL და NEXT_PUBLIC_SUPABASE_ANON_KEY).',
  },
  EN: {
    step1: "Welcome, I am AylopetAI - your dog's personal nutritionist. Before we begin, how should I address you?",
    stepMenuGreeting: '{userName}, nice to meet you. How would you like to proceed?',
    menuBtnA: '🐾 Create a personalized nutrition plan and profile',
    menuBtnB: '✨ Become an Honorary Ambassador 100 member',
    step2: 'Nice to meet you, {userName}! Please provide your email and phone number (both required).',
    stepCity: 'In which city are you and your four-legged friend located?',
    step3: 'How many dogs do you have?',
    dogName: "What is your four-legged friend's name?",
    dogAge: 'How old is {dogName}? (Years and Months)',
    dogGender: "{dogName}'s gender?",
    dogStatus: 'Is {dogName} neutered or sterilized?',
    dogBreed: "What breed is {dogName}?",
    dogWeight: 'Approximately how many kilograms is {dogName}?',
    dogCondition: 'What condition is {dogName} in?',
    dogActivity: 'How active is {dogName}?',
    dogAppetite: 'When eating, {dogName}...',
    dogDiet: 'What does {dogName} mainly eat?',
    dogDietBrand: 'Which brand?',
    dogHealth: 'Does {dogName} have any health issues?',
    dogGoal: "What is your main goal for {dogName}?",
    offer: "Thank you for chatting with me! Sorry that we can't offer a customized nutrition plan for your dog right now. For this inconvenience, Aylopet is gifting you a personal promo code for a **20% discount** for 6 months. Would you like to receive this code and join Aylopet's **Early Bird** list?",
    offerWaitlist: "Thank you for chatting with me! Sorry that we can't offer a customized nutrition plan for your dog right now. For this inconvenience, Aylopet is gifting you a personal promo code for a **20% discount** for 6 months. Would you like to receive this code and join Aylopet's **Early Bird** list?",
    offerYes: 'Yes, I want',
    offerNo: 'No, thanks',
    closing: "Thank you for chatting with me! Sorry that we can't offer a customized nutrition plan for your dog right now. For this inconvenience, Aylopet is gifting you a personal promo code for a 20% discount for 6 months. To receive your code, please register. Your code will be available in your personal dashboard after registration.",
    closingNo: 'Thank you for chatting with us! We hope to see you soon.',
    ambassadorGreeting: '{userName}, thank you for choosing the Honorary Ambassador 100 path. Your trust during our initial steps is a huge motivation for the Aylopet team. 🐾 In return, we are pleased to introduce the special conditions available exclusively to our honorary members:',
    ambassadorPackage1: '🐾 Aylopet Starter Kit — Free personalized tasting kit.',
    ambassadorPackage2: '🥗 Ambassador Pricing — 40% discount (6 months) + 20% Lifetime discount. (Standard value: 40-50₾/kg. Daily norm: ~2% of body weight)',
    ambassadorPackage3: '📱 AI Access — 6-month free access to AylopetAI. (Standard value: 10₾/month)',
    ambassadorPackage4: '🐕‍🦺 Smart Hardware — Free smart collar + 6-month service. (Standard value: 25₾/month — includes data analytics and AI support)',
    ambassadorPackage5: '💎 Permanent Privilege — Maximum benefits on future features.',
    ambassadorCityQuestion: 'In which city do you live?',
    ambassadorContactStep: 'Please provide your email and phone number (both required).',
    cityWaitlistMsg: "Unfortunately, we don't have service in your city at this stage. However, you've joined our special 50-person list and will enjoy privileges as soon as we expand to your location.",
    earlyBirdRedirectMsg: 'All Honorary Ambassador 100 spots are taken. However, you can become an **Early Bird** member and receive a 20% discount for 6 months.',
    priorityDone: 'Thank you! You are on the priority list. Please click the button below to complete registration.',
    registerCta: 'Register & Get Discount',
    male: 'Male',
    female: 'Female',
    yes: 'Yes',
    no: 'No',
    years: 'Years',
    months: 'Months',
    kg: 'kg',
    condition1: 'Very thin',
    condition2: 'Ideal',
    condition3: 'Rounded',
    condition4: 'Overweight',
    activity1: 'Not active',
    activity2: 'Active',
    activity3: 'Super active',
    activity4: 'Athlete',
    appetite1: 'Very picky',
    appetite2: 'Can be picky',
    appetite3: 'Good eater',
    appetite4: 'Will eat anything',
    diet1: 'Dry',
    diet2: 'Wet',
    diet3: 'Raw meat',
    diet4: 'Dried',
    diet5: 'Fresh Food',
    goal1: 'Weight loss',
    goal2: 'Maintenance',
    goal3: 'Weight gain',
    goal4: 'Fix pickiness',
    goalCustom: 'Other',
    noIssues: 'None',
    editHint: 'Click to edit',
    exitBtn: 'End Chat / Back to Home',
    myProfile: 'My Profile',
    namePlaceholder: 'Your name',
    cityPlaceholder: 'Search city...',
    emailPlaceholder: 'Email',
    phonePlaceholder: 'Phone',
    breedPlaceholder: 'Search breed...',
    healthPlaceholder: 'Select or type custom',
    goalCustomPlaceholder: 'Type your goal',
    weightPlaceholder: 'kg',
    supabaseWarn:
      'Warning: Supabase is not configured in .env.local. Sign-in, registration, and saving your chat answers may not work. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
  },
};

const getBlankDog = (): DogProfile => ({
  name: '',
  ageYears: 0,
  ageMonths: 0,
  gender: '',
  neutered: '',
  breed: null,
  weight: 0,
  condition: '',
  activity: '',
  appetite: '',
  diet: '',
  healthIds: [],
  goal: '',
});

export default function AylopetAIChatPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'GE';
    const s = localStorage.getItem(LANG_KEY);
    return (s === 'EN' || s === 'GE') ? s : 'GE';
  });
  const [step, setStep] = useState<Step>('intro');
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [answers, setAnswers] = useState<UserAnswers>({ userName: '', email: '', phone: '', city: '', dogCount: 0, dogs: [] });
  const [ambassadorPath, setAmbassadorPath] = useState<'ambassador' | 'early_bird' | null>(null);
  const [dogIndex, setDogIndex] = useState(0);
  const [dogSubstep, setDogSubstep] = useState(0);
  const [editingAt, setEditingAt] = useState<EditRef | null>(null);
  const [tempInput, setTempInput] = useState('');
  const [breeds, setBreeds] = useState<BreedItem[]>(breedsFallback as BreedItem[]);
  const [diseases, setDiseases] = useState<DiseaseItem[]>(diseasesFallback);
  const [breedSearch, setBreedSearch] = useState('');
  const [breedResults, setBreedResults] = useState<BreedItem[]>([]);
  const [breedDropdownOpen, setBreedDropdownOpen] = useState(false);
  const [diseaseSearch, setDiseaseSearch] = useState('');
  const [diseaseResults, setDiseaseResults] = useState<DiseaseItem[]>([]);
  const [diseaseDropdownOpen, setDiseaseDropdownOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [offerLoading, setOfferLoading] = useState(false);
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isProcessingRef = useRef(false);

  const t = translations[lang];
  const currentDog = answers.dogs[dogIndex] ?? getBlankDog();
  const substep = DOG_SUBSTEPS[dogSubstep];

  useEffect(() => {
    const s = localStorage.getItem(LANG_KEY);
    if (s === 'EN' || s === 'GE') setLang(s);
  }, []);
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
    setSupabaseConfigured(Boolean(url && key));
  }, []);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u ? { id: u.id } : null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ? { id: session.user.id } : null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [breedsRes, diseasesRes] = await withRetry(() =>
          Promise.all([
            supabase.from('breeds').select('*').limit(500),
            supabase.from('diseases').select('*').limit(100),
          ])
        );
        if (!breedsRes.error && breedsRes.data?.length) {
          const mapped = breedsRes.data.map((b: Record<string, unknown>) => ({
            id: String(b.id ?? ''),
            nameKa: String(b.name_ka ?? b.nameKa ?? b.id ?? ''),
            nameEn: String(b.name_en ?? b.nameEn ?? b.id ?? ''),
          }));
          if (mapped.length) setBreeds(mapped);
        }
        if (!diseasesRes.error && diseasesRes.data?.length) {
          const mapped = diseasesRes.data.map((d: Record<string, unknown>) => ({
            id: String(d.id ?? ''),
            nameKa: String(d.name_ka ?? d.nameKa ?? d.id ?? ''),
            nameEn: String(d.name_en ?? d.nameEn ?? d.id ?? ''),
          }));
          if (mapped.length) setDiseases(mapped);
        }
      } catch {
        // Fallback to local data (already set in useState)
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!breedSearch.trim()) setBreedResults(breeds.slice(0, 20));
    else {
      const q = breedSearch.toLowerCase().trim();
      setBreedResults(breeds.filter((b) => b.nameEn.toLowerCase().includes(q) || b.nameKa.includes(q)).slice(0, 20));
    }
  }, [breedSearch, breeds]);

  useEffect(() => {
    if (!diseaseSearch.trim()) setDiseaseResults(diseases);
    else {
      const q = diseaseSearch.toLowerCase().trim();
      setDiseaseResults(diseases.filter((d) => d.nameEn.toLowerCase().includes(q) || d.nameKa.includes(q)));
    }
  }, [diseaseSearch, diseases]);

  const cityFiltered = !citySearch.trim()
    ? [...CITY_OPTIONS]
    : CITY_OPTIONS.filter((c) =>
        c.nameGe.toLowerCase().includes(citySearch.toLowerCase().trim()) ||
        c.nameEn.toLowerCase().includes(citySearch.toLowerCase().trim())
      );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [step, dogIndex, dogSubstep, answers]);

  useEffect(() => {
    const cream = '#F5F5F0';
    const gradient = 'linear-gradient(to bottom, #D4E4D4 0%, #F5F5F0 30%, #F5F5F0 100%)';
    document.body.style.background = gradient;
    document.body.style.minHeight = '100vh';
    document.documentElement.style.background = cream;
    document.documentElement.style.minHeight = '100vh';
    return () => {
      document.body.style.background = '';
      document.body.style.minHeight = '';
      document.documentElement.style.background = '';
      document.documentElement.style.minHeight = '';
    };
  }, []);

  const updateCurrentDog = (updates: Partial<DogProfile>) => {
    setAnswers((a) => {
      const dogs = [...a.dogs];
      dogs[dogIndex] = { ...dogs[dogIndex], ...updates };
      return { ...a, dogs };
    });
  };

  const startInlineEdit = (ref: EditRef) => {
    setEditingAt(ref);
    if (ref.step === 'intro') {
      setTempInput(answers.userName);
    } else if (ref.step === 'contact' || ref.step === 'priority_contact') {
      setTempInput(answers.email);
    } else if (ref.step === 'city' || ref.step === 'priority_city') {
      setTempInput(answers.city);
      setCitySearch(answers.city);
    } else if (ref.step === 'dog' && ref.dogIndex != null) {
      const d = answers.dogs[ref.dogIndex];
      const substepIdx = ref.substep ?? 0;
      if (substepIdx === 0) setTempInput(d?.name || '');
      else if (substepIdx === 11 && d?.goal === 'custom') setTempInput(d?.goalCustom || '');
      else setTempInput('');
    }
  };

  const applyInlineEdit = (ref: EditRef, value: string | number) => {
    if (ref.step === 'intro') {
      setAnswers((a) => ({ ...a, userName: String(value) }));
    } else if (ref.step === 'contact' || ref.step === 'priority_contact') {
      setAnswers((a) => ({ ...a, email: String(value) }));
    } else if (ref.step === 'city' || ref.step === 'priority_city') {
      setAnswers((a) => ({ ...a, city: String(value) }));
    } else if (ref.step === 'quantity') {
      const n = typeof value === 'number' ? value : parseInt(String(value), 10);
      const count = Math.min(5, Math.max(1, n));
      const dogs = Array.from({ length: count }, (_, i) => answers.dogs[i] ?? getBlankDog());
      setAnswers((a) => ({ ...a, dogCount: count, dogs }));
    } else if (ref.step === 'dog' && ref.dogIndex != null) {
      const idx = ref.dogIndex;
      const substepIdx = ref.substep ?? 0;
      setAnswers((a) => {
        const dogs = [...a.dogs];
        while (dogs.length <= idx) dogs.push(getBlankDog());
        const dog = { ...dogs[idx] };
        if (substepIdx === 0) dog.name = String(value);
        else if (substepIdx === 2) dog.gender = String(value);
        else if (substepIdx === 3) dog.neutered = String(value);
        else if (substepIdx === 5) dog.weight = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
        else if (substepIdx === 6) dog.condition = String(value);
        else if (substepIdx === 7) dog.activity = String(value);
        else if (substepIdx === 8) dog.appetite = String(value);
        else if (substepIdx === 9) dog.diet = String(value);
        else if (substepIdx === 11) {
          dog.goal = String(value);
          if (value === 'custom') dog.goalCustom = tempInput;
          else dog.goalCustom = '';
        }
        dogs[idx] = dog;
        return { ...a, dogs };
      });
    }
    setEditingAt(null);
    setTempInput('');
  };

  const applyInlineEditAge = (ref: EditRef, ageYears: number, ageMonths: number) => {
    if (ref.step !== 'dog' || ref.dogIndex == null) return;
    const idx = ref.dogIndex;
    setAnswers((a) => {
      const dogs = [...a.dogs];
      while (dogs.length <= idx) dogs.push(getBlankDog());
      dogs[idx] = { ...dogs[idx], ageYears, ageMonths };
      return { ...a, dogs };
    });
    setEditingAt(null);
  };

  const applyInlineEditBreed = (ref: EditRef, breed: BreedItem | { id: 'custom'; nameKa: string; nameEn: string }) => {
    if (ref.step !== 'dog' || ref.dogIndex == null) return;
    const idx = ref.dogIndex;
    setAnswers((a) => {
      const dogs = [...a.dogs];
      while (dogs.length <= idx) dogs.push(getBlankDog());
      dogs[idx] = { ...dogs[idx], breed };
      return { ...a, dogs };
    });
    setEditingAt(null);
    setBreedSearch('');
  };

  const applyInlineEditHealth = (ref: EditRef, healthIds: string[]) => {
    if (ref.step !== 'dog' || ref.dogIndex == null) return;
    const idx = ref.dogIndex;
    setAnswers((a) => {
      const dogs = [...a.dogs];
      while (dogs.length <= idx) dogs.push(getBlankDog());
      dogs[idx] = { ...dogs[idx], healthIds, healthStepCompleted: true };
      return { ...a, dogs };
    });
    setEditingAt(null);
  };

  const advanceStep = () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setEditingAt(null);
    if (step === 'intro') {
      const name = tempInput.trim();
      if (name) {
        setAnswers((a) => ({ ...a, userName: name }));
        setTempInput('');
        setStep('menu');
      }
    } else if (step === 'contact') {
      const email = tempInput.trim();
      const phone = (answers.phone || '').trim();
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && phone) {
        setAnswers((a) => ({ ...a, email }));
        setTempInput('');
        setStep('city');
      }
    } else if (step === 'city') {
      // Handled by city dropdown selection
    } else if (step === 'quantity') {
      // Handled by quantity buttons
    } else if (step === 'dog' && currentDog) {
      if (substep === 'goal') {
        if (dogIndex < answers.dogCount - 1) {
          setDogIndex(dogIndex + 1);
          setDogSubstep(0);
          setAnswers((a) => {
            const dogs = [...a.dogs];
            while (dogs.length <= dogIndex + 1) dogs.push(getBlankDog());
            return { ...a, dogs };
          });
        } else {
          setStep('offer');
          const finalAnswers: UserAnswers = {
            ...answers,
            dogs: answers.dogs.map((d, i) => (i === dogIndex ? { ...d, goal: currentDog.goal, goalCustom: currentDog.goalCustom } : d)),
          };
          setAnswers(finalAnswers);
          console.log('Aylopet Quiz Complete - User Answers:', finalAnswers);
          (async () => {
            try {
              await supabase.from('quiz_submissions').insert({
                user_name: finalAnswers.userName,
                email: finalAnswers.email,
                phone: finalAnswers.phone,
                city: finalAnswers.city,
                dog_count: finalAnswers.dogCount,
                dogs: JSON.stringify(finalAnswers.dogs),
                user_tier: 'early_bird',
                is_completed: false,
                submitted_at: new Date().toISOString(),
              });
              const { data: { user: authUser } } = await supabase.auth.getUser();
              if (authUser) {
                for (const d of finalAnswers.dogs) {
                  const breedName = d.breed ? (d.breed.id === 'custom' ? d.breed.nameKa : (lang === 'GE' ? d.breed.nameKa : d.breed.nameEn)) : null;
                  const healthText = (d.healthIds?.length ?? 0) === 0 ? null : d.healthIds.join(', ');
                  const goalVal = d.goal === 'custom' ? d.goalCustom : d.goal;
                  const { error } = await supabase.from('dogs').insert({
                    owner_id: authUser.id,
                    name: d.name || 'Unknown',
                    breed: breedName,
                    age_years: d.ageYears || 0,
                    age_months: d.ageMonths || 0,
                    gender: d.gender || null,
                    neutered: d.neutered || null,
                    current_weight: d.weight > 0 ? d.weight : null,
                    target_weight: d.weight > 0 ? d.weight : null,
                    body_condition: d.condition || null,
                    activity_level: d.activity || null,
                    appetite: d.appetite || null,
                    health_issues: healthText,
                    current_diet: d.diet || null,
                    diet_brand: d.dietBrand || null,
                    goal: goalVal || null,
                    phone_number: finalAnswers.phone || null,
                  });
                  if (error) console.warn('Dogs insert:', error.message);
                }
              }
            } catch (e) {
              console.warn('Supabase insert failed:', e);
            }
          })();
        }
      } else {
        setDogSubstep((prev) => prev + 1);
      }
    }
    setTimeout(() => { isProcessingRef.current = false; }, 150);
  };

  const advanceDogSubstep = (extra?: () => void) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setEditingAt(null);
    extra?.();
    setDogSubstep((prev) => prev + 1);
    setTimeout(() => { isProcessingRef.current = false; }, 150);
  };

  const handleQuantitySelect = (n: number) => {
    const count = n > 5 ? 5 : n;
    setEditingAt(null);
    const dogs = Array.from({ length: count }, getBlankDog);
    setAnswers({ ...answers, dogCount: count, dogs });
    setStep('dog');
    setDogIndex(0);
    setDogSubstep(0);
  };

  const getMessage = (): string => {
    if (step === 'intro') return t.step1;
    if (step === 'menu') return t.stepMenuGreeting.replace('{userName}', answers.userName || '');
    if (step === 'contact') return t.step2.replace('{userName}', answers.userName || '');
    if (step === 'priority_contact') {
      if (ambassadorPath === 'ambassador' && answers.city === 'other') {
        return t.cityWaitlistMsg + '\n\n' + t.ambassadorContactStep;
      }
      return t.ambassadorContactStep;
    }
    if (step === 'city') return t.stepCity;
    if (step === 'quantity') return t.step3;
    if (step === 'offer') {
      const dogName = answers.dogs[0]?.name || (lang === 'GE' ? 'თქვენი ძაღლი' : 'your dog');
      const cityKey = normalizeCityKey(answers.city);
      const msg = isDeliveryCity(cityKey) ? t.offer : t.offerWaitlist;
      return msg.replace(/\{dogName\}/g, dogName);
    }
    if (step === 'closing') return t.closingNo;
    if (step === 'priority_city') return ambassadorPath === 'ambassador' ? t.ambassadorCityQuestion : t.stepCity;
    if (step === 'priority_done') return t.priorityDone;
    if (step === 'early_bird_redirect') return t.earlyBirdRedirectMsg;
    if (step === 'dog' && currentDog) {
      const name = currentDog.name || '';
      const msg: Record<string, string> = {
        name: t.dogName,
        age: t.dogAge.replace('{dogName}', name),
        gender: t.dogGender.replace('{dogName}', name),
        status: t.dogStatus.replace('{dogName}', name),
        breed: t.dogBreed.replace('{dogName}', name),
        weight: t.dogWeight.replace('{dogName}', name),
        condition: t.dogCondition.replace('{dogName}', name),
        activity: t.dogActivity.replace('{dogName}', name),
        appetite: t.dogAppetite.replace('{dogName}', name),
        diet: t.dogDiet.replace('{dogName}', name),
        health: t.dogHealth.replace('{dogName}', name),
        goal: t.dogGoal.replace('{dogName}', name),
      };
      return msg[substep] ?? '';
    }
    return '';
  };

  const getChatHistory = (): { role: 'bot' | 'user'; text: string; stepRef?: EditRef }[] => {
    const out: { role: 'bot' | 'user'; text: string; stepRef?: EditRef }[] = [];
    if (answers.userName) {
      out.push({ role: 'bot', text: t.step1 });
      out.push({ role: 'user', text: answers.userName, stepRef: { step: 'intro' } });
    }
    const isPriorityPath = ['priority_greeting', 'priority_contact', 'priority_city', 'priority_done', 'early_bird_redirect'].includes(step);
    const isQuizPath = ['contact', 'city', 'quantity', 'dog', 'offer', 'closing'].includes(step) || answers.dogCount > 0;
    if (answers.userName && (isQuizPath || isPriorityPath)) {
      out.push({ role: 'bot', text: t.stepMenuGreeting.replace('{userName}', answers.userName) });
      out.push({ role: 'user', text: isPriorityPath ? t.menuBtnB : t.menuBtnA });
    }
    if (answers.email) {
      out.push({ role: 'bot', text: t.step2.replace('{userName}', answers.userName) });
      out.push({
        role: 'user',
        text: answers.email + (answers.phone ? ` / ${answers.phone}` : ''),
        stepRef: { step: isPriorityPath ? 'priority_contact' : 'contact' },
      });
    }
    if (answers.city) {
      out.push({ role: 'bot', text: t.stepCity });
      out.push({
        role: 'user',
        text: getCityDisplayName(answers.city, lang),
        stepRef: { step: isPriorityPath ? 'priority_city' : 'city' },
      });
    }
    if (isPriorityPath && answers.city) {
      return out;
    }
    if (answers.dogCount > 0) {
      out.push({ role: 'bot', text: t.step3 });
      out.push({ role: 'user', text: String(answers.dogCount === 5 ? '5+' : answers.dogCount), stepRef: { step: 'quantity' } });
    }
    for (let i = 0; i < answers.dogCount; i++) {
      const d = answers.dogs[i];
      if (!d) break;
      if (i > 0 && !answers.dogs[i - 1]?.goal) break;
      if (d.name) {
        out.push({ role: 'bot', text: t.dogName });
        out.push({ role: 'user', text: d.name, stepRef: { step: 'dog', dogIndex: i, substep: 0 } });
      }
      if (d.name && (d.ageYears > 0 || d.ageMonths > 0)) {
        out.push({ role: 'bot', text: t.dogAge.replace('{dogName}', d.name) });
        out.push({ role: 'user', text: `${d.ageYears} ${t.years} ${d.ageMonths} ${t.months}`, stepRef: { step: 'dog', dogIndex: i, substep: 1 } });
      }
      if (d.gender) {
        out.push({ role: 'bot', text: t.dogGender.replace('{dogName}', d.name) });
        out.push({ role: 'user', text: d.gender === 'male' ? t.male : t.female, stepRef: { step: 'dog', dogIndex: i, substep: 2 } });
      }
      if (d.neutered) {
        out.push({ role: 'bot', text: t.dogStatus.replace('{dogName}', d.name) });
        out.push({ role: 'user', text: d.neutered === 'yes' ? t.yes : t.no, stepRef: { step: 'dog', dogIndex: i, substep: 3 } });
      }
      if (d.breed) {
        out.push({ role: 'bot', text: t.dogBreed.replace('{dogName}', d.name) });
        const breedName = d.breed.id === 'custom' ? d.breed.nameKa : (lang === 'GE' ? d.breed.nameKa : d.breed.nameEn);
        out.push({ role: 'user', text: breedName, stepRef: { step: 'dog', dogIndex: i, substep: 4 } });
      }
      if (d.breed && d.weight != null && d.weight > 0) {
        out.push({ role: 'bot', text: t.dogWeight.replace('{dogName}', d.name) });
        out.push({ role: 'user', text: `${d.weight} ${t.kg}`, stepRef: { step: 'dog', dogIndex: i, substep: 5 } });
      }
      if (d.condition) {
        out.push({ role: 'bot', text: t.dogCondition.replace('{dogName}', d.name) });
        const c: Record<string, string> = { 'very-thin': t.condition1, ideal: t.condition2, rounded: t.condition3, overweight: t.condition4 };
        out.push({ role: 'user', text: c[d.condition] || d.condition, stepRef: { step: 'dog', dogIndex: i, substep: 6 } });
      }
      if (d.activity) {
        out.push({ role: 'bot', text: t.dogActivity.replace('{dogName}', d.name) });
        const a: Record<string, string> = { 'not-active': t.activity1, active: t.activity2, 'super-active': t.activity3, athlete: t.activity4 };
        out.push({ role: 'user', text: a[d.activity] || d.activity, stepRef: { step: 'dog', dogIndex: i, substep: 7 } });
      }
      if (d.appetite) {
        out.push({ role: 'bot', text: t.dogAppetite.replace('{dogName}', d.name) });
        const ap: Record<string, string> = { picks: t.appetite1, 'may-pick': t.appetite2, 'eats-well': t.appetite3, 'eats-all': t.appetite4 };
        out.push({ role: 'user', text: ap[d.appetite] || d.appetite, stepRef: { step: 'dog', dogIndex: i, substep: 8 } });
      }
      if (d.diet) {
        out.push({ role: 'bot', text: t.dogDiet.replace('{dogName}', d.name) });
        const dt: Record<string, string> = { dry: t.diet1, wet: t.diet2, raw: t.diet3, dried: t.diet4, 'fresh-food': t.diet5 };
        out.push({ role: 'user', text: dt[d.diet] || d.diet, stepRef: { step: 'dog', dogIndex: i, substep: 9 } });
      }
      if (d.goal) {
        out.push({ role: 'bot', text: t.dogHealth.replace('{dogName}', d.name) });
        const healthText = (d.healthIds?.length ?? 0) === 0 ? t.noIssues : d.healthIds.map((id) => {
          const dx = diseases.find((x) => x.id === id);
          return dx ? (lang === 'GE' ? dx.nameKa : dx.nameEn) : id.replace('custom:', '');
        }).join(', ');
        out.push({ role: 'user', text: healthText, stepRef: { step: 'dog', dogIndex: i, substep: 10 } });
        out.push({ role: 'bot', text: t.dogGoal.replace('{dogName}', d.name) });
        const g: Record<string, string> = { 'weight-loss': t.goal1, maintenance: t.goal2, 'weight-gain': t.goal3, 'fix-pickiness': t.goal4 };
        out.push({ role: 'user', text: d.goal === 'custom' ? (d.goalCustom || t.goalCustom) : (g[d.goal] || d.goal), stepRef: { step: 'dog', dogIndex: i, substep: 11 } });
      }
    }
    return out;
  };

  const chip = (label: string, value: string, onClick: () => void, selected?: boolean) => (
    <button
      key={value}
      type="button"
      onClick={onClick}
      className={`min-h-[44px] rounded-full px-4 py-2.5 text-sm font-medium transition md:py-3 ${
        selected ? 'bg-[#2d5a27] text-white' : 'bg-white text-[#2D3A2D] border border-[#D4E4D4] hover:border-[#2d5a27]/50 hover:bg-[#E8EFE8]'
      }`}
    >
      {label}
    </button>
  );

  const toggleDisease = (id: string) => {
    const ids = currentDog?.healthIds || [];
    const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
    updateCurrentDog({ healthIds: next });
  };

  const toggleDiseaseForDog = (dogIdx: number, id: string, currentIds: string[]) => {
    const next = currentIds.includes(id) ? currentIds.filter((x) => x !== id) : [...currentIds, id];
    setAnswers((a) => {
      const dogs = [...a.dogs];
      while (dogs.length <= dogIdx) dogs.push(getBlankDog());
      dogs[dogIdx] = { ...dogs[dogIdx], healthIds: next };
      return { ...a, dogs };
    });
  };

  const addCustomDisease = () => {
    const custom = tempInput.trim() || diseaseSearch.trim();
    if (custom) {
      const customId = `custom:${custom}`;
      const ids = currentDog?.healthIds || [];
      if (!ids.includes(customId)) updateCurrentDog({ healthIds: [...ids, customId] });
      setTempInput('');
      setDiseaseSearch('');
      setDiseaseDropdownOpen(false);
    }
  };

  const addCustomDiseaseForDog = (dogIdx: number, currentIds: string[]) => {
    const custom = tempInput.trim() || diseaseSearch.trim();
    if (custom) {
      const customId = `custom:${custom}`;
      if (!currentIds.includes(customId)) {
        setAnswers((a) => {
          const dogs = [...a.dogs];
          while (dogs.length <= dogIdx) dogs.push(getBlankDog());
          dogs[dogIdx] = { ...dogs[dogIdx], healthIds: [...currentIds, customId] };
          return { ...a, dogs };
        });
      }
      setTempInput('');
      setDiseaseSearch('');
      setDiseaseDropdownOpen(false);
    }
  };

  const removeDisease = (id: string) => {
    updateCurrentDog({ healthIds: (currentDog?.healthIds || []).filter((x) => x !== id) });
  };

  const removeDiseaseForDog = (dogIdx: number, id: string, currentIds: string[]) => {
    const next = currentIds.filter((x) => x !== id);
    setAnswers((a) => {
      const dogs = [...a.dogs];
      while (dogs.length <= dogIdx) dogs.push(getBlankDog());
      dogs[dogIdx] = { ...dogs[dogIdx], healthIds: next };
      return { ...a, dogs };
    });
  };

  const InlineEditUI = (props: {
    editRef: EditRef;
    currentText: string;
    answers: UserAnswers;
    tempInput: string;
    setTempInput: (v: string) => void;
    setAnswers: React.Dispatch<React.SetStateAction<UserAnswers>>;
    applyInlineEdit: (ref: EditRef, value: string | number) => void;
    applyInlineEditAge: (ref: EditRef, y: number, m: number) => void;
    applyInlineEditBreed: (ref: EditRef, breed: BreedItem | { id: 'custom'; nameKa: string; nameEn: string }) => void;
    applyInlineEditHealth: (ref: EditRef, healthIds: string[]) => void;
    setEditingAt: (v: EditRef | null) => void;
    t: Record<string, string>;
    lang: Lang;
    chip: (label: string, value: string, onClick: () => void, selected?: boolean) => React.ReactNode;
    getBlankDog: () => DogProfile;
    breeds: BreedItem[];
    breedResults: BreedItem[];
    breedSearch: string;
    setBreedSearch: (v: string) => void;
    breedDropdownOpen: boolean;
    setBreedDropdownOpen: (v: boolean) => void;
    diseases: DiseaseItem[];
    diseaseResults: DiseaseItem[];
    diseaseSearch: string;
    setDiseaseSearch: (v: string) => void;
    diseaseDropdownOpen: boolean;
    setDiseaseDropdownOpen: (v: boolean) => void;
    MIXED_BREED: BreedItem;
    toggleDiseaseForDog: (idx: number, id: string, ids: string[]) => void;
    addCustomDiseaseForDog: (idx: number, ids: string[]) => void;
    removeDiseaseForDog: (idx: number, id: string, ids: string[]) => void;
  }) => {
    const { editRef, tempInput, setTempInput, applyInlineEdit, applyInlineEditAge, applyInlineEditBreed, applyInlineEditHealth, setEditingAt, t, lang, chip } = props;
    const d = editRef.dogIndex != null ? props.answers.dogs[editRef.dogIndex] : null;
    const substep = editRef.substep ?? 0;

    const inputCls = 'rounded-xl border border-[#D4E4D4] bg-white px-3 py-2 text-sm text-[#2D3A2D] placeholder:text-[#8a9a8a] focus:border-[#2d5a27] focus:outline-none';
    const btnCls = 'rounded-lg bg-[#2d5a27] px-3 py-2 text-sm font-semibold text-white hover:bg-[#3a6b33]';

    if (editRef.step === 'intro') {
      return (
        <div className="max-w-[85%] rounded-2xl rounded-br-none bg-[#E8EFE8] border border-[#D4E4D4] p-3 flex gap-2">
          <input type="text" value={tempInput} onChange={(e) => setTempInput(e.target.value)} placeholder={t.namePlaceholder} className={`flex-1 ${inputCls}`} />
          <button onClick={() => tempInput.trim() && applyInlineEdit(editRef, tempInput.trim())} className={btnCls}>✓</button>
          <button onClick={() => setEditingAt(null)} className="rounded-lg border border-[#D4E4D4] px-3 py-2 text-sm text-[#2D3A2D]">✕</button>
        </div>
      );
    }
    if (editRef.step === 'contact' || editRef.step === 'priority_contact') {
      return (
        <div className="max-w-[85%] rounded-2xl rounded-br-none bg-[#E8EFE8] border border-[#D4E4D4] p-3 flex gap-2">
          <input type="email" value={tempInput} onChange={(e) => setTempInput(e.target.value)} placeholder={t.emailPlaceholder} className={`flex-1 ${inputCls}`} />
          <button onClick={() => tempInput.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tempInput.trim()) && applyInlineEdit(editRef, tempInput.trim())} className={btnCls}>✓</button>
          <button onClick={() => setEditingAt(null)} className="rounded-lg border border-[#D4E4D4] px-3 py-2 text-sm text-[#2D3A2D]">✕</button>
        </div>
      );
    }
    if (editRef.step === 'city' || editRef.step === 'priority_city') {
      return (
        <div className="max-w-[85%] rounded-2xl rounded-br-none bg-[#E8EFE8] border border-[#D4E4D4] p-3 flex flex-wrap gap-2">
          {CITY_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => applyInlineEdit(editRef, opt.key)}
              className={`min-h-[36px] rounded-full px-4 text-sm font-semibold transition ${tempInput === opt.key ? 'bg-[#2d5a27] text-white' : 'bg-white border border-[#D4E4D4] text-[#2D3A2D] hover:bg-[#E8EFE8]'}`}
            >
              {lang === 'GE' ? opt.nameGe : opt.nameEn}
            </button>
          ))}
          <button onClick={() => setEditingAt(null)} className="rounded-lg border border-[#D4E4D4] px-3 py-2 text-sm text-[#2D3A2D]">✕</button>
        </div>
      );
    }
    if (editRef.step === 'quantity') {
      return (
        <div className="max-w-[85%] rounded-2xl rounded-br-none bg-[#E8EFE8] border border-[#D4E4D4] p-3 flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => applyInlineEdit(editRef, n)} className="min-h-[36px] rounded-full bg-white border border-[#D4E4D4] px-4 text-sm font-semibold text-[#2D3A2D] hover:bg-[#E8EFE8]">
              {n === 5 ? '5+' : n}
            </button>
          ))}
          <button onClick={() => setEditingAt(null)} className="rounded-lg border border-[#D4E4D4] px-3 py-2 text-sm text-[#2D3A2D]">✕</button>
        </div>
      );
    }
    if (editRef.step === 'dog' && editRef.dogIndex != null) {
      const idx = editRef.dogIndex;
      if (substep === 0) {
        return (
          <div className="max-w-[85%] rounded-2xl rounded-br-none bg-[#E8EFE8] border border-[#D4E4D4] p-3 flex gap-2">
            <input type="text" value={tempInput} onChange={(e) => setTempInput(e.target.value)} placeholder={t.dogName} className={`flex-1 ${inputCls}`} />
            <button onClick={() => tempInput.trim() && applyInlineEdit(editRef, tempInput.trim())} className={btnCls}>✓</button>
            <button onClick={() => setEditingAt(null)} className="rounded-lg border border-[#D4E4D4] px-3 py-2 text-sm text-[#2D3A2D]">✕</button>
          </div>
        );
      }
      if (substep === 1) {
        const y = d?.ageYears ?? 0;
        const m = d?.ageMonths ?? 0;
        return (
          <div className="max-w-[85%] rounded-2xl rounded-br-none bg-[#E8EFE8] border border-[#D4E4D4] p-3 flex flex-wrap items-center gap-2">
            <input type="number" min={0} max={25} value={y || ''} onChange={(e) => props.setAnswers((a) => { const dogs = [...a.dogs]; while (dogs.length <= idx) dogs.push(props.getBlankDog()); dogs[idx] = { ...dogs[idx], ageYears: parseInt(e.target.value, 10) || 0 }; return { ...a, dogs }; })} className={`w-16 ${inputCls}`} placeholder="0" />
            <span className="text-sm text-[#5a6b5a]">{t.years}</span>
            <input type="number" min={0} max={11} value={m || ''} onChange={(e) => props.setAnswers((a) => { const dogs = [...a.dogs]; while (dogs.length <= idx) dogs.push(props.getBlankDog()); dogs[idx] = { ...dogs[idx], ageMonths: parseInt(e.target.value, 10) || 0 }; return { ...a, dogs }; })} className={`w-16 ${inputCls}`} placeholder="0" />
            <span className="text-sm text-[#5a6b5a]">{t.months}</span>
            <button onClick={() => applyInlineEditAge(editRef, d?.ageYears ?? 0, d?.ageMonths ?? 0)} className={btnCls}>✓</button>
            <button onClick={() => setEditingAt(null)} className="rounded-lg border border-[#D4E4D4] px-3 py-2 text-sm text-[#2D3A2D]">✕</button>
          </div>
        );
      }
      if (substep === 2) return (
        <div className="max-w-[85%] rounded-2xl rounded-br-none bg-[#E8EFE8] border border-[#D4E4D4] p-3 flex flex-wrap gap-2">
          {chip(t.male, 'male', () => applyInlineEdit(editRef, 'male'), d?.gender === 'male')}
          {chip(t.female, 'female', () => applyInlineEdit(editRef, 'female'), d?.gender === 'female')}
          <button onClick={() => setEditingAt(null)} className="rounded-lg border border-[#D4E4D4] px-3 py-2 text-sm text-[#2D3A2D]">✕</button>
        </div>
      );
      if (substep === 3) return (
        <div className="max-w-[85%] rounded-2xl rounded-br-none bg-[#E8EFE8] border border-[#D4E4D4] p-3 flex flex-wrap gap-2">
          {chip(t.yes, 'yes', () => applyInlineEdit(editRef, 'yes'), d?.neutered === 'yes')}
          {chip(t.no, 'no', () => applyInlineEdit(editRef, 'no'), d?.neutered === 'no')}
          <button onClick={() => setEditingAt(null)} className="rounded-lg border border-[#D4E4D4] px-3 py-2 text-sm text-[#2D3A2D]">✕</button>
        </div>
      );
      if (substep === 4) {
        return (
          <div className="max-w-[85%] rounded-2xl rounded-br-none bg-[#E8EFE8] border border-[#D4E4D4] p-3 flex flex-wrap gap-2 relative">
            <input type="text" value={props.breedSearch} onChange={(e) => { props.setBreedSearch(e.target.value); props.setBreedDropdownOpen(true); }} onFocus={() => props.setBreedDropdownOpen(true)} onBlur={() => setTimeout(() => props.setBreedDropdownOpen(false), 150)} placeholder={t.breedPlaceholder} className={`flex-1 min-w-[140px] ${inputCls}`} />
            {props.breedDropdownOpen && (
              <div className="absolute left-3 right-3 top-full z-50 mt-1 max-h-40 overflow-y-auto rounded-xl border border-[#D4E4D4] bg-white shadow-lg">
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { applyInlineEditBreed(editRef, props.MIXED_BREED); props.setBreedDropdownOpen(false); }} className="w-full px-4 py-2 text-left text-sm font-medium text-[#2D3A2D] hover:bg-[#E8EFE8]">{lang === 'GE' ? props.MIXED_BREED.nameKa : props.MIXED_BREED.nameEn}</button>
                {props.breedResults.map((b) => (
                  <button key={b.id} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { applyInlineEditBreed(editRef, b); props.setBreedDropdownOpen(false); }} className="w-full px-4 py-2 text-left text-sm font-medium text-[#2D3A2D] hover:bg-[#E8EFE8]">{lang === 'GE' ? b.nameKa : b.nameEn}</button>
                ))}
              </div>
            )}
            <button onClick={() => setEditingAt(null)} className="rounded-lg border border-[#D4E4D4] px-3 py-2 text-sm text-[#2D3A2D]">✕</button>
          </div>
        );
      }
      if (substep === 5) {
        const w = d?.weight ?? 0;
        return (
          <div className="max-w-[85%] rounded-2xl rounded-br-none bg-[#E8EFE8] border border-[#D4E4D4] p-3 flex gap-2">
            <input type="number" min={0} step={0.1} value={w > 0 ? w : ''} onChange={(e) => props.setAnswers((a) => { const dogs = [...a.dogs]; while (dogs.length <= idx) dogs.push(props.getBlankDog()); dogs[idx] = { ...dogs[idx], weight: parseFloat(e.target.value) || 0 }; return { ...a, dogs }; })} placeholder={t.weightPlaceholder} className={`w-24 ${inputCls}`} />
            <button onClick={() => w > 0 && applyInlineEdit(editRef, w)} className={btnCls}>✓</button>
            <button onClick={() => setEditingAt(null)} className="rounded-lg border border-[#D4E4D4] px-3 py-2 text-sm text-[#2D3A2D]">✕</button>
          </div>
        );
      }
      if (substep === 6) return (
        <div className="max-w-[85%] rounded-2xl rounded-br-none bg-[#E8EFE8] border border-[#D4E4D4] p-3 flex flex-wrap gap-2">
          {[['very-thin', t.condition1], ['ideal', t.condition2], ['rounded', t.condition3], ['overweight', t.condition4]].map(([val, label]) => chip(label as string, val as string, () => applyInlineEdit(editRef, val as string), d?.condition === val))}
          <button onClick={() => setEditingAt(null)} className="rounded-lg border border-[#D4E4D4] px-3 py-2 text-sm text-[#2D3A2D]">✕</button>
        </div>
      );
      if (substep === 7) return (
        <div className="max-w-[85%] rounded-2xl rounded-br-none bg-[#E8EFE8] border border-[#D4E4D4] p-3 flex flex-wrap gap-2">
          {[['not-active', t.activity1], ['active', t.activity2], ['super-active', t.activity3], ['athlete', t.activity4]].map(([val, label]) => chip(label as string, val as string, () => applyInlineEdit(editRef, val as string), d?.activity === val))}
          <button onClick={() => setEditingAt(null)} className="rounded-lg border border-[#D4E4D4] px-3 py-2 text-sm text-[#2D3A2D]">✕</button>
        </div>
      );
      if (substep === 8) return (
        <div className="max-w-[85%] rounded-2xl rounded-br-none bg-[#E8EFE8] border border-[#D4E4D4] p-3 flex flex-wrap gap-2">
          {[['picks', t.appetite1], ['may-pick', t.appetite2], ['eats-well', t.appetite3], ['eats-all', t.appetite4]].map(([val, label]) => chip(label as string, val as string, () => applyInlineEdit(editRef, val as string), d?.appetite === val))}
          <button onClick={() => setEditingAt(null)} className="rounded-lg border border-[#D4E4D4] px-3 py-2 text-sm text-[#2D3A2D]">✕</button>
        </div>
      );
      if (substep === 9) return (
        <div className="max-w-[85%] rounded-2xl rounded-br-none bg-[#E8EFE8] border border-[#D4E4D4] p-3 flex flex-wrap gap-2">
          {[['dry', t.diet1], ['wet', t.diet2], ['raw', t.diet3], ['dried', t.diet4], ['fresh-food', t.diet5]].map(([val, label]) => chip(label as string, val as string, () => applyInlineEdit(editRef, val as string), d?.diet === val))}
          <button onClick={() => setEditingAt(null)} className="rounded-lg border border-[#D4E4D4] px-3 py-2 text-sm text-[#2D3A2D]">✕</button>
        </div>
      );
      if (substep === 10) {
        const ids = d?.healthIds ?? [];
        return (
          <div className="max-w-[85%] rounded-2xl rounded-br-none bg-[#E8EFE8] border border-[#D4E4D4] p-3 space-y-2">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => applyInlineEditHealth(editRef, [])} className={`min-h-[36px] rounded-full px-4 text-sm font-medium ${ids.length === 0 ? 'bg-[#2d5a27] text-white' : 'bg-white border border-[#D4E4D4] text-[#2D3A2D]'}`}>{t.noIssues}</button>
            </div>
            <div className="relative">
              <input type="text" value={props.diseaseSearch} onChange={(e) => { props.setDiseaseSearch(e.target.value); props.setDiseaseDropdownOpen(true); }} placeholder={t.healthPlaceholder} className={`w-full ${inputCls}`} />
              {props.diseaseDropdownOpen && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-36 overflow-y-auto rounded-xl border border-[#D4E4D4] bg-white shadow-lg">
                  {props.diseaseResults.map((dx) => (
                    <button key={dx.id} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => props.toggleDiseaseForDog(idx, dx.id, ids)} className={`w-full px-4 py-2 text-left text-sm ${ids.includes(dx.id) ? 'bg-[#E8EFE8] text-[#2d5a27]' : 'text-[#2D3A2D]'}`}>{lang === 'GE' ? dx.nameKa : dx.nameEn} {ids.includes(dx.id) ? '✓' : ''}</button>
                  ))}
                  <div className="flex gap-2 border-t border-[#D4E4D4] p-2">
                    <input type="text" value={tempInput} onChange={(e) => setTempInput(e.target.value)} placeholder={lang === 'GE' ? 'საკუთარი' : 'Custom'} className={`flex-1 ${inputCls}`} />
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => props.addCustomDiseaseForDog(idx, ids)} className={btnCls}>+</button>
                  </div>
                </div>
              )}
            </div>
            {ids.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {ids.map((id) => {
                  const dx = props.diseases.find((x) => x.id === id) || { nameKa: id.replace('custom:', ''), nameEn: id.replace('custom:', '') };
                  return (
                    <span key={id} className="inline-flex items-center gap-1 rounded-full bg-[#2d5a27] px-3 py-1 text-sm text-white">
                      {lang === 'GE' ? dx.nameKa : dx.nameEn}
                      <button type="button" onClick={() => props.removeDiseaseForDog(idx, id, ids)} className="ml-1 font-bold hover:opacity-80">×</button>
                    </span>
                  );
                })}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => applyInlineEditHealth(editRef, ids)} className={btnCls}>✓</button>
              <button onClick={() => setEditingAt(null)} className="rounded-lg border border-[#D4E4D4] px-3 py-2 text-sm text-[#2D3A2D]">✕</button>
            </div>
          </div>
        );
      }
      if (substep === 11) {
        const setGoalCustom = () => {
          props.setAnswers((a) => {
            const dogs = [...a.dogs];
            while (dogs.length <= idx) dogs.push(props.getBlankDog());
            dogs[idx] = { ...dogs[idx], goal: 'custom', goalCustom: tempInput };
            return { ...a, dogs };
          });
          setEditingAt(null);
          setTempInput('');
        };
        return (
          <div className="max-w-[85%] rounded-2xl rounded-br-none bg-[#E8EFE8] border border-[#D4E4D4] p-3 flex flex-wrap gap-2 items-center">
            <>
              {[['weight-loss', t.goal1], ['maintenance', t.goal2], ['weight-gain', t.goal3], ['fix-pickiness', t.goal4]].map(([val, label]) => chip(label as string, val as string, () => applyInlineEdit(editRef, val as string), d?.goal === val))}
              <button onClick={() => { props.setAnswers((a) => { const dogs = [...a.dogs]; while (dogs.length <= idx) dogs.push(props.getBlankDog()); dogs[idx] = { ...dogs[idx], goal: 'custom' }; return { ...a, dogs }; }); setTempInput(d?.goalCustom || ''); }} className={`min-h-[36px] rounded-full px-4 text-sm font-medium ${d?.goal === 'custom' ? 'bg-[#2d5a27] text-white' : 'bg-white border border-[#D4E4D4] text-[#2D3A2D]'}`}>{t.goalCustom}</button>
            {d?.goal === 'custom' && (
              <>
                <input type="text" value={tempInput} onChange={(e) => setTempInput(e.target.value)} placeholder={t.goalCustomPlaceholder} className={`flex-1 min-w-[120px] ${inputCls}`} />
                <button onClick={setGoalCustom} className={btnCls}>✓</button>
              </>
            )}
              <button onClick={() => setEditingAt(null)} className="rounded-lg border border-[#D4E4D4] px-3 py-2 text-sm text-[#2D3A2D]">✕</button>
            </>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F5F0] bg-gradient-to-b from-[#D4E4D4] via-[#F5F5F0] to-[#F5F5F0] text-[#2D3A2D] selection:bg-[#2d5a27] selection:text-white">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-[#D4E4D4] bg-white/90 backdrop-blur-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#2d5a27] flex items-center justify-center font-bold text-white text-sm">A</div>
          <span className="text-sm font-semibold text-[#2D3A2D]">Aylopet · Smart Nutrition & Feeding</span>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <Link
              href="/profile"
              className="rounded-lg bg-[#E8EFE8] px-3 py-2 text-xs font-medium text-[#2D3A2D] border border-[#D4E4D4] hover:bg-[#D4E4D4]"
            >
              {t.myProfile}
            </Link>
          )}
          <button
            onClick={() => {
              const next = lang === 'GE' ? 'EN' : 'GE';
              setLang(next);
              localStorage.setItem(LANG_KEY, next);
              window.dispatchEvent(new CustomEvent('aylopet-lang-change'));
            }}
            className="rounded-lg bg-[#E8EFE8] px-3 py-2 text-xs font-medium text-[#2D3A2D] border border-[#D4E4D4] hover:bg-[#D4E4D4]"
          >
            {lang === 'GE' ? 'EN' : 'GE'}
          </button>
          <Link
            href="/"
            className="rounded-lg bg-[#2d5a27] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3a6b33] transition"
          >
            {t.exitBtn}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-24 pb-8">
        {!supabaseConfigured && (
          <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            {t.supabaseWarn}
          </div>
        )}
        <div className="flex flex-col gap-4">
          {getChatHistory().map((m, idx) => {
            const isEditingThis = m.stepRef && editingAt && editingAt.step === m.stepRef.step &&
              (m.stepRef.step !== 'dog' || (editingAt.dogIndex === m.stepRef.dogIndex && editingAt.substep === m.stepRef.substep));
            return (
              <div key={`msg-${idx}-${m.role}`} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'bot' ? (
                  <div className="max-w-[85%] rounded-2xl rounded-bl-none bg-[#E8EFE8] border border-[#D4E4D4] px-4 py-3">
                    <p className="text-[#2D3A2D]">{m.text}</p>
                  </div>
                ) : isEditingThis && m.stepRef ? (
                  <InlineEditUI
                    editRef={m.stepRef}
                    currentText={m.text}
                    answers={answers}
                    tempInput={tempInput}
                    setTempInput={setTempInput}
                    setAnswers={setAnswers}
                    applyInlineEdit={applyInlineEdit}
                    applyInlineEditAge={applyInlineEditAge}
                    applyInlineEditBreed={applyInlineEditBreed}
                    applyInlineEditHealth={applyInlineEditHealth}
                    setEditingAt={setEditingAt}
                    t={t}
                    lang={lang}
                    chip={chip}
                    getBlankDog={getBlankDog}
                    breeds={breeds}
                    breedResults={breedResults}
                    breedSearch={breedSearch}
                    setBreedSearch={setBreedSearch}
                    breedDropdownOpen={breedDropdownOpen}
                    setBreedDropdownOpen={setBreedDropdownOpen}
                    diseases={diseases}
                    diseaseResults={diseaseResults}
                    diseaseSearch={diseaseSearch}
                    setDiseaseSearch={setDiseaseSearch}
                    diseaseDropdownOpen={diseaseDropdownOpen}
                    setDiseaseDropdownOpen={setDiseaseDropdownOpen}
                    MIXED_BREED={MIXED_BREED}
                    toggleDiseaseForDog={toggleDiseaseForDog}
                    addCustomDiseaseForDog={addCustomDiseaseForDog}
                    removeDiseaseForDog={removeDiseaseForDog}
                  />
                ) : (
                  <div
                    className="group max-w-[85%] rounded-2xl rounded-br-none bg-[#2d5a27] border border-[#2d5a27] px-4 py-3 flex items-center gap-2 cursor-pointer hover:ring-2 hover:ring-[#2d5a27]/30 transition"
                    onClick={m.stepRef ? () => startInlineEdit(m.stepRef!) : undefined}
                  >
                    <p className="text-white flex-1">{m.text}</p>
                    {m.stepRef && (
                      <span className="inline-flex items-center justify-center rounded-full bg-white/20 p-1 group-hover:bg-white/30 transition-colors">
                        <Pencil className="w-3.5 h-3.5 text-[#2D5A27]" strokeWidth={2} />
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {!editingAt && step !== 'offer' && step !== 'closing' && step !== 'menu' && step !== 'priority_done' && step !== 'priority_greeting' && step !== 'early_bird_redirect' && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-bl-none bg-[#E8EFE8] border border-[#D4E4D4] px-4 py-3">
                <p className="text-[#2D3A2D]">{getMessage()}</p>
              </div>
            </div>
          )}

          {step === 'offer' && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-none bg-[#E8EFE8] border border-[#D4E4D4] px-4 py-3">
                  <p className="text-[#2D3A2D] font-medium">{getMessage()}</p>
                </div>
              </div>
              <div className="flex justify-start gap-2">
                <button
                  onClick={async () => {
                    if (user) {
                      setOfferLoading(true);
                      try {
                        await supabase.rpc('generate_promo_code_for_user', { p_user_id: user.id, p_city: answers.city || null, p_tier: 'early_bird' });
                        window.dispatchEvent(new CustomEvent('promo-updated'));
                        router.push('/profile');
                      } catch (e) {
                        console.warn('Promo RPC failed:', e);
                        setOfferLoading(false);
                      }
                    } else {
                      sessionStorage.setItem('aylopet-pending-signup', JSON.stringify({
                        userName: answers.userName,
                        email: answers.email,
                        phone: answers.phone,
                        city: answers.city,
                        dogs: answers.dogs,
                        dogCount: answers.dogCount,
                        lang,
                        user_tier: 'early_bird',
                      }));
                      router.push('/?auth=signup');
                    }
                  }}
                  disabled={offerLoading}
                  className="inline-flex items-center justify-center rounded-xl bg-[#2d5a27] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#3a6b33] transition disabled:opacity-70"
                >
                  {offerLoading ? '...' : t.offerYes}
                </button>
                <button
                  onClick={() => setStep('closing')}
                  className="inline-flex items-center justify-center rounded-xl border border-[#D4E4D4] bg-white px-6 py-3 text-sm font-semibold text-[#2D3A2D] hover:bg-[#E8EFE8] transition"
                >
                  {t.offerNo}
                </button>
              </div>
            </div>
          )}

          {step === 'closing' && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-bl-none bg-[#E8EFE8] border border-[#D4E4D4] px-4 py-3">
                <p className="text-[#2D3A2D] font-medium">{t.closingNo}</p>
              </div>
            </div>
          )}

          {step === 'priority_greeting' && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-none bg-[#E8EFE8] border border-[#D4E4D4] px-4 py-3 space-y-2">
                  <p className="text-[#2D3A2D] font-medium">{t.ambassadorGreeting.replace('{userName}', answers.userName || '')}</p>
                  <ul className="list-none space-y-1.5 text-sm text-[#5a6b5a]">
                    <li>{t.ambassadorPackage1}</li>
                    <li>{t.ambassadorPackage2}</li>
                    <li>{t.ambassadorPackage3}</li>
                    <li>{t.ambassadorPackage4}</li>
                    <li>{t.ambassadorPackage5}</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => setStep('priority_city')}
                className="inline-flex items-center justify-center rounded-xl bg-[#2d5a27] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#3a6b33] transition w-fit"
              >
                →
              </button>
            </div>
          )}

          {step === 'early_bird_redirect' && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-none bg-[#E8EFE8] border border-[#D4E4D4] px-4 py-3">
                  <p className="text-[#2D3A2D] font-medium">{t.earlyBirdRedirectMsg}</p>
                </div>
              </div>
              <button
                onClick={() => setStep('priority_contact')}
                className="inline-flex items-center justify-center rounded-xl bg-[#2d5a27] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#3a6b33] transition w-fit"
              >
                →
              </button>
            </div>
          )}

          {step === 'menu' && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-none bg-[#E8EFE8] border border-[#D4E4D4] px-4 py-3">
                  <p className="text-[#2D3A2D] font-medium">{getMessage()}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setStep('contact')}
                  className="inline-flex items-center justify-center rounded-xl bg-[#2d5a27] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#3a6b33] transition text-left"
                >
                  {t.menuBtnA}
                </button>
                <button
                  onClick={async () => {
                    try {
                      const { data: count } = await supabase.rpc('get_ambassador_count');
                      if ((count ?? 0) >= 100) {
                        setAmbassadorPath('early_bird');
                        setStep('early_bird_redirect');
                      } else {
                        setAmbassadorPath('ambassador');
                        setStep('priority_greeting');
                      }
                    } catch {
                      setAmbassadorPath('ambassador');
                      setStep('priority_greeting');
                    }
                  }}
                  className="inline-flex items-center justify-center rounded-xl border border-[#D4E4D4] bg-white px-6 py-3 text-sm font-semibold text-[#2D3A2D] hover:bg-[#E8EFE8] transition text-left"
                >
                  {t.menuBtnB}
                </button>
              </div>
            </div>
          )}

          {step === 'priority_done' && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-none bg-[#E8EFE8] border border-[#D4E4D4] px-4 py-3">
                  <p className="text-[#2D3A2D] font-medium">{t.priorityDone}</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  const tier = ambassadorPath === 'ambassador'
                    ? (['tbilisi', 'batumi', 'kutaisi'].includes(answers.city || '') ? 'honorary_ambassador' : 'city_waitlist')
                    : 'early_bird';
                  if (user) {
                    setOfferLoading(true);
                    try {
                      await supabase.rpc('generate_promo_code_for_user', {
                        p_user_id: user.id,
                        p_city: answers.city || null,
                        p_tier: tier,
                      });
                      window.dispatchEvent(new CustomEvent('promo-updated'));
                      router.push('/profile');
                    } catch (e) {
                      console.warn('Ambassador promo RPC failed:', e);
                      setOfferLoading(false);
                    }
                  } else {
                    sessionStorage.setItem('aylopet-pending-signup', JSON.stringify({
                      userName: answers.userName,
                      email: answers.email,
                      phone: answers.phone,
                      city: answers.city,
                      dogs: [],
                      dogCount: 0,
                      lang,
                      priority: true,
                      user_tier: tier,
                    }));
                    router.push('/?auth=signup');
                  }
                }}
                disabled={offerLoading}
                className="inline-flex items-center justify-center rounded-xl bg-[#2d5a27] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#3a6b33] transition w-fit disabled:opacity-70"
              >
                {offerLoading ? '...' : t.registerCta}
              </button>
            </div>
          )}

          <div className="flex flex-col gap-4 pt-2">
            {!editingAt && step === 'intro' && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempInput}
                  onChange={(e) => setTempInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && advanceStep()}
                  placeholder={t.namePlaceholder}
                  className="flex-1 rounded-xl border border-[#D4E4D4] bg-white px-4 py-3 text-[#2D3A2D] placeholder:text-[#8a9a8a] focus:border-[#2d5a27] focus:outline-none"
                />
                <button onClick={advanceStep} className="rounded-xl bg-[#2d5a27] px-6 py-3 font-semibold text-white hover:bg-[#3a6b33]">
                  →
                </button>
              </div>
            )}

            {!editingAt && (step === 'contact' || step === 'priority_contact') && (
              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  value={tempInput}
                  onChange={(e) => setTempInput(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full rounded-xl border border-[#D4E4D4] bg-white px-4 py-3 text-[#2D3A2D] placeholder:text-[#8a9a8a] focus:border-[#2d5a27] focus:outline-none"
                />
                <input
                  type="tel"
                  value={answers.phone}
                  onChange={(e) => setAnswers((a) => ({ ...a, phone: e.target.value }))}
                  placeholder={t.phonePlaceholder}
                  className="w-full rounded-xl border border-[#D4E4D4] bg-white px-4 py-3 text-[#2D3A2D] placeholder:text-[#8a9a8a] focus:border-[#2d5a27] focus:outline-none"
                />
                <button
                  onClick={async () => {
                    const email = tempInput.trim();
                    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
                    const phone = (answers.phone || '').trim();
                    if (step === 'priority_contact') {
                      if (!phone) return;
                      setAnswers((a) => ({ ...a, email, phone }));
                      setTempInput('');
                      if (ambassadorPath === 'early_bird') {
                        setStep('priority_city');
                      } else {
                        const ambassadorCity = ['tbilisi', 'batumi', 'kutaisi'].includes(answers.city || '');
                        try {
                          await supabase.from('quiz_submissions').insert({
                            user_name: answers.userName,
                            email,
                            phone: phone || null,
                            city: answers.city || null,
                            dog_count: 0,
                            dogs: null,
                            user_tier: ambassadorCity ? 'honorary_ambassador' : 'city_waitlist',
                            is_completed: ambassadorCity,
                            submitted_at: new Date().toISOString(),
                          });
                        } catch (e) {
                          console.warn('Ambassador quiz insert failed:', e);
                        }
                        setStep('priority_done');
                      }
                    } else {
                      setAnswers((a) => ({ ...a, email }));
                      setTempInput('');
                      setStep('city');
                    }
                  }}
                  disabled={
                    !tempInput.trim() ||
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tempInput.trim()) ||
                    !(answers.phone || '').trim()
                  }
                  className="rounded-xl bg-[#2d5a27] px-6 py-3 font-semibold text-white disabled:opacity-50 hover:bg-[#3a6b33] disabled:hover:bg-[#2d5a27]"
                >
                  →
                </button>
              </div>
            )}

            {!editingAt && (step === 'city' || step === 'priority_city') && (
              <div className="relative">
                {ambassadorPath === 'ambassador' && step === 'priority_city' ? (
                  <div className="flex flex-wrap gap-2">
                    {AMBASSADOR_CITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => {
                          setAnswers((a) => ({ ...a, city: opt.key }));
                          setStep('priority_contact');
                        }}
                        className="min-h-[44px] rounded-full bg-white border border-[#D4E4D4] px-5 py-2.5 text-sm font-semibold text-[#2D3A2D] hover:border-[#2d5a27] hover:bg-[#E8EFE8] md:py-3"
                      >
                        {lang === 'GE' ? opt.nameGe : opt.nameEn}
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={citySearch}
                      onChange={(e) => { setCitySearch(e.target.value); setCityDropdownOpen(true); }}
                      onFocus={() => setCityDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setCityDropdownOpen(false), 150)}
                      placeholder={t.cityPlaceholder}
                      className="w-full rounded-xl border border-[#D4E4D4] bg-white px-4 py-3 text-[#2D3A2D] placeholder:text-[#8a9a8a] focus:border-[#2d5a27] focus:outline-none"
                    />
                    {cityDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-[#D4E4D4] bg-white shadow-lg">
                        {cityFiltered.map((opt) => (
                          <button
                            key={opt.key}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={async () => {
                              const cityKey = opt.key;
                              setAnswers((a) => ({ ...a, city: cityKey }));
                              setCitySearch('');
                              setCityDropdownOpen(false);
                              if (step === 'priority_city' && ambassadorPath === 'early_bird') {
                                try {
                                  await supabase.from('quiz_submissions').insert({
                                    user_name: answers.userName,
                                    email: answers.email,
                                    phone: answers.phone || null,
                                    city: cityKey,
                                    dog_count: 0,
                                    dogs: null,
                                    user_tier: 'early_bird',
                                    is_completed: false,
                                    submitted_at: new Date().toISOString(),
                                  });
                                } catch (e) {
                                  console.warn('Early bird quiz insert failed:', e);
                                }
                                setStep('priority_done');
                              } else {
                                setStep('quantity');
                              }
                            }}
                            className="w-full px-4 py-3 text-left text-sm font-medium text-[#2D3A2D] hover:bg-[#E8EFE8] first:rounded-t-xl last:rounded-b-xl"
                          >
                            {lang === 'GE' ? opt.nameGe : opt.nameEn}
                          </button>
                        ))}
                        {cityFiltered.length === 0 && (
                          <div className="px-4 py-3 text-sm text-[#5a6b5a]">{lang === 'GE' ? 'შედეგები არ მოიძებნა' : 'No results found'}</div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {!editingAt && step === 'quantity' && (
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleQuantitySelect(n)}
                    className="min-h-[44px] rounded-full bg-white border border-[#D4E4D4] px-5 py-2.5 text-sm font-semibold text-[#2D3A2D] hover:border-[#2d5a27] hover:bg-[#E8EFE8] md:py-3"
                  >
                    {n === 5 ? '5+' : n}
                  </button>
                ))}
              </div>
            )}

            {!editingAt && step === 'dog' && currentDog && (
              <>
                {substep === 'name' && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempInput}
                      onChange={(e) => setTempInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (updateCurrentDog({ name: tempInput.trim() }), setTempInput(''), setEditingAt(null), setDogSubstep((prev) => prev + 1))}
                      placeholder={t.dogName}
                      className="flex-1 rounded-xl border border-[#D4E4D4] bg-white px-4 py-3 text-[#2D3A2D] placeholder:text-[#8a9a8a] focus:border-[#2d5a27] focus:outline-none"
                    />
                    <button
                      onClick={() => tempInput.trim() && (updateCurrentDog({ name: tempInput.trim() }), setTempInput(''), setEditingAt(null), setDogSubstep((prev) => prev + 1))}
                      className="rounded-xl bg-[#2d5a27] px-6 py-3 font-semibold text-white hover:bg-[#3a6b33]"
                    >
                      →
                    </button>
                  </div>
                )}

                {substep === 'age' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={25}
                      value={currentDog.ageYears === 0 ? '' : currentDog.ageYears}
                      onChange={(e) => updateCurrentDog({ ageYears: Math.max(0, Math.min(25, parseInt(e.target.value, 10) || 0)) })}
                      placeholder="0"
                      className="w-20 rounded-xl border border-[#D4E4D4] bg-white px-4 py-3 text-[#2D3A2D] placeholder:text-[#8a9a8a] focus:border-[#2d5a27] focus:outline-none"
                    />
                    <span className="text-sm text-[#5a6b5a]">{t.years}</span>
                    <input
                      type="number"
                      min={0}
                      max={11}
                      value={currentDog.ageMonths === 0 ? '' : currentDog.ageMonths}
                      onChange={(e) => updateCurrentDog({ ageMonths: Math.max(0, Math.min(11, parseInt(e.target.value, 10) || 0)) })}
                      placeholder="0"
                      className="w-20 rounded-xl border border-[#D4E4D4] bg-white px-4 py-3 text-[#2D3A2D] placeholder:text-[#8a9a8a] focus:border-[#2d5a27] focus:outline-none"
                    />
                    <span className="text-sm text-[#5a6b5a]">{t.months}</span>
                    <button
                      onClick={() => advanceDogSubstep()}
                      disabled={currentDog.ageYears === 0 && currentDog.ageMonths === 0}
                      className="rounded-xl bg-[#2d5a27] px-6 py-3 font-semibold text-white hover:bg-[#3a6b33] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#2d5a27]"
                    >
                      →
                    </button>
                  </div>
                )}

                {substep === 'gender' && (
                  <div className="flex flex-wrap gap-2">
                    {chip(t.male, 'male', () => { updateCurrentDog({ gender: 'male' }); setEditingAt(null); setDogSubstep((prev) => prev + 1); }, currentDog.gender === 'male')}
                    {chip(t.female, 'female', () => { updateCurrentDog({ gender: 'female' }); setEditingAt(null); setDogSubstep((prev) => prev + 1); }, currentDog.gender === 'female')}
                  </div>
                )}

                {substep === 'status' && (
                  <div className="flex flex-wrap gap-2">
                    {chip(t.yes, 'yes', () => { updateCurrentDog({ neutered: 'yes' }); setEditingAt(null); setDogSubstep((prev) => prev + 1); }, currentDog.neutered === 'yes')}
                    {chip(t.no, 'no', () => { updateCurrentDog({ neutered: 'no' }); setEditingAt(null); setDogSubstep((prev) => prev + 1); }, currentDog.neutered === 'no')}
                  </div>
                )}

                {substep === 'breed' && (
                  <div className="relative">
                    <input
                      type="text"
                      value={breedSearch}
                      onChange={(e) => { setBreedSearch(e.target.value); setBreedDropdownOpen(true); }}
                      onFocus={() => setBreedDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setBreedDropdownOpen(false), 150)}
                      placeholder={t.breedPlaceholder}
                      className="w-full rounded-xl border border-[#D4E4D4] bg-white px-4 py-3 text-[#2D3A2D] placeholder:text-[#8a9a8a] focus:border-[#2d5a27] focus:outline-none"
                    />
                    {breedDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-[#D4E4D4] bg-white shadow-lg">
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => { updateCurrentDog({ breed: MIXED_BREED }); setEditingAt(null); setBreedSearch(''); setBreedDropdownOpen(false); setDogSubstep((prev) => prev + 1); }}
                          className="w-full px-4 py-3 text-left text-sm font-medium text-[#2D3A2D] hover:bg-[#E8EFE8]"
                        >
                          {lang === 'GE' ? MIXED_BREED.nameKa : MIXED_BREED.nameEn}
                        </button>
                        {breedResults.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => { updateCurrentDog({ breed: b }); setEditingAt(null); setBreedSearch(''); setBreedDropdownOpen(false); setDogSubstep((prev) => prev + 1); }}
                            className="w-full px-4 py-3 text-left text-sm font-medium text-[#2D3A2D] hover:bg-[#E8EFE8]"
                          >
                            {lang === 'GE' ? b.nameKa : b.nameEn}
                          </button>
                        ))}
                        <div className="flex gap-2 border-t border-[#D4E4D4] p-2">
                          <input
                            type="text"
                            value={tempInput}
                            onChange={(e) => setTempInput(e.target.value)}
                            placeholder={lang === 'GE' ? 'საკუთარი ჯიში' : 'Custom breed'}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="flex-1 rounded-lg border border-[#D4E4D4] bg-white px-3 py-2 text-sm text-[#2D3A2D] placeholder:text-[#8a9a8a] focus:border-[#2d5a27] focus:outline-none"
                          />
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => tempInput.trim() && (updateCurrentDog({ breed: { id: 'custom', nameKa: tempInput.trim(), nameEn: tempInput.trim() } }), setEditingAt(null), setTempInput(''), setBreedSearch(''), setBreedDropdownOpen(false), setDogSubstep((prev) => prev + 1))}
                            className="rounded-lg bg-[#2d5a27] px-3 py-2 text-sm font-semibold text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {substep === 'weight' && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={currentDog.weight === 0 ? '' : currentDog.weight}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateCurrentDog({ weight: v === '' ? 0 : parseFloat(v) || 0 });
                      }}
                      placeholder={t.weightPlaceholder}
                      className="w-32 rounded-xl border border-[#D4E4D4] bg-white px-4 py-3 text-[#2D3A2D] placeholder:text-[#8a9a8a] focus:border-[#2d5a27] focus:outline-none"
                    />
                    <button
                      onClick={() => advanceDogSubstep()}
                      disabled={!currentDog.weight || currentDog.weight <= 0}
                      className="rounded-xl bg-[#2d5a27] px-6 py-3 font-semibold text-white hover:bg-[#3a6b33] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#2d5a27]"
                    >
                      →
                    </button>
                  </div>
                )}

                {substep === 'condition' && (
                  <div className="flex flex-wrap gap-2">
                    {[['very-thin', t.condition1], ['ideal', t.condition2], ['rounded', t.condition3], ['overweight', t.condition4]].map(([val, label]) =>
                      chip(label as string, val as string, () => { updateCurrentDog({ condition: val as string }); setEditingAt(null); setDogSubstep((prev) => prev + 1); }, currentDog.condition === val)
                    )}
                  </div>
                )}

                {substep === 'activity' && (
                  <div className="flex flex-wrap gap-2">
                    {[['not-active', t.activity1], ['active', t.activity2], ['super-active', t.activity3], ['athlete', t.activity4]].map(([val, label]) =>
                      chip(label as string, val as string, () => { updateCurrentDog({ activity: val as string }); setEditingAt(null); setDogSubstep((prev) => prev + 1); }, currentDog.activity === val)
                    )}
                  </div>
                )}

                {substep === 'appetite' && (
                  <div className="flex flex-wrap gap-2">
                    {[['picks', t.appetite1], ['may-pick', t.appetite2], ['eats-well', t.appetite3], ['eats-all', t.appetite4]].map(([val, label]) =>
                      chip(label as string, val as string, () => { updateCurrentDog({ appetite: val as string }); setEditingAt(null); setDogSubstep((prev) => prev + 1); }, currentDog.appetite === val)
                    )}
                  </div>
                )}

                {substep === 'diet' && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {[['dry', t.diet1], ['wet', t.diet2], ['raw', t.diet3], ['dried', t.diet4], ['fresh-food', t.diet5]].map(([val, label]) =>
                        chip(label as string, val as string, () => updateCurrentDog({ diet: val as string }), currentDog.diet === val)
                      )}
                    </div>
                    {currentDog.diet && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={currentDog.dietBrand || ''}
                          onChange={(e) => updateCurrentDog({ dietBrand: e.target.value })}
                          placeholder={t.dogDietBrand}
                          className="flex-1 rounded-xl border border-[#D4E4D4] bg-white px-4 py-3 text-[#2D3A2D] placeholder:text-[#8a9a8a] focus:border-[#2d5a27] focus:outline-none"
                        />
                        <button onClick={() => (setEditingAt(null), setDogSubstep((prev) => prev + 1))} className="rounded-xl bg-[#2d5a27] px-6 py-3 font-semibold text-white">
                          →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {substep === 'health' && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {chip(t.noIssues, 'none', () => { updateCurrentDog({ healthIds: [], healthStepCompleted: true }); setEditingAt(null); setDogSubstep((prev) => prev + 1); }, currentDog.healthStepCompleted && (currentDog.healthIds?.length ?? 0) === 0)}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={diseaseSearch}
                        onChange={(e) => { setDiseaseSearch(e.target.value); setDiseaseDropdownOpen(true); }}
                        onFocus={() => setDiseaseDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setDiseaseDropdownOpen(false), 150)}
                        placeholder={t.healthPlaceholder}
                        className="w-full rounded-xl border border-[#D4E4D4] bg-white px-4 py-3 text-[#2D3A2D] placeholder:text-[#8a9a8a] focus:border-[#2d5a27] focus:outline-none"
                      />
                      {diseaseDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-[#D4E4D4] bg-white shadow-lg">
                          {diseaseResults.map((d) => {
                            const sel = currentDog?.healthIds?.includes(d.id);
                            return (
                              <button
                                key={d.id}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => toggleDisease(d.id)}
                                className={`w-full px-4 py-3 text-left text-sm font-medium hover:bg-[#E8EFE8] ${sel ? 'bg-[#E8EFE8] text-[#2d5a27]' : 'text-[#2D3A2D]'}`}
                              >
                                {lang === 'GE' ? d.nameKa : d.nameEn} {sel ? '✓' : ''}
                              </button>
                            );
                          })}
                          <div className="flex gap-2 border-t border-[#D4E4D4] p-2">
                            <input
                              type="text"
                              value={tempInput}
                              onChange={(e) => setTempInput(e.target.value)}
                              placeholder={lang === 'GE' ? 'საკუთარი' : 'Custom'}
                              onMouseDown={(e) => e.stopPropagation()}
                              className="flex-1 rounded-lg border border-[#D4E4D4] bg-white px-3 py-2 text-sm text-[#2D3A2D] placeholder:text-[#8a9a8a] focus:border-[#2d5a27] focus:outline-none"
                            />
                            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={addCustomDisease} className="rounded-lg bg-[#2d5a27] px-3 py-2 text-sm font-semibold text-white">
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    {(currentDog?.healthIds?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {currentDog.healthIds.map((id) => {
                          const dx = diseases.find((x) => x.id === id) || { nameKa: id.replace('custom:', ''), nameEn: id.replace('custom:', '') };
                          return (
                            <span key={id} className="inline-flex items-center gap-1 rounded-full bg-[#2d5a27] px-3 py-1 text-sm text-white">
                              {lang === 'GE' ? dx.nameKa : dx.nameEn}
                              <button type="button" onClick={() => removeDisease(id)} className="ml-1 font-bold hover:opacity-80">×</button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <button onClick={() => { updateCurrentDog({ healthStepCompleted: true }); setEditingAt(null); setDogSubstep((prev) => prev + 1); }} className="rounded-xl bg-[#2d5a27] px-6 py-3 font-semibold text-white">
                      →
                    </button>
                  </div>
                )}

                {substep === 'goal' && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {[['weight-loss', t.goal1], ['maintenance', t.goal2], ['weight-gain', t.goal3], ['fix-pickiness', t.goal4]].map(([val, label]) =>
                        chip(label as string, val as string, () => updateCurrentDog({ goal: val as string }), currentDog.goal === val)
                      )}
                      <button
                        onClick={() => updateCurrentDog({ goal: 'custom' })}
                        className={`min-h-[44px] rounded-full px-4 py-2.5 text-sm font-medium md:py-3 ${currentDog.goal === 'custom' ? 'bg-[#2d5a27] text-white' : 'bg-white text-[#2D3A2D] border border-[#D4E4D4] hover:border-[#2d5a27]/50 hover:bg-[#E8EFE8]'}`}
                      >
                        {t.goalCustom}
                      </button>
                    </div>
                    {currentDog.goal === 'custom' && (
                      <input
                        type="text"
                        value={currentDog.goalCustom || ''}
                        onChange={(e) => updateCurrentDog({ goalCustom: e.target.value })}
                        placeholder={t.goalCustomPlaceholder}
                        className="w-full rounded-xl border border-[#D4E4D4] bg-white px-4 py-3 text-[#2D3A2D] placeholder:text-[#8a9a8a] focus:border-[#2d5a27] focus:outline-none"
                      />
                    )}
                    <button
                      onClick={advanceStep}
                      className="rounded-xl bg-[#2d5a27] px-6 py-3 font-semibold text-white hover:bg-[#3a6b33]"
                    >
                      {dogIndex < answers.dogCount - 1 ? (lang === 'GE' ? 'შემდეგი ძაღლი →' : 'Next dog →') : (lang === 'GE' ? 'დასრულება' : 'Finish')}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <div ref={messagesEndRef} />
      </main>
    </div>
  );
}
