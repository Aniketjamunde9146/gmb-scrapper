import { PageHeaderSkeleton, Skeleton } from "../../../components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading templates">
      <PageHeaderSkeleton />
      <Skeleton className="h-36 rounded-2xl" />
      <Skeleton className="h-11 w-full max-w-md rounded-lg" />
      <div className="grid gap-4 lg:grid-cols-2"><Skeleton className="h-80 rounded-2xl" /><Skeleton className="h-80 rounded-2xl" /></div>
    </div>
  );
}
