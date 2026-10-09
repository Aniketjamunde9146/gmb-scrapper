import { PageHeaderSkeleton, PanelSkeleton, Skeleton, StatSkeleton } from "../../components/ui/skeleton";

/** Shown instantly while the overview streams in. Same layout as the real page, so nothing jumps. */
export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading your dashboard">
      <PageHeaderSkeleton />
      <Skeleton className="h-16 rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}</div>
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]"><PanelSkeleton /><PanelSkeleton /></div>
      <div className="grid gap-4 lg:grid-cols-2"><PanelSkeleton /><PanelSkeleton /></div>
    </div>
  );
}
