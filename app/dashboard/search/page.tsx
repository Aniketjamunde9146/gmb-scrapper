import type { Metadata } from "next";
import { requireSession } from "../../../lib/auth";
import { LeadsView } from "../../../components/dashboard/leads-view";
import { PageHeader } from "../../../components/dashboard/page-header";
import { IlSearch } from "../../../components/landing/illustrations";

export const metadata: Metadata = { title: "Search leads" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; city?: string }> }) {
  const { q = "", city = "" } = await searchParams;
  await requireSession(`/dashboard/search?q=${encodeURIComponent(q)}&city=${encodeURIComponent(city)}`);
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Search leads" sub="Type a business and a city. Every result gets a score, so the businesses most likely to buy from you come first." art={<IlSearch />} />
      <LeadsView key={`${q}|${city}`} initialQ={q} initialCity={city} />
    </div>
  );
}
