import { NextResponse } from "next/server";
import { getSession } from "../../../lib/auth";
import { clearSearches, deleteSearch, listSearches } from "../../../lib/db";

export const dynamic = "force-dynamic";
const unauth = () => NextResponse.json({ error: "Please log in." }, { status: 401 });

export async function GET() {
  const s = await getSession();
  if (!s) return unauth();
  try { return NextResponse.json({ searches: await listSearches(s.uid) }); } catch { return NextResponse.json({ error: "Could not load history." }, { status: 500 }); }
}

export async function DELETE(req: Request) {
  const s = await getSession();
  if (!s) return unauth();
  const p = new URL(req.url).searchParams;
  const id = p.get("id");
  if (!id && p.get("all") !== "1") return NextResponse.json({ error: "Missing id." }, { status: 400 });
  try {
    if (id) await deleteSearch(s.uid, id); else await clearSearches(s.uid);
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Could not delete." }, { status: 500 }); }
}
