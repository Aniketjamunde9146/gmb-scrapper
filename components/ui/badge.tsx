import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", {
  variants: {
    variant: {
      default: "border-transparent bg-accent text-accent-foreground",
      outline: "bg-card text-muted-foreground",
      /** Orange pill used on the landing for "No website". */
      hot: "tier-hot",
      warm: "tier-warm",
      cold: "tier-cold",
      success: "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      danger: "border-red-400/30 bg-red-500/10 text-red-700 dark:text-red-300",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
