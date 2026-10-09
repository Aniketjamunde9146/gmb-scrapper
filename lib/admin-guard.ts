import { NextResponse } from "next/server";
import { getSession } from "./auth";
import { getProfile } from "./billing-db";

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** First line of every /api/admin route: 401 when signed out, 403 when not an admin. The database checks again. */
export async function adminGuard(): Promise<{ ok: true; uid: string } | { ok: false; res: NextResponse }> {
  const session = await getSession();
  if (!session) return { ok: false, res: NextResponse.json({ error: "Please log in." }, { status: 401 }) };
  if ((await getProfile(session.uid)).role !== "admin") return { ok: false, res: NextResponse.json({ error: "Not allowed." }, { status: 403 }) };
  return { ok: true, uid: session.uid };
}
