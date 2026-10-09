import { createBrowserClient } from "@supabase/ssr";

/** Browser Supabase client. Only used for Google sign-in and password-reset emails. */
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
