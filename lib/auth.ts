import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { getProfile } from "./billing-db";

export type Session = { uid: string; name: string; email: string };

/** Current user from Supabase (verified with the auth server, not just the cookie). Cached per request. */
export const getSession = cache(async (): Promise<Session | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const u = data.user;
  if (!u) return null;
  const email = u.email ?? "";
  const name = (u.user_metadata?.name as string | undefined) || email.split("@")[0] || "there";
  return { uid: u.id, name, email };
});

/** Use at the top of protected pages: signed-out visitors go to /login and come back to `next`. */
export async function requireSession(next: string) {
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(next)}`);
  return session;
}

/** Admin pages: signed-out visitors go to /login, signed-in non-admins get a 404 (the panel is not advertised). Role comes from profiles.role in Supabase. */
export async function requireAdmin(next: string) {
  const session = await requireSession(next);
  const profile = await getProfile(session.uid);
  if (profile.role !== "admin") notFound();
  return session;
}
