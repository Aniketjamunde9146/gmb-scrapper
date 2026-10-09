"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "../ui/skeleton";

// recharts is the heaviest dependency, so it is downloaded as a separate chunk only when the chart is shown.
const Chart = dynamic(() => import("./activity-chart-impl"), { ssr: false, loading: () => <Skeleton className="h-64 w-full rounded-xl" /> });

export function ActivityChart({ data }: { data: { day: string; leads: number; searches: number }[] }) {
  if (data.every((d) => d.leads === 0)) {
    return (
      <div className="grid h-64 place-items-center text-center text-sm text-muted-foreground">
        <p>
          Your chart fills in as you search.
          <br />
          Run your first search to see leads found per day.
        </p>
      </div>
    );
  }
  return <Chart data={data} />;
}
