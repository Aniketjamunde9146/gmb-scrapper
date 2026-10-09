import { NextResponse } from "next/server";
import { adminGuard } from "../../../../lib/admin-guard";
import { updateSettings } from "../../../../lib/admin-db";
import { billingError } from "../../../../lib/billing-db";

export const dynamic = "force-dynamic";

/** Global switches: default daily limit, pause all searching, announcement banner. */
export async function POST(req: Request) {
  const g = await adminGuard();
  if (!g.ok) return g.res;
  const b = (await req.json().catch(() => ({}))) as { default_daily_limit?: unknown; searches_paused?: unknown; announcement?: unknown };
  let limit: number | null = null;
  if (b.default_daily_limit !== null && b.default_daily_limit !== undefined && b.default_daily_limit !== "") {
    limit = Number(b.default_daily_limit);
    if (!Number.isInteger(limit) || limit < 0 || limit > 100000) return NextResponse.json({ error: "Enter a whole number from 0 to 100000, or leave it empty for no limit." }, { status: 400 });
  }
  try {
    await updateSettings({ default_daily_limit: limit, searches_paused: b.searches_paused === true, announcement: typeof b.announcement === "string" ? b.announcement.slice(0, 240) : "" });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const { status, message } = billingError(e);
    return NextResponse.json({ error: message }, { status });
  }
}
