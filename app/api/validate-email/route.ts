import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'yopmail.com',
  'trashmail.com',
  'getnada.com',
  'temp-mail.org',
]);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function hasMxOrARecord(domain: string): Promise<boolean> {
  try {
    const mxResp = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`,
      { headers: { accept: 'application/dns-json' }, cache: 'no-store' }
    );
    if (mxResp.ok) {
      const mxJson = (await mxResp.json()) as { Answer?: Array<{ type?: number }> };
      if (mxJson.Answer?.some((r) => r.type === 15)) return true;
    }

    const aResp = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`,
      { headers: { accept: 'application/dns-json' }, cache: 'no-store' }
    );
    if (!aResp.ok) return false;
    const aJson = (await aResp.json()) as { Answer?: Array<{ type?: number }> };
    return Boolean(aJson.Answer?.some((r) => r.type === 1));
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawEmail = (searchParams.get('email') ?? '').trim().toLowerCase();

  if (!rawEmail || !EMAIL_REGEX.test(rawEmail)) {
    return NextResponse.json({ ok: false, reason: 'invalid_format' }, { status: 200 });
  }

  const parts = rawEmail.split('@');
  const domain = parts[1];
  if (!domain) {
    return NextResponse.json({ ok: false, reason: 'invalid_format' }, { status: 200 });
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return NextResponse.json({ ok: false, reason: 'disposable_domain' }, { status: 200 });
  }

  const hasDns = await hasMxOrARecord(domain);
  if (!hasDns) {
    return NextResponse.json({ ok: false, reason: 'domain_unreachable' }, { status: 200 });
  }

  const admin = getSupabaseAdmin();
  if (admin) {
    const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString();
    const { data } = await admin
      .from('email_delivery_events')
      .select('event_type,event_at')
      .eq('email', rawEmail)
      .in('event_type', ['bounced', 'complained', 'dropped'])
      .gte('event_at', since)
      .order('event_at', { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      return NextResponse.json({ ok: false, reason: 'recent_bounce' }, { status: 200 });
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
