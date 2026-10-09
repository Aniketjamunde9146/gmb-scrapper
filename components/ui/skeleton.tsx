import { cn } from "../../lib/utils";

/** Shimmering placeholder. Use it where content is about to appear, with the same size as the real thing. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden className={cn("skel rounded-md", className)} {...props} />;
}

export function StatSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between"><Skeleton className="h-3 w-20" /><Skeleton className="size-8 rounded-lg" /></div>
      <Skeleton className="mt-4 h-8 w-24" />
      <Skeleton className="mt-3 h-3 w-32" />
    </div>
  );
}

export function LeadCardSkeleton() {
  return (
    <div className="flex h-full flex-col gap-3.5 rounded-2xl border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1"><Skeleton className="h-5 w-3/4" /><div className="mt-2.5 flex gap-1.5"><Skeleton className="h-5 w-16 rounded-full" /><Skeleton className="h-5 w-20 rounded-full" /></div></div>
        <Skeleton className="size-11 rounded-full" />
      </div>
      <Skeleton className="h-4 w-5/6" />
      <div className="mt-2 flex gap-2"><Skeleton className="h-8 w-28 rounded-lg" /><Skeleton className="h-8 w-24 rounded-lg" /><Skeleton className="h-8 w-20 rounded-lg" /></div>
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-4">
      <div className="min-w-0 flex-1"><Skeleton className="h-5 w-48 max-w-full" /><Skeleton className="mt-2 h-3 w-64 max-w-full" /></div>
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
  );
}

export function PanelSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border bg-card p-5", className)}>
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-2 h-3 w-56 max-w-full" />
      <Skeleton className="mt-5 h-48 w-full rounded-xl" />
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
      <div><Skeleton className="h-9 w-64 max-w-full" /><Skeleton className="mt-3 h-4 w-80 max-w-full" /></div>
      <Skeleton className="hidden h-28 w-56 rounded-2xl md:block" />
    </div>
  );
}
