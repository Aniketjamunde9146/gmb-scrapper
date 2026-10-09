import type { Metadata } from "next";
import { requireSession } from "../../../lib/auth";
import { TemplatesView } from "../../../components/dashboard/templates-view";
import { PageHeader } from "../../../components/dashboard/page-header";
import { IlTemplates } from "../../../components/landing/illustrations";

export const metadata: Metadata = { title: "Message templates" };

export default async function TemplatesPage() {
  await requireSession("/dashboard/templates");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Message templates" sub="Ready-to-send WhatsApp, email and call scripts for each kind of lead. Edit the wording once and reuse it everywhere." art={<IlTemplates />} />
      <TemplatesView />
    </div>
  );
}
