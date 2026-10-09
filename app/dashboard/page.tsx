import type { Metadata } from "next";
import { requireSession } from "../../lib/auth";
import { SavedView } from "../../components/dashboard/saved-view";
import { PageHeader } from "../../components/dashboard/page-header";
import { IlSaved } from "../../components/landing/illustrations";

export const metadata: Metadata = { title: "Saved leads" };

export default async function SavedPage() {
  await requireSession("/dashboard/saved");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Saved leads" sub="Move every lead from New to Won. Add notes, set a follow-up date and drag cards on the board." art={<IlSaved />} />
      <SavedView />
    </div>
  );
}
