'use client';

import { useState, useEffect, useRef, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import dictEn from '@/lib/i18n/en.json';
import dictGe from '@/lib/i18n/ge.json';
import { supabase } from '@/lib/supabase';
import { withRetry } from '@/lib/supabase-retry';
import {
  FileText,
  ExternalLink,
  Star,
  MessageCircle,
  Loader2,
  HeartPulse,
  ShieldCheck,
  BadgeCheck,
  Sparkles,
  Truck,
  PawPrint,
  Chrome,
} from 'lucide-react';
import { Footer } from './components/Footer';

type Lang = 'GE' | 'EN';
const LANG_KEY = 'aylopet-lang';
const VIDEO_MAX_BYTES = 50 * 1024 * 1024; // 50MB
const VIDEO_ACCEPT = 'video/mp4,video/quicktime,.mp4,.mov';

const navI18n = { GE: dictGe.nav, EN: dictEn.nav };

function getVideoEmbedUrl(url: string): string | null {
  if (!url?.trim()) return null;
  const u = url.trim();
  const ytMatch = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = u.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

function isDirectVideoUrl(url: string): boolean {
  if (!url?.trim()) return false;
  const u = url.trim();
  return u.includes('supabase.co/storage') || /\.(mp4|mov)(\?|$)/i.test(u);
}

const translations: Record<
  Lang,
  {
    bannerText: string;
    bannerCta: string;
    nav: {
      about: string;
      aboutItems: {
        whatIs: string;
        story: string;
        process: string;
        team: string;
        vision: string;
      };
      products: string;
      productsItems: {
        ayloperAI: string;
        smartCollar: string;
        pasteurizedRaw: string;
        whyHealthy: string;
      };
      review: string;
      faq: string;
      ayloperChat: string;
      login: string;
      signup: string;
      myProfile: string;
      logout: string;
      langGe: string;
      langEn: string;
    };
    hero: {
      title: string;
      subtitle: string;
      primaryCta: string;
      secondaryCta: string;
    };
    reviews: {
      title: string;
      subtitle: string;
      heading: string;
      leaveReview: string;
      signInToPost: string;
      yourRating: string;
      reasonLabel: string;
      reasonPlaceholder: string;
      videoUploadLabel: string;
      videoUploadHint: string;
      uploadingVideo: string;
      videoSizeError: string;
      submit: string;
      submitting: string;
      success: string;
      error: string;
      reasonRequired: string;
      noReviews: string;
      loading: string;
      customer: string;
      reply: string;
      replyPlaceholder: string;
      postReply: string;
      posting: string;
    };
    research: {
      lifespan: string;
      lifespanText: string;
      immune: string;
      immuneText: string;
      ratings: string;
      ratingsText: string;
      firstInGeo: string;
      firstInGeoText: string;
      delivery: string;
      deliveryText: string;
    };
  }
> = {
  GE: {
    bannerText:
      'თქვენ მიიღეთ საჩუქრად 40%-იანი ფასდაკლება საკვებზე და უფასო კონსულტაცია!',
    bannerCta: 'გამოიყენეთ ახლავე',
    nav: {
      about: 'ჩვენს შესახებ',
      aboutItems: {
        whatIs: 'რა არის Aylopet',
        story: 'ჩვენი ისტორია',
        process: 'წარმოების პროცესი',
        team: 'გუნდი',
        vision: 'კომპანიის ხედვა',
      },
      products: 'ჩვენი პროდუქტები',
      productsItems: {
        ayloperAI: 'AylopetAI',
        smartCollar: 'ჭკვიანი ყელსაბამი',
        pasteurizedRaw: 'პასტერიზებული ნედლი საკვები',
        whyHealthy: 'რატომ ჯანსაღი საკვები?',
      },
      review: 'შეფასებები',
      faq: 'FAQ',
      ayloperChat: 'AyloperAI Chat',
      login: 'შესვლა',
      signup: 'რეგისტრაცია',
      myProfile: 'ჩემი პროფილი',
      logout: 'გასვლა',
      langGe: 'GE',
      langEn: 'EN',
    },
    hero: {
      title: 'ერთად გავუხანგძლივოთ სიცოცხლე ჩვენს ოთხფეხა მეგობრებს',
      subtitle: 'Aylopet · Smart Nutrition & Feeding',
      primaryCta: 'დაიწყე მოგზაურობა',
      secondaryCta: 'გაიგე მეტი',
    },
    research: {
      lifespan: 'ძაღლების სიცოცხლის ხანგრძლივობა',
      lifespanText: '2003 წლის კვლევამ (Lippert & Sapy) 537 ძაღლზე აჩვენა, რომ ნატურალური კვება მნიშვნელოვნად ზრდის სიცოცხლის ხანგრძლივობას.',
      immune: 'იმუნიტეტი და ენერგია',
      immuneText: 'კვლევა აჩვენებს, რომ fresh კვებაზე მყოფ ძაღლებს kibble-თან შედარებით უკეთესი ჰიდრატაცია აქვთ.',
      ratings: 'საერთო შეფასება',
      ratingsText: 'გაიგეთ რას ფიქრობენ ჩვენი მომხმარებლები.',
      firstInGeo: 'პირველები საქართველოში',
      firstInGeoText: 'პირველი პლატფორმა რეგიონში, რომელიც აერთიანებს AI ნუტრიციოლოგიას და უმაღლესი ხარისხის საკვებს.',
      delivery: 'მიტანა პირდაპირ კართან',
      deliveryText: 'მიიღეთ ჯანსაღი საკვები პირდაპირ თქვენს კართან.',
    },
    reviews: {
      title: 'შეფასებები',
      subtitle: 'რას ფიქრობენ ჩვენი მომხმარებლები',
      heading: 'რას ამბობენ ჩვენი მომხმარებლები',
      leaveReview: 'შეფასების დატოვება',
      signInToPost: 'შეფასების დასაწერად გთხოვთ შეხვიდეთ სისტემაში.',
      yourRating: 'თქვენი შეფასება',
      reasonLabel: 'დეტალური მიზეზი / არგუმენტი (აუცილებელი)',
      reasonPlaceholder: 'აღწერეთ რატომ მოგწონთ ან რა გაქვთ გასაუმჯობესებელი...',
      videoUploadLabel: 'ვიდეო ფაილი (არასავალდებულო)',
      videoUploadHint: 'MP4 ან MOV, მაქს. 50MB',
      uploadingVideo: 'ვიდეო იტვირთება...',
      videoSizeError: 'ვიდეოს ზომა არ უნდა აღემატებოდეს 50MB-ს',
      submit: 'გაგზავნა',
      submitting: 'იგზავნება...',
      success: 'შეფასება წარმატებით გაიგზავნა!',
      error: 'შეცდომა. სცადეთ თავიდან.',
      reasonRequired: 'გთხოვთ დაწეროთ დეტალური მიზეზი.',
      noReviews: 'შეფასებები ჯერ არ არის.',
      loading: 'იტვირთება...',
      customer: 'მომხმარებელი',
      reply: 'პასუხი',
      replyPlaceholder: 'დაწერეთ პასუხი...',
      postReply: 'გაგზავნა',
      posting: 'იგზავნება...',
    },
  },
  EN: {
    bannerText:
      'You’ve unlocked a 40% discount on food and a free consultation!',
    bannerCta: 'Redeem now',
    nav: {
      about: 'About Us',
      aboutItems: {
        whatIs: 'What is Aylopet',
        story: 'Our Story',
        process: 'Production Process',
        team: 'Team',
        vision: 'Company Vision',
      },
      products: 'Our Products',
      productsItems: {
        ayloperAI: 'AylopetAI',
        smartCollar: 'Smart Collar',
        pasteurizedRaw: 'Pasteurized Raw Food',
        whyHealthy: 'Why Healthy Food?',
      },
      review: 'Reviews',
      faq: 'FAQ',
      ayloperChat: 'AyloperAI Chat',
      login: 'Log in',
      signup: 'Sign up',
      myProfile: 'My Profile',
      logout: 'Log out',
      langGe: 'GE',
      langEn: 'EN',
    },
    hero: {
      title: "Let's extend the lives of our four-legged friends together",
      subtitle: 'Aylopet · Smart Nutrition & Feeding',
      primaryCta: 'Start the Journey',
      secondaryCta: 'Learn more',
    },
    research: {
      lifespan: 'Dog Lifespan Extension',
      lifespanText: 'A 2003 study (Lippert & Sapy) on 537 dogs showed that natural feeding significantly increases lifespan.',
      immune: 'Immunity & Energy',
      immuneText: 'Research shows dogs on fresh food have better hydration than dogs fed kibble.',
      ratings: 'Overall Rating',
      ratingsText: 'See what our customers think.',
      firstInGeo: 'First in Georgia',
      firstInGeoText: 'The first platform in the region combining AI nutritionology with premium quality food.',
      delivery: 'Delivery to Your Door',
      deliveryText: 'Get healthy dog food shipped right to your door.',
    },
    reviews: {
      title: 'Reviews',
      subtitle: 'What our customers think',
      heading: 'What our customers say',
      leaveReview: 'Leave a Review',
      signInToPost: 'Please sign in to post a review.',
      yourRating: 'Your rating',
      reasonLabel: 'Detailed reason / argument (required)',
      reasonPlaceholder: 'Describe why you like it or what could be improved...',
      videoUploadLabel: 'Video file (optional)',
      videoUploadHint: 'MP4 or MOV, max 50MB',
      uploadingVideo: 'Uploading video...',
      videoSizeError: 'Video size must not exceed 50MB',
      submit: 'Submit',
      submitting: 'Submitting...',
      success: 'Review submitted successfully!',
      error: 'Error. Please try again.',
      reasonRequired: 'Please write a detailed reason.',
      noReviews: 'No reviews yet.',
      loading: 'Loading...',
      customer: 'Customer',
      reply: 'Reply',
      replyPlaceholder: 'Write a reply...',
      postReply: 'Post',
      posting: 'Posting...',
    },
  },
};

export default function Home() {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'GE';
    const s = localStorage.getItem(LANG_KEY);
    return (s === 'EN' || s === 'GE') ? s : 'GE';
  });
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [authOpen, setAuthOpen] = useState<'login' | 'signup' | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  type ReviewRow = { id: string; user_name: string | null; rating: number; reason: string; video_url: string | null; created_at: string };
  type CommentRow = { id: string; review_id: string; user_id: string; user_name: string | null; body: string; created_at: string };
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [commentsByReview, setCommentsByReview] = useState<Record<string, CommentRow[]>>({});
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewSummary, setReviewSummary] = useState<{ avg_rating: number; total_reviews: number } | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewReason, setReviewReason] = useState('');
  const [reviewVideoFile, setReviewVideoFile] = useState<File | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewToast, setReviewToast] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [authResendLoading, setAuthResendLoading] = useState(false);
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [researchDragging, setResearchDragging] = useState(false);
  const researchScrollRef = useRef<HTMLDivElement | null>(null);
  const researchDragStartXRef = useRef(0);
  const researchStartScrollLeftRef = useRef(0);
  const researchIsDraggingRef = useRef(false);
  const researchPauseUntilRef = useRef(0);

  const t = translations[lang];
  const authCopy = (lang === 'GE' ? dictGe : dictEn).auth;
  const pathname = usePathname();
  const projectStatusLabel = navI18n[lang].projectStatus;
  const researchCards = [
    {
      key: 'lifespan',
      icon: HeartPulse,
      title: t.research.lifespan,
      text: t.research.lifespanText,
      link: {
        href: 'https://www.cavalierhealth.org/images/Lippert_Sapy_Domestic_Dogs_Life_Expectancy.pdf',
        label: 'PDF',
        icon: FileText,
      },
    },
    {
      key: 'immune',
      icon: ShieldCheck,
      title: t.research.immune,
      text: t.research.immuneText,
      link: {
        href: 'https://www.petfoodindustry.com/nutrition/research-notes/news/15771498/study-farmers-dog-finds-fresh-dog-food-boosts-hydration-more-than-kibble',
        label: 'Study',
        icon: ExternalLink,
      },
    },
    {
      key: 'ratings',
      icon: BadgeCheck,
      title: t.research.ratings,
      text: t.research.ratingsText,
    },
    {
      key: 'firstInGeo',
      icon: Sparkles,
      title: t.research.firstInGeo,
      text: t.research.firstInGeoText,
    },
    {
      key: 'delivery',
      icon: Truck,
      title: t.research.delivery,
      text: t.research.deliveryText,
    },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const s = localStorage.getItem(LANG_KEY);
    if (s === 'EN' || s === 'GE') setLang(s);
  }, []);

  useEffect(() => {
    const el = researchScrollRef.current;
    if (!el) return;

    const tick = window.setInterval(() => {
      const node = researchScrollRef.current;
      if (!node) return;
      if (researchIsDraggingRef.current || Date.now() <= researchPauseUntilRef.current) return;

      node.scrollLeft += 1;
      const half = node.scrollWidth / 2;
      if (node.scrollLeft >= half - 1) node.scrollLeft -= half;
    }, 16);

    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'signup') setAuthOpen('signup');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const recoveryType = searchParams.get('type') ?? hashParams.get('type');
    if (recoveryType !== 'recovery') return;

    const target = new URL('/reset-password', window.location.origin);
    for (const [key, value] of searchParams.entries()) {
      target.searchParams.set(key, value);
    }
    const hashPayload = hashParams.toString();
    if (hashPayload) target.hash = hashPayload;
    window.location.replace(target.toString());
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u ? { id: u.id, email: u.email } : null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ? { id: session.user.id, email: session.user.email } : null));
    return () => subscription.unsubscribe();
  }, []);

  const loadReviews = async (silent = false) => {
    if (!silent) setReviewsLoading(true);
    const [reviewsRes, summaryRes, commentsRes] = await withRetry(() =>
      Promise.all([
        supabase.from('reviews').select('id, user_name, rating, reason, video_url, created_at').order('created_at', { ascending: false }).limit(6),
        supabase.rpc('get_reviews_summary'),
        supabase.from('review_comments').select('id, review_id, user_id, user_name, body, created_at').order('created_at', { ascending: true }),
      ])
    );
    setReviews(reviewsRes.data ?? []);
    setReviewSummary(summaryRes.data?.avg_rating != null ? { avg_rating: summaryRes.data.avg_rating, total_reviews: summaryRes.data.total_reviews ?? 0 } : null);
    const byReview: Record<string, CommentRow[]> = {};
    for (const c of commentsRes.data ?? []) {
      if (!byReview[c.review_id]) byReview[c.review_id] = [];
      byReview[c.review_id].push(c);
    }
    setCommentsByReview(byReview);
    if (!silent) setReviewsLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const showReviewToast = (msg: string) => {
    setReviewToast(msg);
    setTimeout(() => setReviewToast(null), 3000);
  };

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      showReviewToast(t.reviews.signInToPost);
      return;
    }
    const trimmed = reviewReason.trim();
    if (trimmed.length < 20) {
      showReviewToast(t.reviews.reasonRequired);
      return;
    }
    if (reviewVideoFile && reviewVideoFile.size > VIDEO_MAX_BYTES) {
      showReviewToast(t.reviews.videoSizeError);
      return;
    }
    setReviewSubmitting(true);
    let uploadedPath: string | null = null;
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        showReviewToast(t.reviews.signInToPost);
        setReviewSubmitting(false);
        return;
      }
      let user_name: string = t.reviews.customer;
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', currentUser.id).single();
      if (profile?.full_name) user_name = profile.full_name;
      else if (currentUser.email) user_name = currentUser.email.split('@')[0];

      let videoUrl: string | undefined;
      if (reviewVideoFile) {
        setVideoUploading(true);
        try {
          const ext = reviewVideoFile.name.split('.').pop() || 'mp4';
          const storagePath = `${currentUser.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
          const { error: uploadError } = await supabase.storage.from('review-videos').upload(storagePath, reviewVideoFile, {
            cacheControl: '3600',
            upsert: false,
          });
          if (uploadError) throw uploadError;
          uploadedPath = storagePath;
          const { data: urlData } = supabase.storage.from('review-videos').getPublicUrl(storagePath);
          videoUrl = urlData.publicUrl;
        } finally {
          setVideoUploading(false);
        }
      }

      const payload = {
        user_id: currentUser.id,
        user_name,
        rating: reviewRating,
        reason: trimmed,
        ...(videoUrl ? { video_url: videoUrl } : {}),
      };

      const { data, error } = await supabase.from('reviews').insert(payload).select().single();
      if (error) {
        console.error('Supabase review insert error:', error);
        throw error;
      }

      if (data) {
        setReviews((prev) => [data, ...prev].slice(0, 6));
        loadReviews(true);
        setReviewRating(0);
        setReviewReason('');
        setReviewVideoFile(null);
        setReviewModalOpen(false);
        showReviewToast(t.reviews.success);
      }
    } catch (err) {
      console.error('Review submit error:', err);
      showReviewToast(t.reviews.error);
      setReviewVideoFile(null);
      if (uploadedPath) {
        await supabase.storage.from('review-videos').remove([uploadedPath]).catch(() => {});
      }
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleReplySubmit = async (reviewId: string) => {
    const trimmed = replyBody.trim();
    if (!trimmed || !user) return;
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      showReviewToast(t.reviews.signInToPost);
      return;
    }
    setReplySubmitting(true);
    try {
      let user_name = t.reviews.customer;
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', currentUser.id).single();
      if (profile?.full_name) user_name = profile.full_name;
      else if (currentUser.email) user_name = currentUser.email.split('@')[0];
      const { data, error } = await supabase.from('review_comments').insert({
        review_id: reviewId,
        user_id: currentUser.id,
        user_name,
        body: trimmed,
      }).select().single();
      if (error) throw error;
      if (data) {
        setCommentsByReview((prev) => ({
          ...prev,
          [reviewId]: [...(prev[reviewId] ?? []), data],
        }));
        setReplyBody('');
        setReplyingTo(null);
      }
    } catch (err) {
      console.error('Reply submit error:', err);
      showReviewToast(t.reviews.error);
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthNotice('');
    setAuthLoading(true);
    try {
      if (authOpen === 'signup') {
        const emailCheck = await validateEmailQuality(authEmail);
        if (!emailCheck.ok) {
          setAuthError(toEmailValidationMessage(emailCheck.reason));
          return;
        }
        if (authPassword.length < 6) {
          setAuthError(authCopy.passwordMinLength);
          return;
        }
        if (!/[A-Z]/.test(authPassword)) {
          setAuthError(authCopy.passwordNeedsUppercase);
          return;
        }
        if (!/[0-9]/.test(authPassword)) {
          setAuthError(authCopy.passwordNeedsDigit);
          return;
        }
        if (!/[^A-Za-z0-9]/.test(authPassword)) {
          setAuthError(authCopy.passwordNeedsSpecial);
          return;
        }
        if (authPassword !== authConfirmPassword) {
          setAuthError(authCopy.passwordsMismatch);
          return;
        }
        const { data, error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
        if (error) throw error;
        if (data.user && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('auth') === 'signup') {
          const pendingRaw = sessionStorage.getItem('aylopet-pending-signup');
          const pending = pendingRaw ? JSON.parse(pendingRaw) : null;
          const city = pending?.city || null;
          const tier = pending?.user_tier || null;
          await supabase.rpc('generate_promo_code_for_user', { p_user_id: data.user.id, p_city: city, p_tier: tier });
          window.location.href = '/profile';
          return;
        }
        setAuthPassword('');
        setAuthConfirmPassword('');
        setAuthNotice(`${authCopy.confirmationSent} ${authCopy.checkInboxHint}`);
        setShowResendConfirmation(true);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
        if (error) throw error;
        if (data.user && typeof window !== 'undefined') {
          const pendingRaw = sessionStorage.getItem('aylopet-pending-signup');
          const pending = pendingRaw ? JSON.parse(pendingRaw) : null;
          if (pending?.user_tier === 'honorary_ambassador') {
            const city = pending?.city || null;
            await supabase.rpc('generate_promo_code_for_user', { p_user_id: data.user.id, p_city: city, p_tier: 'honorary_ambassador' });
            sessionStorage.removeItem('aylopet-pending-signup');
            window.location.href = '/profile';
            return;
          }
        }
        setAuthOpen(null);
        setAuthEmail('');
        setAuthPassword('');
        setAuthConfirmPassword('');
        setAuthNotice('');
        setShowResendConfirmation(false);
      }
    } catch (err: unknown) {
      setAuthError(localizeAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const localizeAuthError = (err: unknown): string => {
    if (!(err instanceof Error)) return authCopy.genericError;
    const msg = err.message.toLowerCase();
    if (msg.includes('invalid login credentials')) return authCopy.invalidLoginCredentials;
    if (msg.includes('email not confirmed')) return authCopy.emailNotConfirmed;
    if (msg.includes('too many requests') || msg.includes('rate limit')) return authCopy.rateLimitExceeded;
    return err.message;
  };

  const validateEmailQuality = async (email: string): Promise<{ ok: boolean; reason?: string }> => {
    const normalized = email.trim().toLowerCase();
    const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!basicEmailRegex.test(normalized)) return { ok: false, reason: 'invalid_format' };

    try {
      const res = await fetch(`/api/validate-email?email=${encodeURIComponent(normalized)}`);
      if (!res.ok) return { ok: false, reason: 'domain_unreachable' };
      const payload = (await res.json()) as { ok: boolean; reason?: string };
      return payload.ok ? { ok: true } : { ok: false, reason: payload.reason };
    } catch {
      return { ok: false, reason: 'domain_unreachable' };
    }
  };

  const toEmailValidationMessage = (reason?: string): string => {
    if (reason === 'invalid_format') return authCopy.invalidEmailFormat;
    if (reason === 'disposable_domain') return authCopy.disposableEmailBlocked;
    if (reason === 'recent_bounce') return authCopy.emailPreviouslyBounced;
    return authCopy.emailDomainUnreachable;
  };

  const handleResearchPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    const el = researchScrollRef.current;
    if (!el) return;
    researchIsDraggingRef.current = true;
    setResearchDragging(true);
    researchPauseUntilRef.current = Date.now() + 5000;
    researchDragStartXRef.current = e.clientX;
    researchStartScrollLeftRef.current = el.scrollLeft;
    el.setPointerCapture(e.pointerId);
  };

  const handleResearchPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!researchIsDraggingRef.current) return;
    const el = researchScrollRef.current;
    if (!el) return;
    const delta = e.clientX - researchDragStartXRef.current;
    el.scrollLeft = researchStartScrollLeftRef.current - delta;
  };

  const handleResearchPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!researchIsDraggingRef.current) return;
    const el = researchScrollRef.current;
    if (el && el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    researchIsDraggingRef.current = false;
    setResearchDragging(false);
    researchPauseUntilRef.current = Date.now() + 3500;
  };

  const handleForgotPassword = async () => {
    setAuthError('');
    setAuthNotice('');
    const email = authEmail.trim();
    if (!email) {
      setAuthError(authCopy.enterEmailForRecovery);
      return;
    }

    const emailCheck = await validateEmailQuality(email);
    if (!emailCheck.ok) {
      setAuthError(toEmailValidationMessage(emailCheck.reason));
      return;
    }

    try {
      const appOrigin =
        typeof window !== 'undefined'
          ? (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || window.location.origin)
          : undefined;
      const redirectTo = appOrigin ? `${appOrigin}/reset-password` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      setAuthNotice(`${authCopy.resetLinkSent} ${authCopy.checkInboxHint}`);
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? localizeAuthError(err) : authCopy.resetLinkFailed);
    }
  };

  const handleResendConfirmation = async () => {
    setAuthError('');
    setAuthNotice('');
    const email = authEmail.trim();
    if (!email) {
      setAuthError(authCopy.enterEmailForRecovery);
      return;
    }

    const emailCheck = await validateEmailQuality(email);
    if (!emailCheck.ok) {
      setAuthError(toEmailValidationMessage(emailCheck.reason));
      return;
    }

    setAuthResendLoading(true);
    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
      });
      if (error) throw error;
      setAuthNotice(`${authCopy.resendConfirmationSent} ${authCopy.checkInboxHint}`);
    } catch (err: unknown) {
      setAuthError(localizeAuthError(err));
    } finally {
      setAuthResendLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError('');
    setAuthNotice('');
    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/profile` : undefined;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: redirectTo ? { redirectTo } : undefined,
      });
      if (error) throw error;
    } catch (err: unknown) {
      setAuthError(localizeAuthError(err));
    }
  };

  const generateStrongPassword = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
    const bytes = new Uint32Array(16);
    crypto.getRandomValues(bytes);
    let out = '';
    for (let i = 0; i < bytes.length; i += 1) out += chars[bytes[i] % chars.length];
    return out;
  };

  const handleGeneratePassword = () => {
    const pwd = generateStrongPassword();
    setAuthPassword(pwd);
    setAuthConfirmPassword(pwd);
    setAuthError('');
    setAuthNotice(authCopy.generatedPasswordApplied);
  };

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthOpen(mode);
    setAuthEmail('');
    setAuthPassword('');
    setAuthConfirmPassword('');
    setAuthError('');
    setAuthNotice('');
    setShowResendConfirmation(false);
  };

  return (
    <div className="min-h-screen w-full max-w-screen overflow-x-hidden bg-gradient-to-b from-[#f6f8f3] via-white to-[#eef2e7] text-slate-900">
      {/* Fixed Header (Banner + Nav) - no layout jump */}
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Banner */}
        <div className="bg-[#2D4F1E] px-4 py-2 text-sm text-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <p className="font-medium text-xs sm:text-sm">{t.bannerText}</p>
            <a
              href="/aylopetai-chat"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#2D4F1E] shadow-sm transition hover:bg-slate-50"
            >
              {t.bannerCta}
            </a>
          </div>
        </div>

        {/* Nav Bar - glassmorphism on scroll */}
        <header
          className={`border-b border-slate-100/80 text-slate-900 transition-all duration-300 ${
            scrolled
              ? 'bg-white/90 backdrop-blur-md shadow-md shadow-slate-200/50'
              : 'bg-white/80 backdrop-blur-sm shadow-sm'
          }`}
        >
          <div className="lg:hidden px-3 py-2.5">
            <nav className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-[11px] font-semibold text-slate-800">
              <Link
                href="/"
                onClick={(e) => {
                  if (typeof window !== 'undefined' && window.location.pathname === '/') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 ring-1 ring-slate-200/80"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-[#2D4F1E] to-[#8A9A5B] text-xs font-bold text-white">A</span>
                <span className="text-[13px] font-semibold text-slate-900">Aylopet</span>
              </Link>
              {user ? (
                <Link href="/profile" className="shrink-0 rounded-full bg-[#2D4F1E] px-2.5 py-1.5 text-white">
                  {t.nav.myProfile}
                </Link>
              ) : (
                <>
                  <button onClick={() => openAuthModal('signup')} className="shrink-0 rounded-full bg-[#2D4F1E] px-2.5 py-1.5 text-white">
                    {t.nav.signup}
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  const next = lang === 'GE' ? 'EN' : 'GE';
                  setLang(next);
                  localStorage.setItem(LANG_KEY, next);
                  window.dispatchEvent(new CustomEvent('aylopet-lang-change'));
                }}
                className="shrink-0 rounded-full bg-[#eef2e7] px-2.5 py-1.5"
              >
                {lang === 'GE' ? 'EN' : 'GE'}
              </button>
              <Link href="/about#what-is" className="shrink-0 rounded-full bg-[#eef2e7] px-2.5 py-1.5 text-[#2D4F1E]">
                {t.nav.about}
              </Link>
              <label className="shrink-0 rounded-full px-2 py-1 hover:bg-[#eef2e7]">
                <span className="sr-only">{t.nav.products}</span>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const next = e.target.value;
                    if (next) window.location.href = next;
                    e.currentTarget.value = '';
                  }}
                  className="cursor-pointer bg-transparent text-[11px] font-semibold text-slate-800 outline-none"
                >
                  <option value="" disabled>{t.nav.products}</option>
                  <option value="/products/aylopet-ai">{t.nav.productsItems.ayloperAI}</option>
                  <option value="/smart-collar">{t.nav.productsItems.smartCollar}</option>
                  <option value="/products/pasteurized-raw">{t.nav.productsItems.pasteurizedRaw}</option>
                  <option value="/products/why-healthy">{t.nav.productsItems.whyHealthy}</option>
                </select>
              </label>
              <Link href="/products/pasteurized-raw" className="shrink-0 rounded-full px-2.5 py-1.5 hover:bg-[#eef2e7]">
                {t.nav.productsItems.pasteurizedRaw}
              </Link>
              <Link href="/products/why-healthy" className="shrink-0 rounded-full px-2.5 py-1.5 hover:bg-[#eef2e7]">
                {t.nav.productsItems.whyHealthy}
              </Link>
              <Link href="/faq" className="shrink-0 rounded-full px-2.5 py-1.5 hover:bg-[#eef2e7]">
                {t.nav.faq}
              </Link>
              <Link href="/project-status" className="shrink-0 rounded-full px-2.5 py-1.5 hover:bg-[#eef2e7]">
                {projectStatusLabel}
              </Link>
              <a href="/aylopetai-chat" className="shrink-0 rounded-full bg-[#2D4F1E] px-2.5 py-1.5 text-white">
                {t.nav.ayloperChat}
              </a>
              {user && (
                <button onClick={handleLogout} className="shrink-0 rounded-full px-2.5 py-1.5 hover:bg-[#eef2e7]">
                  {t.nav.logout}
                </button>
              )}
              {!user && (
                <button onClick={() => openAuthModal('login')} className="shrink-0 rounded-full px-2.5 py-1.5 hover:bg-[#eef2e7]">
                  {t.nav.login}
                </button>
              )}
            </nav>
          </div>

          <div className="hidden w-full items-center gap-4 px-4 py-3 sm:px-8 lg:flex">
            {/* Logo + Nav (left-aligned) */}
            <div className="flex flex-grow items-center gap-4 lg:gap-6">
              <Link
                href="/"
                onClick={(e) => {
                  if (typeof window !== 'undefined' && window.location.pathname === '/') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="flex flex-shrink-0 items-center gap-2 no-underline text-slate-900 outline-none transition-opacity hover:opacity-90 focus:opacity-90 focus:outline-none"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#2D4F1E] to-[#8A9A5B] text-white shadow-md">
                  <span className="text-lg font-bold">A</span>
                </div>
                <span className="text-lg font-semibold tracking-tight text-slate-900">
                  Aylopet
                </span>
              </Link>

              {/* Main nav - closer to logo */}
              <nav className="hidden items-center justify-start gap-3 text-sm font-semibold text-slate-900 lg:flex">
              <div className="group relative inline-block">
                <button className="inline-flex items-center gap-1 whitespace-nowrap rounded-t-xl px-3 py-1.5 text-sm font-semibold text-slate-900 transition group-hover:bg-white group-hover:text-[#2D4F1E]">
                  {t.nav.about}
                  <span className="text-xs transition group-hover:rotate-180">▾</span>
                </button>
                <div className="invisible absolute left-1/2 top-full z-50 mt-0 w-60 -translate-x-1/2 rounded-b-xl border border-slate-100 bg-white text-xs text-slate-700 opacity-0 shadow-xl shadow-slate-200 transition group-hover:visible group-hover:opacity-100">
                  <ul className="space-y-1.5 rounded-b-xl bg-white p-3 pt-2">
                    <li>
                      <Link
                        href="/about#what-is"
                        className="block rounded-xl px-3 py-1.5 text-slate-700 no-underline transition hover:bg-[#eef2e7] hover:text-[#2D4F1E]"
                      >
                        {t.nav.aboutItems.whatIs}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/about#vision"
                        className="block rounded-xl px-3 py-1.5 text-slate-700 no-underline transition hover:bg-[#eef2e7] hover:text-[#2D4F1E]"
                      >
                        {t.nav.aboutItems.vision}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/about#our-story"
                        className="block rounded-xl px-3 py-1.5 text-slate-700 no-underline transition hover:bg-[#eef2e7] hover:text-[#2D4F1E]"
                      >
                        {t.nav.aboutItems.story}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/about#production"
                        className="block rounded-xl px-3 py-1.5 text-slate-700 no-underline transition hover:bg-[#eef2e7] hover:text-[#2D4F1E]"
                      >
                        {t.nav.aboutItems.process}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/team"
                        className="block rounded-xl px-3 py-1.5 text-slate-700 no-underline transition hover:bg-[#eef2e7] hover:text-[#2D4F1E]"
                      >
                        {t.nav.aboutItems.team}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="group relative inline-block">
                <button className="inline-flex items-center gap-1 whitespace-nowrap rounded-t-xl px-3 py-1.5 text-sm font-semibold text-slate-900 transition group-hover:bg-white group-hover:text-[#2D4F1E]">
                  {t.nav.products}
                  <span className="text-xs transition group-hover:rotate-180">▾</span>
                </button>
                <div className="invisible absolute left-1/2 top-full z-50 mt-0 w-60 -translate-x-1/2 rounded-b-xl border border-slate-100 bg-white text-xs text-slate-700 opacity-0 shadow-xl shadow-slate-200 transition group-hover:visible group-hover:opacity-100">
                  <ul className="space-y-1.5 rounded-b-xl bg-white p-3 pt-2">
                    <li>
                      <Link
                        href="/products/aylopet-ai"
                        className="block rounded-xl px-3 py-1.5 text-slate-700 no-underline transition hover:bg-[#eef2e7] hover:text-[#2D4F1E]"
                      >
                        {t.nav.productsItems.ayloperAI}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/smart-collar"
                        className="block rounded-xl px-3 py-1.5 text-slate-700 no-underline transition hover:bg-[#eef2e7] hover:text-[#2D4F1E]"
                      >
                        {t.nav.productsItems.smartCollar}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/products/pasteurized-raw"
                        className="block rounded-xl px-3 py-1.5 text-slate-700 no-underline transition hover:bg-[#eef2e7] hover:text-[#2D4F1E]"
                      >
                        {t.nav.productsItems.pasteurizedRaw}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/products/why-healthy"
                        className="block rounded-xl px-3 py-1.5 text-slate-700 no-underline transition hover:bg-[#eef2e7] hover:text-[#2D4F1E]"
                      >
                        {t.nav.productsItems.whyHealthy}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <button
                type="button"
                onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:text-[#2D4F1E]"
              >
                {t.nav.review}
              </button>
              <Link href="/faq" className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:text-[#2D4F1E]">
                {t.nav.faq}
              </Link>
              <Link
                href="/project-status"
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  pathname === '/project-status'
                    ? 'bg-[#eef2e7] text-[#2D4F1E] ring-1 ring-[#2D4F1E]/20'
                    : 'text-slate-900 hover:text-[#2D4F1E]'
                }`}
              >
                <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {projectStatusLabel}
              </Link>
              </nav>
            </div>

            {/* Right side: Aylopet Chat → Profile → Language → Logout */}
            <div className="flex flex-shrink-0 items-center gap-2 text-slate-900">
              <a
                href="/aylopetai-chat"
                className="hidden items-center gap-2 rounded-full bg-[#2D4F1E] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-[#2D4F1E]/40 transition hover:bg-[#253f18] sm:inline-flex"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-[#8A9A5B] to-[#B2AC88] text-[10px] font-bold">AI</span>
                {t.nav.ayloperChat}
              </a>

              {user ? (
                <Link href="/profile" className="inline-flex rounded-full bg-[#2D4F1E] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#253f18]">
                  {t.nav.myProfile}
                </Link>
              ) : (
                <button onClick={() => openAuthModal('signup')} className="inline-flex rounded-full bg-[#2D4F1E] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#253f18]">
                  {t.nav.signup}
                </button>
              )}

              <button
                onClick={() => {
                  const next = lang === 'GE' ? 'EN' : 'GE';
                  setLang(next);
                  localStorage.setItem(LANG_KEY, next);
                  window.dispatchEvent(new CustomEvent('aylopet-lang-change'));
                }}
                className="rounded-full bg-[#eef2e7] px-3 py-1 text-[11px] font-semibold text-slate-800 transition hover:bg-[#e2e8d8]"
              >
                {lang === 'GE' ? 'EN' : 'GE'}
              </button>

              {user && (
                <button onClick={handleLogout} className="inline-flex rounded-full px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:text-[#2D4F1E]">
                  {t.nav.logout}
                </button>
              )}
              {!user && (
                <button onClick={() => openAuthModal('login')} className="inline-flex rounded-full px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:text-[#2D4F1E]">
                  {t.nav.login}
                </button>
              )}
            </div>
          </div>
        </header>

      </div>

      {/* Spacer to prevent layout jump */}
      <div className="h-[104px]" aria-hidden="true" />

      {/* Auth Modal */}
      {authOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#eaf1e2] p-4 sm:p-6">
          <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl items-center justify-center overflow-hidden rounded-[2rem] border border-[#d4e3cb] bg-gradient-to-br from-[#f8fbf4] via-[#edf4e5] to-[#e4efda] px-4 py-8 shadow-[0_35px_90px_-60px_rgba(45,79,30,0.55)] sm:min-h-[calc(100vh-3rem)] sm:px-6">
            <div className="pointer-events-none absolute -top-20 left-[8%] h-44 w-44 rounded-full bg-[#6f9d53]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 right-[10%] h-48 w-48 rounded-full bg-[#355a2f]/15 blur-3xl" />

            <div className="pointer-events-none absolute left-[6%] top-[11%] inline-flex -rotate-6 items-center gap-2 rounded-full border border-[#d4e3cc] bg-white/85 px-3.5 py-1.5 text-[12px] font-semibold text-[#355a2f] shadow-sm sm:text-[13px] lg:text-[14px]">
              <PawPrint className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
              Aylopet
            </div>
            <div className="pointer-events-none absolute right-[6%] top-[13%] inline-flex rotate-3 items-center gap-2 rounded-full border border-[#d4e3cc] bg-white/85 px-3.5 py-1.5 text-[12px] font-semibold text-[#355a2f] shadow-sm sm:text-[13px] lg:text-[14px]">
              <PawPrint className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
              Waitlist
            </div>
            <div className="pointer-events-none absolute bottom-[18%] left-[4%] inline-flex -rotate-2 items-center gap-2 rounded-full border border-[#d4e3cc] bg-white/85 px-3.5 py-1.5 text-[12px] font-semibold text-[#355a2f] shadow-sm sm:text-[13px] lg:text-[14px]">
              <PawPrint className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
              Early Bird
            </div>
            <div className="pointer-events-none absolute bottom-[18%] right-[4%] inline-flex rotate-2 items-center gap-2 rounded-full border border-[#d4e3cc] bg-white/85 px-3.5 py-1.5 text-[12px] font-semibold text-[#355a2f] shadow-sm sm:text-[13px] lg:text-[14px]">
              <PawPrint className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
              Honorary Ambassador
            </div>

            <div
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#d6e1ce] bg-white/95 p-6 shadow-[0_30px_80px_-45px_rgba(45,79,30,0.65)] backdrop-blur-sm sm:p-7"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#2d5a27] to-[#6f9d53] text-white shadow-md">
                  <PawPrint className="h-5 w-5" />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = lang === 'GE' ? 'EN' : 'GE';
                    setLang(next);
                    localStorage.setItem(LANG_KEY, next);
                    window.dispatchEvent(new CustomEvent('aylopet-lang-change'));
                  }}
                  className="rounded-full bg-[#eef2e7] px-3 py-1 text-[11px] font-semibold text-slate-800 transition hover:bg-[#e2e8d8]"
                >
                  {lang === 'GE' ? 'EN' : 'GE'}
                </button>
              </div>

              <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#213d19]">
                {authOpen === 'login' ? t.nav.login : t.nav.signup}
              </h2>

              <div className="mt-4 inline-flex rounded-full bg-[#e8f0e1] p-1 ring-1 ring-[#d4e3cc]">
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className={`rounded-full px-5 py-2 text-xs font-semibold transition ${authOpen === 'login' ? 'bg-white text-[#1f3f16] shadow-sm' : 'text-[#355a2f]'}`}
                >
                  {t.nav.login}
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className={`rounded-full px-5 py-2 text-xs font-semibold transition ${authOpen === 'signup' ? 'bg-white text-[#1f3f16] shadow-sm' : 'text-[#355a2f]'}`}
                >
                  {t.nav.signup}
                </button>
              </div>

              <form key={authOpen} onSubmit={handleAuth} autoComplete="on" className="mt-5 space-y-4">
                <input type="email" name="email" autoComplete="email" spellCheck={false} autoCapitalize="none" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder={authCopy.emailPlaceholder} required className="w-full rounded-2xl border border-[#d9e5d3] bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-[#2D4F1E] focus:outline-none focus:ring-2 focus:ring-[#2D4F1E]/15" />
                <input type="password" name={authOpen === 'signup' ? 'new-password' : 'current-password'} autoComplete={authOpen === 'signup' ? 'new-password' : 'current-password'} value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder={authCopy.passwordPlaceholder} required minLength={6} className="w-full rounded-2xl border border-[#d9e5d3] bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-[#2D4F1E] focus:outline-none focus:ring-2 focus:ring-[#2D4F1E]/15" />
                {authOpen === 'signup' && (
                  <>
                    <input
                      type="password"
                      name="confirm-password"
                      autoComplete="new-password"
                      value={authConfirmPassword}
                      onChange={(e) => setAuthConfirmPassword(e.target.value)}
                      placeholder={authCopy.confirmPasswordPlaceholder}
                      required
                      minLength={6}
                      className="w-full rounded-2xl border border-[#d9e5d3] bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-[#2D4F1E] focus:outline-none focus:ring-2 focus:ring-[#2D4F1E]/15"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="inline-flex items-center rounded-full bg-[#edf4e6] px-3 py-1 text-xs font-medium text-[#2D4F1E] transition hover:bg-[#e2edda] hover:text-[#253f18]"
                      >
                        {authCopy.generateStrongPassword}
                      </button>
                      <span className="text-[11px] text-slate-500">{authCopy.passwordRulesHint}</span>
                    </div>
                  </>
                )}
                {authOpen === 'login' && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="inline-flex items-center rounded-full bg-[#edf4e6] px-3 py-1 text-xs font-medium text-[#2D4F1E] transition hover:bg-[#e2edda] hover:text-[#253f18]"
                  >
                    {authCopy.forgotPassword}
                  </button>
                )}
                {authError && <p className="text-sm text-red-600">{authError}</p>}
                {authNotice && <p className="text-sm text-emerald-700">{authNotice}</p>}
                {authOpen === 'signup' && showResendConfirmation && (
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={authResendLoading}
                    className="inline-flex items-center rounded-full bg-[#edf4e6] px-3 py-1 text-xs font-medium text-[#2D4F1E] transition hover:bg-[#e2edda] hover:text-[#253f18] disabled:opacity-60"
                  >
                    {authResendLoading ? '...' : authCopy.resendConfirmation}
                  </button>
                )}
                <div className="flex gap-2">
                  <button type="submit" disabled={authLoading} className="flex-1 rounded-2xl bg-gradient-to-r from-[#2d5a27] to-[#3f7a35] px-4 py-3 text-sm font-semibold text-white shadow-md shadow-[#2D4F1E]/20 transition hover:brightness-95 disabled:opacity-50">
                    {authLoading ? '...' : (authOpen === 'login' ? t.nav.login : t.nav.signup)}
                  </button>
                  <button type="button" onClick={() => setAuthOpen(null)} className="rounded-2xl border border-[#d9e5d3] bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    {authCopy.cancel}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#d9e5d3] bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  <Chrome className="h-4 w-4 text-[#2D4F1E]" />
                  {authCopy.continueWithGoogle}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative w-full min-h-screen overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/hero-dog.jpg.png"
            alt="Healthy dog - Aylopet premium nutrition"
            className="hero-image-focus hero-image-focus--balanced h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-[#1f2f1c]/70 to-black/50" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex min-h-screen w-full items-center">
          <div className="flex w-full flex-col gap-6 px-6 py-10 text-center text-white md:px-12 lg:px-24 lg:max-w-2xl lg:text-left">
            <p className="inline-flex items-center justify-center gap-2 self-center rounded-full bg-white/10 backdrop-blur-sm px-5 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/90 md:self-start">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              <span>{t.hero.subtitle}</span>
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl md:leading-tight drop-shadow-lg">
              {t.hero.title}
            </h1>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 self-center md:self-start">
              <a
                href="/aylopetai-chat"
                className="inline-flex items-center justify-center rounded-full bg-[#2D4F1E] px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-black/40 transition hover:bg-[#253f18]"
              >
                {t.hero.primaryCta}
              </a>
              <a
                href="#research-section"
                className="inline-flex items-center justify-center rounded-full border-2 border-white/80 bg-transparent px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                {t.hero.secondaryCta}
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="h-8 w-full bg-white" aria-hidden="true" />

      {/* Floating Chat */}
      <a
        href="/aylopetai-chat"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#2D4F1E] text-white shadow-lg shadow-[#2D4F1E]/40 transition hover:scale-105 hover:bg-[#253f18]"
        aria-label="Quick support"
      >
        <MessageCircle className="h-7 w-7" />
      </a>

      {/* Research & Trust Section - below Hero */}
      <section id="research-section" className="w-full border-b border-slate-100 bg-white py-12 text-slate-900">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="mb-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#2D4F1E]/80">Aylopet Insights</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{t.research.firstInGeo}</h2>
          </div>

          <div
            ref={researchScrollRef}
            onPointerDown={handleResearchPointerDown}
            onPointerMove={handleResearchPointerMove}
            onPointerUp={handleResearchPointerUp}
            onPointerCancel={handleResearchPointerUp}
            onTouchStart={() => {
              researchPauseUntilRef.current = Date.now() + 5000;
            }}
            onTouchEnd={() => {
              researchPauseUntilRef.current = Date.now() + 3000;
            }}
            className={`research-marquee-wrapper overflow-x-auto rounded-3xl border border-[#dde6cf] bg-gradient-to-b from-[#f9fbf5] to-[#eef4e3] px-3 py-4 sm:px-4 sm:py-5 [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${researchDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
          >
            <div className="flex w-max gap-4 sm:gap-5">
              {[...researchCards, ...researchCards].map((card, index) => {
                const Icon = card.icon;
                const LinkIcon = card.link?.icon;
                return (
                  <article
                    key={`${card.key}-${index}`}
                    className="w-[250px] shrink-0 rounded-[1.25rem] border border-white/70 bg-white/90 p-5 shadow-[0_10px_30px_rgba(31,53,21,0.10)] backdrop-blur-sm sm:w-[290px] lg:w-[320px]"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#2D4F1E]/10 text-[#2D4F1E]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 text-sm font-semibold text-slate-900">{card.title}</h3>
                    <p className="mb-4 line-clamp-4 text-xs leading-5 text-slate-600">{card.text}</p>

                    {card.key === 'ratings' && (
                      <div className="mb-4 flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              (reviewSummary?.avg_rating ?? 5) >= i ? 'fill-[#2D4F1E] text-[#2D4F1E]' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {card.link && LinkIcon && (
                      <a
                        href={card.link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#2D4F1E] transition hover:text-[#253f18]"
                      >
                        <LinkIcon className="h-3.5 w-3.5" />
                        {card.link.label}
                      </a>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews-section" className="w-full border-b border-slate-100 bg-[#f6f8f3] text-slate-900 py-12">
        <div className="mx-auto max-w-6xl w-full px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{t.reviews.heading}</h2>
              <p className="text-sm text-slate-600 mt-1">{t.reviews.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setReviewModalOpen(true)}
              className="inline-flex items-center justify-center rounded-xl bg-[#2D4F1E] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#2D4F1E]/25 hover:bg-[#253f18] transition"
            >
              {t.reviews.leaveReview}
            </button>
          </div>
          {reviewsLoading ? (
            <p className="text-slate-500 text-sm">{t.reviews.loading}</p>
          ) : reviews.length === 0 ? (
            <p className="text-slate-500 text-sm">{t.reviews.noReviews}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((r) => {
                const embedUrl = r.video_url ? getVideoEmbedUrl(r.video_url) : null;
                const directVideoUrl = r.video_url && isDirectVideoUrl(r.video_url) ? r.video_url : null;
                const comments = commentsByReview[r.id] ?? [];
                return (
                  <div key={r.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-lg shadow-slate-200/60">
                    <div className="flex gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className={`w-4 h-4 ${r.rating >= i ? 'fill-[#2D4F1E] text-[#2D4F1E]' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">{r.user_name || t.reviews.customer}</p>
                    <p className="text-sm text-slate-600 mb-3">{r.reason}</p>
                    {directVideoUrl && (
                      <div className="rounded-xl overflow-hidden mb-3 aspect-video bg-slate-100">
                        <video src={directVideoUrl} controls className="w-full h-full" playsInline />
                      </div>
                    )}
                    {!directVideoUrl && embedUrl && (
                      <div className="rounded-xl overflow-hidden mb-3 aspect-video bg-slate-100">
                        <iframe src={embedUrl} title="Review video" className="w-full h-full" allowFullScreen />
                      </div>
                    )}
                    <div className="border-t border-slate-100 pt-3 mt-3">
                      {comments.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {comments.map((c) => (
                            <div key={c.id} className="ml-3 pl-3 border-l-2 border-[#eef2e7] bg-[#f6f8f3]/60 rounded-r-lg py-2 pr-2">
                              <p className="text-xs font-medium text-slate-800">{c.user_name || t.reviews.customer}</p>
                              <p className="text-xs text-slate-600">{c.body}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {user ? (
                        replyingTo === r.id ? (
                          <div className="space-y-2">
                            <textarea value={replyBody} onChange={(e) => setReplyBody(e.target.value)} placeholder={t.reviews.replyPlaceholder} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2D4F1E] focus:outline-none resize-none" />
                            <div className="flex gap-2">
                              <button type="button" onClick={() => handleReplySubmit(r.id)} disabled={replySubmitting || !replyBody.trim()} className="rounded-lg bg-[#2D4F1E] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#253f18] disabled:opacity-50">
                                {replySubmitting ? t.reviews.posting : t.reviews.postReply}
                              </button>
                              <button type="button" onClick={() => { setReplyingTo(null); setReplyBody(''); }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                                {authCopy.cancel}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button type="button" onClick={() => setReplyingTo(r.id)} className="inline-flex items-center gap-1 text-xs font-medium text-[#2D4F1E] hover:text-[#253f18]">
                            <MessageCircle className="w-3.5 h-3.5" /> {t.reviews.reply}
                          </button>
                        )
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setReviewModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-900 mb-4">{t.reviews.leaveReview}</h2>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{t.reviews.yourRating}</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button key={i} type="button" onClick={() => setReviewRating(i)} className="p-1 rounded transition">
                        <Star className={`w-8 h-8 ${reviewRating >= i ? 'fill-[#2D4F1E] text-[#2D4F1E]' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{t.reviews.reasonLabel}</label>
                  <textarea value={reviewReason} onChange={(e) => setReviewReason(e.target.value)} placeholder={t.reviews.reasonPlaceholder} required minLength={20} rows={4} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-[#2D4F1E] focus:outline-none resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{t.reviews.videoUploadLabel}</label>
                  <input
                    type="file"
                    accept={VIDEO_ACCEPT}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.size > VIDEO_MAX_BYTES) {
                        showReviewToast(t.reviews.videoSizeError);
                        e.target.value = '';
                        return;
                      }
                      setReviewVideoFile(file ?? null);
                    }}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 file:mr-3 file:rounded-lg file:border-0 file:bg-[#eef2e7] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#2D4F1E] hover:file:bg-[#e2e8d8]"
                  />
                  <p className="text-xs text-slate-500 mt-1">{t.reviews.videoUploadHint}</p>
                  {reviewVideoFile && (
                    <p className="text-xs text-[#2D4F1E] mt-1 font-medium">
                      {(reviewVideoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  )}
                  {videoUploading && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-[#2D4F1E]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t.reviews.uploadingVideo}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={reviewSubmitting || reviewRating === 0 || videoUploading} className="flex-1 rounded-xl bg-[#2d5a27] px-4 py-3 text-sm font-semibold text-white hover:bg-[#3a6b33] disabled:opacity-50">
                    {reviewSubmitting ? t.reviews.submitting : t.reviews.submit}
                  </button>
                  <button type="button" onClick={() => setReviewModalOpen(false)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    {authCopy.cancel}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <p className="text-slate-600 text-sm mb-4">{t.reviews.signInToPost}</p>
                <button type="button" onClick={() => { setReviewModalOpen(false); openAuthModal('login'); }} className="rounded-xl bg-[#2d5a27] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3a6b33]">
                  {t.nav.login}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {reviewToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] rounded-xl bg-[#2d5a27] text-white px-6 py-3 text-sm font-medium shadow-lg">
          {reviewToast}
        </div>
      )}

      <Footer />
    </div>
  );
}
