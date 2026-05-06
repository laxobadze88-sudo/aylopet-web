import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

type ConsentStatus = 'accepted_all' | 'rejected_non_essential' | 'customized';

type ConsentPayload = {
  session_id?: string;
  essential?: boolean;
  analytics?: boolean;
  marketing?: boolean;
  consent_status?: ConsentStatus;
  consent_version?: string;
  locale?: 'GE' | 'EN' | string;
  source?: string;
};

function extractClientIp(req: Request): string | null {
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf.trim();
  const xff = req.headers.get('x-forwarded-for');
  if (!xff) return null;
  return xff.split(',')[0]?.trim() || null;
}

function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const salt = process.env.COOKIE_CONSENT_IP_SALT;
  if (!salt) return null;
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(req: Request) {
  try {
    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ ok: false, error: 'Server not configured.' }, { status: 500 });
    }

    const payload = (await req.json()) as ConsentPayload;
    const sessionId = String(payload.session_id ?? '').trim();
    if (!sessionId || !isUuid(sessionId)) {
      return NextResponse.json({ ok: false, error: 'Invalid session_id.' }, { status: 400 });
    }

    const essential = payload.essential !== false;
    const analytics = Boolean(payload.analytics);
    const marketing = Boolean(payload.marketing);
    const consentStatus = payload.consent_status ?? 'customized';
    const consentVersion = payload.consent_version?.trim() || '2026-02-27';
    const locale = String(payload.locale ?? '').trim() || null;
    const source = String(payload.source ?? '').trim() || 'banner';

    let userId: string | null = null;
    const authHeader = req.headers.get('authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : '';
    if (token) {
      const { data, error } = await admin.auth.getUser(token);
      if (!error && data?.user?.id) userId = data.user.id;
    }

    const userAgent = req.headers.get('user-agent');
    const ipHash = hashIp(extractClientIp(req));

    const eventRow = {
      user_id: userId,
      session_id: sessionId,
      essential,
      analytics,
      marketing,
      consent_status: consentStatus,
      consent_version: consentVersion,
      source,
      locale,
      user_agent: userAgent,
      ip_hash: ipHash,
    };

    const { error: insertEventError } = await admin.from('cookie_consent_events').insert(eventRow);
    if (insertEventError) {
      return NextResponse.json({ ok: false, error: insertEventError.message }, { status: 500 });
    }

    const { error: upsertCurrentError } = await admin
      .from('cookie_consents_current')
      .upsert(
        {
          ...eventRow,
          last_action_at: new Date().toISOString(),
        },
        { onConflict: 'session_id' },
      );

    if (upsertCurrentError) {
      return NextResponse.json({ ok: false, error: upsertCurrentError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

