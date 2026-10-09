import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { billingError, getProfile, reviewPayment } from "../../../../lib/billing-db";

export const dynamic = "force-dynamic";

/** Admin approves or rejects a payment. Checked twice: here (role) and inside the SQL function (is_admin). */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  if ((await getProfile(session.uid)).role !== "admin") return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  const body = (await req.json().catch(() => ({}))) as { id?: unknown; action?: unknown; note?: unknown };
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (typeof body.id !== "string" || !uuid.test(body.id) || (body.action !== "approve" && body.action !== "reject")) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  try {
    await reviewPayment(body.id, body.action, typeof body.note === "string" ? body.note : undefined);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const { status, message } = billingError(e);
    return NextResponse.json({ error: message }, { status });
  }
}
