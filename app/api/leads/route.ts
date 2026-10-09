import { NextResponse } from "next/server";
import { getSession } from "../../../lib/auth";
import { searchLeads } from "../../../lib/leads";
import { addSearch, isRateLimited } from "../../../lib/db";
import { consumeSearch, refundSearch } from "../../../lib/billing-db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please log in to view leads." }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().slice(0, 60);
  const city = (searchParams.get("city") ?? "").trim().slice(0, 80);
  if (!q || !city) return NextResponse.json({ error: "Enter a business type and a city." }, { status: 400 });
  if (await isRateLimited(session.uid)) {
    return NextResponse.json({ error: "You are searching very fast. Please wait a minute and try again." }, { status: 429 });
  }

  // Take the search first (free searches, then credits). This is atomic, so parallel requests cannot overspend.
  let spend;
  try {
    spend = await consumeSearch();
  } catch (e) {
    console.error("[billing]", e);
    return NextResponse.json({ error: "Billing is not set up yet. Run supabase/billing-admin.sql in Supabase." }, { status: 500 });
  }
  if (!spend.ok) {
    switch (spend.reason) {
      case "blocked":
        return NextResponse.json({ error: spend.message ? `Your account is suspended: ${spend.message}` : "Your account is suspended. Please contact support.", code: "blocked" }, { status: 403 });
      case "paused":
        return NextResponse.json({ error: "Searching is paused for a short while. Please try again soon.", code: "paused" }, { status: 503 });
      case "daily_limit":
        return NextResponse.json({ error: `You have reached today's limit of ${spend.limit ?? 0} searches. It resets at midnight (IST).`, code: "daily_limit" }, { status: 429 });
      default:
        return NextResponse.json({ error: "You have used your free searches. Buy a credit pack to keep searching.", code: "no_credits" }, { status: 402 });
    }
  }

  try {
    const result = await searchLeads(q, city);
    await addSearch(session.uid, q, city, result.leads).catch((e) => console.error("[activity]", e));
    return NextResponse.json({ ...result, balance: { freeLeft: spend.freeLeft, credits: spend.credits } });
  } catch (e) {
    await refundSearch(spend.ticket); // our side failed, so the user keeps their search
    const message = e instanceof Error ? e.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
