import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { billingError, submitPayment } from "../../../../lib/billing-db";

export const dynamic = "force-dynamic";

/** The user says "I paid pack X, my UTR is Y". Price and credits are decided in the database, not here. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { pack?: unknown; utr?: unknown };
  if (typeof body.pack !== "string" || typeof body.utr !== "string") return NextResponse.json({ error: "Pick a pack and enter your UTR." }, { status: 400 });
  try {
    const payment = await submitPayment(body.pack, body.utr);
    return NextResponse.json({ payment });
  } catch (e) {
    const { status, message } = billingError(e);
    return NextResponse.json({ error: message }, { status });
  }
}
