import { LeadCardSkeleton, PageHeaderSkeleton, Skeleton } from "../../../components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading search">
      <PageHeaderSkeleton />
      <Skeleton className="h-16 rounded-2xl" />
      <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <LeadCardSkeleton key={i} />)}</div>
    </div>
  );
}
