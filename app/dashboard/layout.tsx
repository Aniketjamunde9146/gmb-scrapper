import type { Metadata } from "next";
import { Megaphone, PauseCircle } from "lucide-react";
import { getSession } from "../../lib/auth";
import { getProfile } from "../../lib/billing-db";
import { getSettings } from "../../lib/admin-db";
import { whatsappNumber } from "../../lib/billing";
import { AppShell } from "../../components/dashboard/app-shell";
import { BlockedScreen } from "../../components/dashboard/blocked-screen";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · GMB Scraper" },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  // Each page calls requireSession() with its own return path; without a session they redirect to /login.
  if (!session) return <>{children}</>;
  const [profile, settings] = await Promise.all([getProfile(session.uid), getSettings()]);
  // Blocked by an admin: no dashboard at all (admins can never be blocked).
  if (profile.blocked && profile.role !== "admin") return <BlockedScreen reason={profile.blockedReason} whatsapp={whatsappNumber()} />;
  return (
    <AppShell user={{ name: session.name, email: session.email }} balance={{ freeLeft: profile.freeLeft, credits: profile.credits }} isAdmin={profile.role === "admin"}>
      {settings.searches_paused && (
        <div role="status" className="mb-4 flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          <PauseCircle className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
          <p>Searching is paused for a short while. You will not be charged. Please try again soon.</p>
        </div>
      )}
      {settings.announcement && (
        <div role="status" className="mb-4 flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm">
          <Megaphone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <p className="min-w-0 break-words">{settings.announcement}</p>
        </div>
      )}
      {children}
    </AppShell>
  );
}
