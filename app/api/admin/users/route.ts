import { NextResponse } from "next/server";
import { adminGuard, UUID_RE } from "../../../../lib/admin-guard";
import { adjustCredits, isUserFilter, listUsers, resetFree, setBlocked, setDailyLimit } from "../../../../lib/admin-db";
import { billingError } from "../../../../lib/billing-db";

export const dynamic = "force-dynamic";

/** Spreadsheet apps run text starting with = + - @ as a formula, so those cells get a leading quote. */
const cell = (v: unknown) => {
  const s = String(v ?? "");
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

/** GET /api/admin/users?format=csv&q=...&filter=... downloads the user list. */
export async function GET(req: Request) {
  const g = await adminGuard();
  if (!g.ok) return g.res;
  const p = new URL(req.url).searchParams;
  const filter = p.get("filter");
  try {
    const users = await listUsers(p.get("q") ?? "", isUserFilter(filter) ? filter : "all", 500);
    const head = ["Name", "Email", "Role", "Status", "Block reason", "Credits", "Free used", "Daily limit", "Searches total", "Searches today", "Paid (INR)", "Joined", "Last search"];
    const rows = users.map((u) => [u.name, u.email, u.role, u.blocked ? "blocked" : "active", u.blocked_reason ?? "", u.credits, u.free_used, u.daily_limit ?? "default", u.searches_total, u.searches_today, u.paid_inr, u.created_at, u.last_search_at ?? ""]);
    const csv = [head, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
    return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="gmb-scraper-users.csv"' } });
  } catch (e) {
    const { status, message } = billingError(e);
    return NextResponse.json({ error: message }, { status });
  }
}

type Body = { id?: unknown; action?: unknown; reason?: unknown; delta?: unknown; limit?: unknown; note?: unknown };

/** Admin actions on one user: block, unblock, credits, limit, reset_free. */
export async function POST(req: Request) {
  const g = await adminGuard();
  if (!g.ok) return g.res;
  const b = (await req.json().catch(() => ({}))) as Body;
  if (typeof b.id !== "string" || !UUID_RE.test(b.id) || typeof b.action !== "string") return NextResponse.json({ error: "Bad request." }, { status: 400 });
  const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);

  try {
    switch (b.action) {
      case "block":
        await setBlocked(b.id, true, text(b.reason, 200));
        break;
      case "unblock":
        await setBlocked(b.id, false);
        break;
      case "credits": {
        const delta = Number(b.delta);
        if (!Number.isInteger(delta) || delta === 0 || Math.abs(delta) > 10000) return NextResponse.json({ error: "Enter a whole number between 1 and 10000." }, { status: 400 });
        const credits = await adjustCredits(b.id, delta, text(b.note, 100));
        return NextResponse.json({ ok: true, credits });
      }
      case "limit": {
        if (b.limit === null || b.limit === "") {
          await setDailyLimit(b.id, null);
          break;
        }
        const limit = Number(b.limit);
        if (!Number.isInteger(limit) || limit < 0 || limit > 100000) return NextResponse.json({ error: "Enter a whole number from 0 to 100000, or clear it." }, { status: 400 });
        await setDailyLimit(b.id, limit);
        break;
      }
      case "reset_free":
        await resetFree(b.id);
        break;
      default:
        return NextResponse.json({ error: "Bad request." }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const { status, message } = billingError(e);
    return NextResponse.json({ error: message }, { status });
  }
}
