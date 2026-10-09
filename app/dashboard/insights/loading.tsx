import { PageHeaderSkeleton, PanelSkeleton, StatSkeleton } from "../../../components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading insights">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}</div>
      <div className="grid gap-4 lg:grid-cols-2"><PanelSkeleton /><PanelSkeleton /></div>
      <div className="grid gap-4 lg:grid-cols-2"><PanelSkeleton /><PanelSkeleton /></div>
    </div>
  );
}
