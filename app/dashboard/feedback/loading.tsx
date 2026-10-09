import { PageHeaderSkeleton, Skeleton } from "../../../components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading feedback">
      <PageHeaderSkeleton />
      <Skeleton className="h-72 max-w-3xl rounded-2xl" />
    </div>
  );
}
