import { NextResponse } from "next/server";
import { getSession } from "../../../lib/auth";
import { billingError } from "../../../lib/billing-db";
import { FEEDBACK_CATEGORIES, submitFeedback, type FeedbackCategory } from "../../../lib/admin-db";

export const dynamic = "force-dynamic";

/** A signed-in user (blocked users too, so they can appeal) sends feedback. Limits are enforced in the database. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { category?: unknown; message?: unknown; rating?: unknown };
  const message = typeof b.message === "string" ? b.message.trim() : "";
  if (message.length < 5) return NextResponse.json({ error: "Please write at least 5 characters." }, { status: 400 });
  if (message.length > 1000) return NextResponse.json({ error: "Please keep it under 1000 characters." }, { status: 400 });
  if (!FEEDBACK_CATEGORIES.includes(b.category as FeedbackCategory)) return NextResponse.json({ error: "Pick a type." }, { status: 400 });
  const rating = b.rating === null || b.rating === undefined ? null : Number(b.rating);
  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) return NextResponse.json({ error: "Rating must be 1 to 5." }, { status: 400 });
  try {
    const feedback = await submitFeedback(b.category as FeedbackCategory, message, rating);
    return NextResponse.json({ feedback });
  } catch (e) {
    const { status, message: m } = billingError(e);
    return NextResponse.json({ error: m }, { status });
  }
}
