import { supabase } from '@/lib/supabase';

export type WeightTimelinePoint = {
  timestamp: string;
  weight: number;
};

function parseWeight(row: Record<string, unknown>): number | null {
  const value = row.weight ?? row.weight_kg ?? row.value_kg;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseTimestamp(row: Record<string, unknown>): string | null {
  const raw = row.recorded_at ?? row.created_at ?? row.logged_at ?? row.date;
  if (typeof raw !== 'string' || !raw) return null;
  const time = new Date(raw);
  return Number.isNaN(time.getTime()) ? null : time.toISOString();
}

export async function appendWeightHistoryPoint(
  dogId: string,
  weight: number,
  timestamp = new Date().toISOString()
): Promise<boolean> {
  const n = Number(weight);
  if (!dogId || !Number.isFinite(n) || n <= 0) return false;

  const payloads: Array<Record<string, unknown>> = [
    { dog_id: dogId, weight: n, recorded_at: timestamp },
    { dog_id: dogId, weight: n },
    { dog_id: dogId, weight_kg: n, recorded_at: timestamp },
    { dog_id: dogId, weight_kg: n },
  ];

  for (const payload of payloads) {
    const { error } = await supabase.from('weight_history').insert(payload);
    if (!error) return true;
  }
  return false;
}

export async function fetchWeightTimeline(dogId: string): Promise<WeightTimelinePoint[]> {
  if (!dogId) return [];
  let data: Record<string, unknown>[] | null = null;
  let error: unknown = null;

  // Some environments use `recorded_at`, others `created_at`.
  // Try both order columns so timeline fetch stays resilient.
  const orderCandidates: Array<'recorded_at' | 'created_at' | null> = ['recorded_at', 'created_at', null];
  for (const orderBy of orderCandidates) {
    let query = supabase.from('weight_history').select('*').eq('dog_id', dogId).limit(5000);
    if (orderBy) {
      query = query.order(orderBy, { ascending: true });
    }
    const result = await query;
    if (!result.error && result.data) {
      data = result.data as Record<string, unknown>[];
      error = null;
      break;
    }
    error = result.error;
  }

  if (error || !data) return [];

  const points = (data as Record<string, unknown>[])
    .map((row) => {
      const weight = parseWeight(row);
      const timestamp = parseTimestamp(row);
      if (!weight || !timestamp) return null;
      return { timestamp, weight };
    })
    .filter((p): p is WeightTimelinePoint => Boolean(p));

  points.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  return points;
}
