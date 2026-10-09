import { NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { getSession } from "../../../lib/auth";
import { clearSaved, clearSearches, listSaved, listSearches } from "../../../lib/db";
import { createClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

/** Download everything we hold about you (data-portability). */
export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const [saved, searches] = await Promise.all([listSaved(s.uid), listSearches(s.uid, 5000)]);
  return new NextResponse(JSON.stringify({ account: { email: s.email, name: s.name }, saved, searches }, null, 2), {
    headers: { "Content-Type": "application/json", "Content-Disposition": 'attachment; filename="gmb-scraper-my-data.json"' },
  });
}

/** Permanently delete the account. Needs SUPABASE_SERVICE_ROLE_KEY on the server to remove the login itself. */
export async function DELETE() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  try {
    await clearSaved(s.uid);
    await clearSearches(s.uid);
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (key) {
      const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, { auth: { persistSession: false } });
      const { error } = await admin.auth.admin.deleteUser(s.uid);
      if (error) throw error;
    }
    await (await createClient()).auth.signOut();
    return NextResponse.json({ ok: true, fullyDeleted: !!key });
  } catch {
    return NextResponse.json({ error: "Could not delete the account. Please contact support." }, { status: 500 });
  }
}
