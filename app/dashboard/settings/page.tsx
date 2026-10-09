import type { Metadata } from "next";
import { requireSession } from "../../../lib/auth";
import { SettingsView } from "../../../components/dashboard/settings-view";
import { PageHeader } from "../../../components/dashboard/page-header";
import { IlSettings } from "../../../components/landing/illustrations";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const s = await requireSession("/dashboard/settings");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" sub="Your name, search defaults, appearance and data. Your leads stay private to your account." art={<IlSettings />} />
      <SettingsView name={s.name} email={s.email} />
    </div>
  );
}
