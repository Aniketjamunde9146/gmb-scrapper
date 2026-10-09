import type { Metadata } from "next";
import { requireAdmin } from "../../../lib/auth";
import { getSettings, listLog, type LogRow } from "../../../lib/admin-db";
import { AdminSettings } from "../../../components/admin/admin-settings";
import { SetupNotice } from "../../../components/admin/setup-notice";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

const when = (iso: string) => new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
const ACTION: Record<string, string> = {
  block: "Blocked", unblock: "Unblocked", credits: "Credits", daily_limit: "Daily limit", reset_free: "Reset free searches", settings: "Changed settings",
};

export default async function AdminSettingsPage() {
  await requireAdmin("/admin/settings");
  const settings = await getSettings();
  let log: LogRow[] = [];
  let failed = false;
  try {
    log = await listLog(40);
  } catch {
    failed = true;
  }
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Switches that apply to the whole site.</p>
      {failed ? (
        <div className="mt-6"><SetupNotice /></div>
      ) : (
        <>
          <div className="mt-6"><AdminSettings initial={settings} /></div>
          <section aria-labelledby="log-h" className="mt-10">
            <h2 id="log-h" className="mb-3 text-lg font-semibold">Activity log</h2>
            {log.length === 0 ? (
              <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">Nothing yet. Blocks, credit changes and limits show up here.</p>
            ) : (
              <ul className="divide-y rounded-xl border bg-card">
                {log.map((l) => (
                  <li key={l.id} className="flex flex-wrap items-baseline justify-between gap-2 p-3 text-sm">
                    <span className="min-w-0"><span className="font-medium">{ACTION[l.action] ?? l.action}</span>{l.target_email && <> · {l.target_email}</>}{l.detail && <span className="text-muted-foreground"> · {l.detail}</span>}</span>
                    <span className="text-xs text-muted-foreground">{l.admin_email || "admin"} · {when(l.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  );
}
