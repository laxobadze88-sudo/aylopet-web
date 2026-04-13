export type Lang = 'GE' | 'EN';

export const CITY_OPTIONS = [
  { key: 'tbilisi', nameGe: 'თბილისი', nameEn: 'Tbilisi' },
  { key: 'batumi', nameGe: 'ბათუმი', nameEn: 'Batumi' },
  { key: 'kutaisi', nameGe: 'ქუთაისი', nameEn: 'Kutaisi' },
  { key: 'rustavi', nameGe: 'რუსთავი', nameEn: 'Rustavi' },
  { key: 'gori', nameGe: 'გორი', nameEn: 'Gori' },
  { key: 'zugdidi', nameGe: 'ზუგდიდი', nameEn: 'Zugdidi' },
  { key: 'poti', nameGe: 'ფოთი', nameEn: 'Poti' },
  { key: 'telavi', nameGe: 'თელავი', nameEn: 'Telavi' },
  { key: 'other', nameGe: 'სხვა', nameEn: 'Other' },
] as const;

const DELIVERY_CITY_KEYS = ['tbilisi', 'batumi', 'kutaisi'];

export function getCityDisplayName(key: string | null | undefined, lang: Lang): string {
  if (!key) return '—';
  const opt = CITY_OPTIONS.find((c) => c.key === key.toLowerCase());
  return opt ? (lang === 'GE' ? opt.nameGe : opt.nameEn) : key;
}

export function normalizeCityKey(value: string | null | undefined): string {
  if (!value) return '';
  const lower = value.toLowerCase();
  const byKey = CITY_OPTIONS.find((c) => c.key === lower);
  if (byKey) return byKey.key;
  const byNameEn = CITY_OPTIONS.find((c) => c.nameEn.toLowerCase() === lower);
  if (byNameEn) return byNameEn.key;
  const byNameGe = CITY_OPTIONS.find((c) => c.nameGe === value);
  if (byNameGe) return byNameGe.key;
  return lower;
}

export function isDeliveryCity(cityKey: string | null | undefined): boolean {
  return DELIVERY_CITY_KEYS.includes(normalizeCityKey(cityKey) || '');
}
