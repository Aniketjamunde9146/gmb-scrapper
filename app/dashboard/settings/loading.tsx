import { PageHeaderSkeleton, Skeleton } from "../../../components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading settings">
      <PageHeaderSkeleton />
      <div className="flex max-w-3xl flex-col gap-5"><Skeleton className="h-44 rounded-2xl" /><Skeleton className="h-52 rounded-2xl" /><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-32 rounded-2xl" /></div>
    </div>
  );
}
