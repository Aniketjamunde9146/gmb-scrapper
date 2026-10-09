import type { Metadata } from "next";
import { requireSession } from "../../../lib/auth";
import { HistoryView } from "../../../components/dashboard/history-view";
import { PageHeader } from "../../../components/dashboard/page-header";
import { IlHistory } from "../../../components/landing/illustrations";

export const metadata: Metadata = { title: "Search history" };

export default async function HistoryPage() {
  await requireSession("/dashboard/history");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Search history" sub="Every search you ran. Re-run one in a tap, or hold the delete button to remove it." art={<IlHistory />} />
      <HistoryView />
    </div>
  );
}
