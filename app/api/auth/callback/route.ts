import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "../../../../lib/supabase/server";
import { safeNext } from "../../../../lib/utils";

/** Target for Google sign-in, confirmation emails and password-reset links. Supabase → Auth → URL Configuration: add https://yourdomain.com/api/auth/callback */
export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));
  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const store = await cookies();
      const ts = store.get("gmb_terms")?.value;
      // First Google sign-in: record when the person accepted the Terms.
      if (ts && data.user && !data.user.user_metadata?.consent_at) {
        await supabase.auth.updateUser({ data: { consent_at: new Date(Number(ts)).toISOString(), consent_version: "2026-10" } }).catch(() => {});
      }
      store.delete("gmb_terms");
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=confirm`);
}
