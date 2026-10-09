"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, SlidersHorizontal, Users, Wallet } from "lucide-react";
import { cn } from "../../lib/utils";

const TABS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: Wallet, badge: "payments" as const },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquare, badge: "feedback" as const },
  { href: "/admin/settings", label: "Settings", icon: SlidersHorizontal },
];

export function AdminNav({ counts }: { counts: { payments: number; feedback: number } }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin sections" className="border-b bg-background/60">
      <ul className="mx-auto flex w-full max-w-5xl gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
        {TABS.map(({ href, label, icon: Icon, exact, badge }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          const n = badge ? counts[badge] : 0;
          return (
            <li key={href} className="shrink-0">
              <Link href={href} aria-current={active ? "page" : undefined}
                className={cn("relative flex h-11 items-center gap-2 px-3 text-sm transition-colors", active ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground")}>
                <Icon className={cn("size-4", active && "text-primary")} aria-hidden /> {label}
                {n > 0 && <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">{n > 99 ? "99+" : n}</span>}
                {active && <span aria-hidden className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-orange-300 to-orange-600" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
