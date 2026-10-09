"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark, History, LayoutDashboard, LogOut, Menu, MessageSquarePlus, MessageSquareText, Search, Settings, ShieldCheck, TrendingUp, Wallet } from "lucide-react";
import { Logo } from "../logo";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { CommandMenu, OPEN_COMMAND } from "./command-menu";
import { UserProvider } from "./user-context";
import { cn } from "../../lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/search", label: "Search leads", icon: Search },
  { href: "/dashboard/saved", label: "Saved leads", icon: Bookmark },
  { href: "/dashboard/templates", label: "Templates", icon: MessageSquareText },
  { href: "/dashboard/insights", label: "Insights", icon: TrendingUp },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/billing", label: "Credits", icon: Wallet },
  { href: "/dashboard/feedback", label: "Feedback", icon: MessageSquarePlus },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];
const TABS = NAV.slice(0, 5);

type User = { name: string; email: string };
export type Balance = { freeLeft: number; credits: number };
/** Fired by the search page after each search so the sidebar balance updates without a reload. */
export const BALANCE_EVENT = "gmb:balance";

function BalanceCard({ balance, onNavigate }: { balance: Balance; onNavigate?: () => void }) {
  const left = balance.freeLeft + balance.credits;
  return (
    <Link href="/dashboard/billing" onClick={onNavigate} className="mb-2 flex items-center justify-between rounded-lg border bg-card/60 px-3 py-2.5 text-sm transition-colors hover:bg-accent">
      <span className="flex flex-col"><span className="text-xs text-muted-foreground">Searches left</span><span className="font-semibold tabular-nums">{left}</span></span>
      <span className="text-xs text-muted-foreground">{balance.freeLeft > 0 ? `${balance.freeLeft} free` : left === 0 ? "Buy credits" : "Add more"}</span>
    </Link>
  );
}

function SidebarBody({ user, balance, isAdmin, onNavigate }: { user: User; balance: Balance; isAdmin: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  async function logout() {
    setLeaving(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5"><Logo /></div>
      <Separator />
      <nav aria-label="Dashboard" className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        <BalanceCard balance={balance} onNavigate={onNavigate} />
        <p className="px-3 pb-1 pt-2 text-xs font-medium text-muted-foreground">Menu</p>
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} onClick={onNavigate} aria-current={active ? "page" : undefined}
              className={cn("relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors", active ? "bg-accent font-medium text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground")}>
              {active && <span aria-hidden className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-gradient-to-b from-orange-300 to-orange-600" />}
              <Icon className={cn("size-[18px]", active && "text-primary")} aria-hidden /> {label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link href="/admin" onClick={onNavigate} className="mt-2 flex h-10 items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground">
            <ShieldCheck className="size-[18px]" aria-hidden /> Admin panel
          </Link>
        )}
      </nav>
      <Separator />
      <div className="flex items-center gap-3 p-4">
        <span className="grain-saffron grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold">{user.name.charAt(0).toUpperCase()}</span>
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{user.name}</p><p className="truncate text-xs text-muted-foreground">{user.email}</p></div>
        <Button variant="ghost" size="icon" className="size-9" onClick={logout} loading={leaving} aria-label="Log out">{!leaving && <LogOut />}</Button>
      </div>
    </div>
  );
}

function MobileTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Dashboard tabs" className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 px-1 pt-1.5 backdrop-blur-xl lg:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link href={href} aria-current={active ? "page" : undefined} className={cn("flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10.5px] font-medium", active ? "text-primary" : "text-muted-foreground")}>
                <Icon className="size-5" aria-hidden /> {label.replace(" leads", "")}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AppShell({ user, balance: initial, isAdmin, children }: { user: User; balance: Balance; isAdmin: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState<Balance>(initial);
  useEffect(() => setBalance(initial), [initial.freeLeft, initial.credits]);
  useEffect(() => {
    const on = (e: Event) => setBalance((e as CustomEvent<Balance>).detail);
    window.addEventListener(BALANCE_EVENT, on);
    return () => window.removeEventListener(BALANCE_EVENT, on);
  }, []);
  return (
    <UserProvider user={user}>
      <div className="min-h-dvh bg-background">
        <a href="#main" className="sr-only z-50 rounded-lg bg-card px-3 py-2 focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Skip to content</a>
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-card/80 backdrop-blur lg:block"><SidebarBody user={user} balance={balance} isAdmin={isAdmin} /></aside>

        <div className="lg:pl-64">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-xl sm:px-6">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild><Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu"><Menu /></Button></SheetTrigger>
              <SheetContent side="left" className="w-72 max-w-[85vw] p-0">
                <SheetHeader className="sr-only"><SheetTitle>Menu</SheetTitle><SheetDescription>Dashboard navigation</SheetDescription></SheetHeader>
                <SidebarBody user={user} balance={balance} isAdmin={isAdmin} onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
            <div className="lg:hidden"><Logo /></div>
            <div className="ml-auto flex items-center gap-2">
              <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_COMMAND))} className="hidden h-10 items-center gap-2 rounded-lg border bg-card/60 px-3 text-sm text-muted-foreground transition-colors hover:bg-accent sm:flex">
                <Search className="size-4" aria-hidden /> Quick search <kbd className="ml-4 rounded border px-1.5 py-0.5 text-[11px]">Ctrl K</kbd>
              </button>
              <Button variant="ghost" size="icon" className="sm:hidden" aria-label="Quick search" onClick={() => window.dispatchEvent(new Event(OPEN_COMMAND))}><Search /></Button>
              <ThemeToggle />
            </div>
          </header>
          <main id="main" className="mx-auto w-full max-w-6xl p-4 pb-28 sm:p-6 sm:pb-28 lg:p-8 lg:pb-8">{children}</main>
          <MobileTabs />
        </div>
        <CommandMenu />
      </div>
    </UserProvider>
  );
}
