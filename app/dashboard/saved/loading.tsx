import { LeadCardSkeleton, PageHeaderSkeleton, Skeleton, StatSkeleton } from "../../../components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading saved leads">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}</div>
      <div className="flex gap-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9 w-24 rounded-full" />)}</div>
      <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <LeadCardSkeleton key={i} />)}</div>
    </div>
  );
}
