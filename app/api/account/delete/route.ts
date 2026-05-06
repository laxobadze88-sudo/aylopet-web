import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

type DeletePayload = { password?: string };

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return NextResponse.json(
        { ok: false, error: 'Server is not configured. Missing Supabase keys.' },
        { status: 500 },
      );
    }

    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;
    if (!token) {
      return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const payload = (await req.json()) as DeletePayload;
    const password = payload.password ?? '';
    if (!password.trim()) {
      return NextResponse.json({ ok: false, error: 'Password is required.' }, { status: 400 });
    }

    const anon = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    // Identify user by JWT
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) {
      return NextResponse.json({ ok: false, error: 'Could not identify user.' }, { status: 401 });
    }
    const user = userData.user;

    if (!user.email) {
      return NextResponse.json({ ok: false, error: 'User email is missing.' }, { status: 400 });
    }

    // Re-authenticate with password (prevents random deletes even if token leaks)
    const { error: signErr } = await anon.auth.signInWithPassword({ email: user.email, password });
    if (signErr) {
      return NextResponse.json({ ok: false, error: 'Password is incorrect.' }, { status: 403 });
    }

    // Best-effort cleanup via RPC functions (safe if functions exist)
    // If RPC functions are missing, we still proceed with auth user deletion.
    try {
      await admin.rpc('delete_user_storage_objects_safe', { p_user_id: user.id });
    } catch {
      // ignore
    }

    try {
      await admin.rpc('delete_user_app_data_safe', { p_user_id: user.id });
    } catch {
      // ignore
    }

    // Privacy alignment: anonymize email delivery events by email.
    // We keep technical metadata (provider/event_at) but remove the email + raw payload.
    try {
      await admin.rpc('anonymize_email_delivery_events_safe', { p_email: user.email });
    } catch {
      // ignore
    }

    // Delete from Supabase Auth
    // Note: this should cascade via FK constraints where ON DELETE CASCADE exists.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminDelete = (admin.auth as any)?.admin?.deleteUser;
    if (typeof adminDelete !== 'function') {
      return NextResponse.json(
        { ok: false, error: 'Admin deleteUser is not available. Check Supabase client version.' },
        { status: 500 },
      );
    }

    await adminDelete(user.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg || 'Unknown error' }, { status: 500 });
  }
}

