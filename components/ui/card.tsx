import * as React from "react";
import { cn } from "../../lib/utils";

/** Landing-style card: dark gradient panel with the saffron light that travels around the border on hover. `hot` keeps it lit. */
export function Card({ className, hot, ...props }: React.ComponentProps<"div"> & { hot?: boolean }) {
  return <div className={cn("gcard rounded-2xl border bg-card text-card-foreground", hot && "is-hot", className)} {...props} />;
}
export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />;
}
export function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 className={cn("text-lg font-semibold leading-tight", className)} {...props} />;
}
export function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}
export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}
