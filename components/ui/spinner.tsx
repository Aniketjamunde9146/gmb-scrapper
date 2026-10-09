import { Loader2 } from "lucide-react";
import { MapPin } from "lucide-react";
import { cn } from "../../lib/utils";

/** Small inline spinner for buttons and status lines. */
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-4 animate-spin text-primary", className)} aria-hidden />;
}

/** A line of text with a spinner, for "Saving…" style status. */
export function InlineLoader({ label, className }: { label: string; className?: string }) {
  return (
    <p role="status" aria-live="polite" className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <Spinner /> {label}
    </p>
  );
}

/** Full-area loader: the logo mark inside the saffron ring. Use for page transitions and redirects. */
export function PageLoader({ label = "Loading", className }: { label?: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn("grid min-h-[50dvh] place-items-center", className)}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative grid size-14 place-items-center">
          <span className="loader-ring absolute inset-0" aria-hidden />
          <span className="grain-saffron grid size-8 place-items-center rounded-lg"><MapPin className="size-4" strokeWidth={2.4} aria-hidden /></span>
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
