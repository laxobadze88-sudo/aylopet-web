import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

type ResendEventLike = {
  type?: string;
  created_at?: string;
  data?: {
    to?: string | string[];
    email_id?: string;
    reason?: string;
    bounce?: { reason?: string };
  };
};

function normalizeEventType(rawType: string): string {
  const t = rawType.toLowerCase();
  if (t.includes('bounce')) return 'bounced';
  if (t.includes('complain')) return 'complained';
  if (t.includes('drop')) return 'dropped';
  if (t.includes('deliver')) return 'delivered';
  if (t.includes('send')) return 'sent';
  return 'other';
}

function extractEmail(to: string | string[] | undefined): string | null {
  if (!to) return null;
  if (Array.isArray(to)) return (to[0] ?? '').trim().toLowerCase() || null;
  return to.trim().toLowerCase() || null;
}

export async function POST(req: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'RESEND_WEBHOOK_SECRET missing' }, { status: 500 });
  }

  const payload = await req.text();
  const headers = {
    'svix-id': req.headers.get('svix-id') ?? '',
    'svix-timestamp': req.headers.get('svix-timestamp') ?? '',
    'svix-signature': req.headers.get('svix-signature') ?? '',
  };

  try {
    const wh = new Webhook(secret);
    wh.verify(payload, headers);
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 400 });
  }

  const parsed = JSON.parse(payload) as ResendEventLike | ResendEventLike[];
  const events = Array.isArray(parsed) ? parsed : [parsed];

  const rows = events
    .map((event) => {
      const email = extractEmail(event.data?.to);
      if (!email) return null;
      return {
        provider: 'resend',
        email,
        event_type: normalizeEventType(event.type ?? ''),
        event_at: event.created_at ?? new Date().toISOString(),
        reason: event.data?.bounce?.reason ?? event.data?.reason ?? null,
        provider_message_id: event.data?.email_id ?? null,
        raw: event,
      };
    })
    .filter(Boolean) as Array<{
      provider: string;
      email: string;
      event_type: string;
      event_at: string;
      reason: string | null;
      provider_message_id: string | null;
      raw: unknown;
    }>;

  if (rows.length === 0) return NextResponse.json({ ok: true, inserted: 0 });

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: 'Supabase admin env missing' }, { status: 500 });

  const { error } = await admin.from('email_delivery_events').insert(rows);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, inserted: rows.length });
}
