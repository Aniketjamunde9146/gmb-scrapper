import { AlertCircle } from "lucide-react";

/** Shown instead of a crash when the admin SQL has not been run yet. */
export function SetupNotice() {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
      <p>Admin tools are not set up yet. Open Supabase → SQL Editor and run <code className="rounded bg-muted px-1 py-0.5">supabase/admin-controls.sql</code> once, then reload this page.</p>
    </div>
  );
}
