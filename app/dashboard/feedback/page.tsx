import type { Metadata } from "next";
import { requireSession } from "../../../lib/auth";
import { listMyFeedback } from "../../../lib/admin-db";
import { FeedbackView } from "../../../components/dashboard/feedback-view";
import { PageHeader } from "../../../components/dashboard/page-header";

export const metadata: Metadata = { title: "Feedback" };
export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const s = await requireSession("/dashboard/feedback");
  const items = await listMyFeedback(s.uid);
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Feedback" sub="Tell us what works, what is broken and what you would like next. Replies from the team show up here." />
      <FeedbackView items={items} />
    </div>
  );
}
