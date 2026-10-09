import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "../../../lib/auth";
import { listFeedback, type FeedbackRow, type FeedbackStatus } from "../../../lib/admin-db";
import { AdminFeedback } from "../../../components/admin/admin-feedback";
import { SetupNotice } from "../../../components/admin/setup-notice";
import { cn } from "../../../lib/utils";

export const metadata: Metadata = { title: "Feedback" };
export const dynamic = "force-dynamic";

const TABS: { id: FeedbackStatus | "all"; label: string }[] = [
  { id: "new", label: "New" },
  { id: "reviewed", label: "Seen" },
  { id: "resolved", label: "Resolved" },
  { id: "all", label: "All" },
];

export default async function AdminFeedbackPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin("/admin/feedback");
  const { status } = await searchParams;
  const current = TABS.find((t) => t.id === status)?.id ?? "new";
  let items: FeedbackRow[] = [];
  let failed = false;
  try {
    items = await listFeedback(current, 100);
  } catch {
    failed = true;
  }
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Feedback</h1>
      <p className="mt-1 text-sm text-muted-foreground">What users send from the Feedback page. A reply you write here shows up on their Feedback page.</p>
      {failed ? (
        <div className="mt-6"><SetupNotice /></div>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter feedback">
            {TABS.map((t) => (
              <Link key={t.id} href={`/admin/feedback?status=${t.id}`} aria-current={current === t.id ? "true" : undefined}
                className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors", current === t.id ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent")}>{t.label}</Link>
            ))}
          </div>
          <div className="mt-4"><AdminFeedback items={items} /></div>
        </>
      )}
    </>
  );
}
