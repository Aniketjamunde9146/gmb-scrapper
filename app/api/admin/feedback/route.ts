import { NextResponse } from "next/server";
import { adminGuard, UUID_RE } from "../../../../lib/admin-guard";
import { reviewFeedback, type FeedbackStatus } from "../../../../lib/admin-db";
import { billingError } from "../../../../lib/billing-db";

export const dynamic = "force-dynamic";

const STATUSES: FeedbackStatus[] = ["new", "reviewed", "resolved"];

/** Admin changes a feedback item's status and can leave a reply the user will see. */
export async function POST(req: Request) {
  const g = await adminGuard();
  if (!g.ok) return g.res;
  const b = (await req.json().catch(() => ({}))) as { id?: unknown; status?: unknown; reply?: unknown };
  if (typeof b.id !== "string" || !UUID_RE.test(b.id) || !STATUSES.includes(b.status as FeedbackStatus)) return NextResponse.json({ error: "Bad request." }, { status: 400 });
  try {
    await reviewFeedback(b.id, b.status as FeedbackStatus, typeof b.reply === "string" ? b.reply.slice(0, 500) : undefined);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const { status, message } = billingError(e);
    return NextResponse.json({ error: message }, { status });
  }
}
