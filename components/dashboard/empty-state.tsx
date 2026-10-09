import * as React from "react";
import { cn } from "../../lib/utils";

/** Themed empty / error state. Pass one of the landing illustrations (IlSearch, IlFilter, IlExport...). */
export function EmptyState({ art, title, body, action, className }: { art: React.ReactNode; title: string; body?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("lm-root gcard pop-in mx-auto flex w-full max-w-md flex-col items-center rounded-2xl border bg-card p-6 text-center", className)} style={{ color: "var(--foreground)" }}>
      <div className="w-full max-w-xs overflow-hidden rounded-xl border">{art}</div>
      <p className="mt-5 text-lg font-semibold">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
