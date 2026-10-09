import type { Metadata } from "next";
import Link from "next/link";
import { Download, Search } from "lucide-react";
import { requireAdmin } from "../../../lib/auth";
import { USER_FILTERS, getSettings, isUserFilter, listUsers, type AdminUser } from "../../../lib/admin-db";
import { AdminUsers } from "../../../components/admin/admin-users";
import { SetupNotice } from "../../../components/admin/setup-notice";
import { cn } from "../../../lib/utils";

export const metadata: Metadata = { title: "Users" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; filter?: string }> }) {
  await requireAdmin("/admin/users");
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const filter = isUserFilter(sp.filter) ? sp.filter : "all";
  const href = (f: string) => `/admin/users?${new URLSearchParams({ ...(q ? { q } : {}), filter: f }).toString()}`;
  const csv = `/api/admin/users?${new URLSearchParams({ ...(q ? { q } : {}), filter, format: "csv" }).toString()}`;

  let users: AdminUser[] = [];
  let failed = false;
  try {
    users = await listUsers(q, filter, 100);
  } catch {
    failed = true;
  }
  const settings = await getSettings();

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">Block accounts, set daily search limits, add or remove credits. Every change is written to the activity log.</p>
        </div>
        {!failed && <a href={csv} className="inline-flex h-9 items-center gap-2 rounded-lg border bg-card/60 px-3 text-sm font-medium hover:bg-accent"><Download className="size-4" aria-hidden /> Export CSV</a>}
      </div>

      {failed ? (
        <div className="mt-6"><SetupNotice /></div>
      ) : (
        <>
          <form action="/admin/users" method="get" className="mt-5 flex flex-wrap gap-2">
            <label className="relative min-w-0 flex-1 basis-60">
              <span className="sr-only">Search by name or email</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input name="q" defaultValue={q} placeholder="Search name or email" className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary" />
            </label>
            <input type="hidden" name="filter" value={filter} />
            <button type="submit" className="h-10 rounded-lg border bg-card/60 px-4 text-sm font-medium hover:bg-accent">Search</button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter users">
            {USER_FILTERS.map((f) => (
              <Link key={f.id} href={href(f.id)} aria-current={filter === f.id ? "true" : undefined}
                className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors", filter === f.id ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent")}>{f.label}</Link>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">{users.length} {users.length === 1 ? "user" : "users"}{users.length === 100 ? " (showing the newest 100, narrow the search to find others)" : ""}</p>
          <div className="mt-2"><AdminUsers users={users} defaultLimit={settings.default_daily_limit} /></div>
        </>
      )}
    </>
  );
}
