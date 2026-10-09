import { PageHeaderSkeleton, RowSkeleton, Skeleton } from "../../../components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading history">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-3 gap-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
      <div className="grid gap-3">{Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}</div>
    </div>
  );
}
