import type { Metadata } from "next";
import { requireAdmin } from "../../../lib/auth";
import { listPayments } from "../../../lib/billing-db";
import { AdminPayments } from "../../../components/admin/admin-payments";

export const metadata: Metadata = { title: "Payments" };
export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  await requireAdmin("/admin/payments");
  const [pending, recent] = await Promise.all([listPayments("pending"), listPayments("all", 100)]);
  const done = recent.filter((r) => r.status !== "pending");
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
      <p className="mt-1 text-sm text-muted-foreground">Match each UTR with your bank or UPI app, then approve. Approving adds the credits at once.</p>
      <AdminPayments pending={pending} done={done} />
    </>
  );
}
