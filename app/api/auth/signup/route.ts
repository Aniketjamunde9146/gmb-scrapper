import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (name.length < 2) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  if (body.consent !== true) return NextResponse.json({ error: "Please accept the Terms and Privacy Policy to continue." }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // Consent is stored with the account so you can prove when it was given.
    options: { data: { name, consent_at: new Date().toISOString(), consent_version: "2026-10" } },
  });
  if (error) {
    const exists = /already/i.test(error.message);
    return NextResponse.json({ error: exists ? "An account with this email already exists. Try logging in." : error.message }, { status: 400 });
  }
  // Supabase hides duplicate emails (identities is empty) when email confirmation is on.
  if (data.user && data.user.identities?.length === 0) {
    return NextResponse.json({ error: "An account with this email already exists. Try logging in." }, { status: 400 });
  }
  // With "Confirm email" enabled in Supabase there is no session until the user clicks the link.
  return NextResponse.json({ ok: true, confirm: !data.session });
}
