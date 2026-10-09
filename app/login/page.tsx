import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "../../components/auth/auth-shell";
import { AuthPanel } from "../../components/auth/auth-modal";
import { getSession } from "../../lib/auth";
import { safeNext } from "../../lib/utils";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to see your leads.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/" },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  if (await getSession()) redirect(safeNext(next));
  return (
    <AuthShell mode="login">
      <AuthPanel initialMode="login" next={next ?? "/dashboard"} initialError={error === "confirm" ? "That link expired. Log in or sign up again." : error === "oauth" ? "Google sign-in failed. Please try again." : ""} />
    </AuthShell>
  );
}
