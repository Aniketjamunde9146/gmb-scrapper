import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "../../lib/auth";
import { getStats, listFeedback, listUsers, type AdminStats, type AdminUser, type FeedbackRow } from "../../lib/admin-db";
import { SetupNotice } from "../../components/admin/setup-notice";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import { inr } from "../../lib/billing";

export const metadata: Metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

const nf = (n: number) => n.toLocaleString("en-IN");
const day = (iso: string) => new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short" }).format(new Date(iso));

function Stat({ label, value, sub, href, alert }: { label: string; value: string; sub?: string; href?: string; alert?: boolean }) {
  const body = (
    <Card className="h-full p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${alert ? "text-amber-500" : ""}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </Card>
  );
  return href ? <Link href={href} className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary">{body}</Link> : body;
}

export default async function AdminOverviewPage() {
  await requireAdmin("/admin");
  let stats: AdminStats | null = null;
  let recent: AdminUser[] = [];
  let feedback: FeedbackRow[] = [];
  try {
    [stats, recent, feedback] = await Promise.all([getStats(), listUsers("", "all", 5), listFeedback("new", 3)]);
  } catch {
    stats = null;
  }
  if (!stats) {
    return (
      <>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <div className="mt-6"><SetupNotice /></div>
      </>
    );
  }
  const max = Math.max(1, ...stats.series.map((d) => d.searches));
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
      <p className="mt-1 text-sm text-muted-foreground">How the site is doing right now. Days run midnight to midnight, IST.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Users" value={nf(stats.users)} sub={`${nf(stats.new_7d)} joined in 7 days`} href="/admin/users" />
        <Stat label="Active today" value={nf(stats.active_today)} sub={`${nf(stats.searches_today)} searches today`} />
        <Stat label="Revenue (approved)" value={inr(stats.revenue_total)} sub={`${inr(stats.revenue_30d)} in 30 days`} />
        <Stat label="Credits held by users" value={nf(stats.credits_outstanding)} sub="Unspent paid credits" />
        <Stat label="Payments waiting" value={nf(stats.pending_payments)} href="/admin/payments" alert={stats.pending_payments > 0} />
        <Stat label="New feedback" value={nf(stats.new_feedback)} href="/admin/feedback" alert={stats.new_feedback > 0} />
        <Stat label="Blocked users" value={nf(stats.blocked)} href="/admin/users?filter=blocked" />
        <Stat label="Searches, 7 days" value={nf(stats.searches_7d)} />
      </div>

      <Card className="mt-6 p-5">
        <h2 className="text-base font-semibold">Searches per day</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Last 14 days</p>
        <ul className="mt-4 flex h-36 items-end gap-1.5 sm:gap-2" aria-label="Searches per day, last 14 days">
          {stats.series.map((d) => (
            <li key={d.day} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${d.day}: ${d.searches} searches, ${d.users} users`}>
              <span className="text-[10px] tabular-nums text-muted-foreground">{d.searches || ""}</span>
              <span className="w-full rounded-t-md bg-gradient-to-t from-orange-600 to-orange-300" style={{ height: `${Math.max((d.searches / max) * 100, d.searches ? 4 : 1)}%`, opacity: d.searches ? 1 : 0.25 }} />
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between text-[11px] text-muted-foreground"><span>{stats.series[0]?.day}</span><span>{stats.series[stats.series.length - 1]?.day}</span></div>
      </Card>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section aria-labelledby="ru-h">
          <div className="mb-3 flex items-center justify-between"><h2 id="ru-h" className="text-lg font-semibold">Newest users</h2><Link href="/admin/users" className="text-sm text-primary hover:underline">See all</Link></div>
          <ul className="divide-y rounded-xl border bg-card">
            {recent.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                <span className="min-w-0"><span className="block truncate font-medium">{u.name || u.email.split("@")[0]}</span><span className="block truncate text-xs text-muted-foreground">{u.email}</span></span>
                <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">{u.blocked && <Badge variant="danger">Blocked</Badge>}{day(u.created_at)}</span>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="rf-h">
          <div className="mb-3 flex items-center justify-between"><h2 id="rf-h" className="text-lg font-semibold">Latest new feedback</h2><Link href="/admin/feedback" className="text-sm text-primary hover:underline">Open inbox</Link></div>
          {feedback.length === 0 ? <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">Nothing new.</p> : (
            <ul className="divide-y rounded-xl border bg-card">
              {feedback.map((f) => (
                <li key={f.id} className="p-3 text-sm"><p className="line-clamp-2">{f.message}</p><p className="mt-1 text-xs text-muted-foreground">{f.email || "no email"} · {day(f.created_at)}</p></li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
