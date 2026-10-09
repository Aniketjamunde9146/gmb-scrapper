import type { Metadata } from "next";
import { requireSession } from "../../../lib/auth";
import { getProfile, listMyPayments } from "../../../lib/billing-db";
import { PageHeader } from "../../../components/dashboard/page-header";
import { BillingView } from "../../../components/dashboard/billing-view";
import { payee, paymentsReady, whatsappNumber } from "../../../lib/billing";

export const metadata: Metadata = { title: "Credits" };
export const dynamic = "force-dynamic";

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ need?: string }> }) {
  const { need } = await searchParams;
  const session = await requireSession("/dashboard/billing");
  const [profile, payments] = await Promise.all([getProfile(session.uid), listMyPayments(session.uid)]);
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Credits" sub="Every search uses one credit. You get 3 free searches, then pay once for a pack. No subscription." />
      <BillingView
        needMore={need === "1"}
        freeLeft={profile.freeLeft}
        credits={profile.credits}
        payments={payments}
        email={session.email}
        ready={paymentsReady()}
        upiId={payee.upiId}
        upiName={payee.name}
        qr={payee.qr}
        whatsapp={whatsappNumber()}
      />
    </div>
  );
}
