import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { requireAdmin } from "../../lib/auth";
import { getAdminCounts } from "../../lib/admin-db";
import { AdminNav } from "../../components/admin/admin-nav";
import { Logo } from "../../components/logo";
import { ThemeToggle } from "../../components/theme-toggle";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Shared frame for every /admin page. Each page ALSO calls requireAdmin(), because layouts are not re-run on client-side navigation. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin("/admin");
  const counts = await getAdminCounts();
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-xl sm:px-6">
        <Logo />
        <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground"><ShieldCheck className="size-3.5" aria-hidden /> Admin</span>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/dashboard" className="inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm text-muted-foreground transition-colors hover:bg-accent"><ArrowLeft className="size-4" aria-hidden /> Dashboard</Link>
          <ThemeToggle />
        </div>
      </header>
      <AdminNav counts={counts} />
      <main className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
