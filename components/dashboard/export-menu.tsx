"use client";

import * as React from "react";
import { Braces, ChevronDown, Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "../ui/button";
import type { Format } from "./export";

const OPTS: { f: Format; label: string; hint: string; Icon: typeof FileText }[] = [
  { f: "csv", label: "CSV", hint: "Opens in any spreadsheet", Icon: FileText },
  { f: "xlsx", label: "Excel (XLSX)", hint: "Formatted workbook", Icon: FileSpreadsheet },
  { f: "json", label: "JSON", hint: "For developers and APIs", Icon: Braces },
];

/** One dropdown for all export formats. Closes on outside click or Escape. */
export function ExportMenu({ onExport, disabled, count }: { onExport: (f: Format) => void; disabled?: boolean; count?: number }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [open]);
  return (
    <div ref={ref} className="relative self-start sm:self-auto">
      <Button variant="outline" size="sm" disabled={disabled} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Download /> Export{count != null ? ` ${count}` : ""} <ChevronDown className="size-3.5" />
      </Button>
      {open && (
        <div role="menu" className="absolute right-0 z-30 mt-2 w-60 overflow-hidden rounded-2xl border bg-popover p-1.5 text-popover-foreground shadow-xl">
          {OPTS.map(({ f, label, hint, Icon }) => (
            <button key={f} role="menuitem" type="button" onClick={() => { onExport(f); setOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-accent">
              <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" aria-hidden /></span>
              <span><span className="block text-sm font-medium">{label}</span><span className="block text-xs text-muted-foreground">{hint}</span></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
