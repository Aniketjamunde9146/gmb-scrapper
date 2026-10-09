import { NextResponse } from "next/server";
import { getSession } from "../../../lib/auth";
import { listSaved, clearSaved, removeSaved, saveLead, setFollowUp, setNote, setStatus } from "../../../lib/db";
import { STATUSES, type Lead, type Status } from "../../../lib/types";

export const dynamic = "force-dynamic";

const unauth = () => NextResponse.json({ error: "Please log in." }, { status: 401 });

export async function GET() {
  const s = await getSession();
  if (!s) return unauth();
  try {
    return NextResponse.json({ saved: await listSaved(s.uid) });
  } catch {
    return NextResponse.json({ error: "Could not load saved leads." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return unauth();
  const { lead } = (await req.json()) as { lead?: Lead };
  if (!lead || typeof lead.id !== "string" || typeof lead.name !== "string") {
    return NextResponse.json({ error: "Invalid lead." }, { status: 400 });
  }
  try {
    await saveLead(s.uid, lead);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not save this lead." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const s = await getSession();
  if (!s) return unauth();
  const { id, status, note, followUp } = (await req.json()) as { id?: string; status?: Status; note?: string; followUp?: string | null };
  const okStatus = !!status && STATUSES.includes(status);
  const hasFollowUp = followUp === null || followUp === "" || (typeof followUp === "string" && /^\d{4}-\d{2}-\d{2}$/.test(followUp));
  if (!id || (!okStatus && typeof note !== "string" && !hasFollowUp)) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  try {
    if (okStatus) await setStatus(s.uid, id, status!);
    if (typeof note === "string") await setNote(s.uid, id, note);
    if (hasFollowUp) await setFollowUp(s.uid, id, followUp || null);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not update this lead. If you just added follow-up dates, run the latest supabase/schema.sql once." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const s = await getSession();
  if (!s) return unauth();
  const params = new URL(req.url).searchParams;
  const id = params.get("id");
  if (!id && params.get("all") !== "1") return NextResponse.json({ error: "Missing id." }, { status: 400 });
  try {
    if (id) await removeSaved(s.uid, id);
    else await clearSaved(s.uid);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not remove this lead." }, { status: 500 });
  }
}
