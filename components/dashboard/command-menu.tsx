"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { Bookmark, History, LayoutDashboard, MessageSquareText, Search, Settings, TrendingUp, type LucideIcon } from "lucide-react";
import { loadPrefs } from "../../lib/prefs";
import { cn } from "../../lib/utils";

type Item = { id: string; label: string; hint?: string; icon: LucideIcon; href: string };
const PAGES: Item[] = [
  { id: "p-overview", label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { id: "p-search", label: "Search leads", icon: Search, href: "/dashboard/search" },
  { id: "p-saved", label: "Saved leads", icon: Bookmark, href: "/dashboard/saved" },
  { id: "p-templates", label: "Message templates", icon: MessageSquareText, href: "/dashboard/templates" },
  { id: "p-insights", label: "Insights", icon: TrendingUp, href: "/dashboard/insights" },
  { id: "p-history", label: "Search history", icon: History, href: "/dashboard/history" },
  { id: "p-settings", label: "Settings", icon: Settings, href: "/dashboard/settings" },
];
export const OPEN_COMMAND = "gmb:open-command";

/** Press Ctrl/⌘ + K anywhere in the dashboard. Type "dentist in Pune" and press Enter to search, or jump to any page. */
export function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [idx, setIdx] = React.useState(0);
  const [recent, setRecent] = React.useState<{ q: string; city: string }[]>([]);

  React.useEffect(() => {
    const key = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); } };
    const ev = () => setOpen(true);
    window.addEventListener("keydown", key);
    window.addEventListener(OPEN_COMMAND, ev);
    return () => { window.removeEventListener("keydown", key); window.removeEventListener(OPEN_COMMAND, ev); };
  }, []);

  React.useEffect(() => {
    if (!open) return;
    setValue(""); setIdx(0);
    fetch("/api/history").then((r) => (r.ok ? r.json() : { searches: [] })).then((j: { searches?: { q: string; city: string }[] }) => {
      const seen = new Set<string>();
      setRecent((j.searches ?? []).filter((s) => { const k = `${s.q}|${s.city}`.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 4));
    }).catch(() => {});
  }, [open]);

  const items = React.useMemo<Item[]>(() => {
    const v = value.trim();
    const out: Item[] = [];
    if (v) {
      const m = v.match(/^(.+?)\s+in\s+(.+)$/i);
      const q = m ? m[1] : v;
      const city = m ? m[2] : loadPrefs().city ?? "";
      out.push({ id: "run", label: `Search “${q}”${city ? ` in ${city}` : ""}`, hint: city ? "Run search" : "Add “in your city” to run it", icon: Search, href: `/dashboard/search?q=${encodeURIComponent(q)}${city ? `&city=${encodeURIComponent(city)}` : ""}` });
      out.push(...PAGES.filter((p) => p.label.toLowerCase().includes(v.toLowerCase())));
    } else {
      out.push(...PAGES);
      out.push(...recent.map((s, i) => ({ id: `r${i}`, label: `${s.q} in ${s.city}`, hint: "Recent search", icon: History, href: `/dashboard/search?q=${encodeURIComponent(s.q)}&city=${encodeURIComponent(s.city)}` })));
    }
    return out;
  }, [value, recent]);

  const go = (it: Item | undefined) => { if (!it) return; setOpen(false); router.push(it.href); };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, items.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter") { e.preventDefault(); go(items[idx]); }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content aria-describedby={undefined} className="gcard fixed left-1/2 top-[12vh] z-50 w-[calc(100vw-1.5rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border bg-popover shadow-2xl shadow-black/60 outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <Dialog.Title className="sr-only">Quick search and navigation</Dialog.Title>
          <div className="flex items-center gap-3 border-b px-4">
            <Search className="size-4 text-muted-foreground" aria-hidden />
            <input autoFocus value={value} onChange={(e) => { setValue(e.target.value); setIdx(0); }} onKeyDown={onKey} placeholder="Search leads or jump to a page. Try: dentist in Pune" aria-label="Command" className="h-14 w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground" />
            <kbd className="hidden rounded-md border px-1.5 py-0.5 text-[11px] text-muted-foreground sm:block">Esc</kbd>
          </div>
          <ul role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
            {items.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted-foreground">Nothing matches. Press Enter to search.</li>}
            {items.map((it, i) => (
              <li key={it.id} role="option" aria-selected={i === idx}>
                <button type="button" onMouseEnter={() => setIdx(i)} onClick={() => go(it)} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm", i === idx ? "bg-accent" : "")}>
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><it.icon className="size-4" aria-hidden /></span>
                  <span className="min-w-0 flex-1 truncate">{it.label}</span>
                  {it.hint && <span className="shrink-0 text-xs text-muted-foreground">{it.hint}</span>}
                </button>
              </li>
            ))}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
