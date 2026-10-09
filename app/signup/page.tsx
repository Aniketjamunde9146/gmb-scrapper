import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "../../components/auth/auth-shell";
import { AuthPanel } from "../../components/auth/auth-modal";
import { getSession } from "../../lib/auth";
import { safeNext } from "../../lib/utils";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Create a free account and run your first search in a minute.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/" },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  if (await getSession()) redirect(safeNext(next));
  return (
    <AuthShell mode="signup">
      <AuthPanel initialMode="signup" next={next ?? "/dashboard"} initialError={error === "confirm" ? "That link expired. Log in or sign up again." : error === "oauth" ? "Google sign-in failed. Please try again." : ""} />
    </AuthShell>
  );
}
