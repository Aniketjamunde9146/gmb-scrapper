import { createClient } from "./supabase/server";

/**
 * Admin-only data access. Every call goes through a SQL function that checks is_admin() itself,
 * so a non-admin gets "not_admin" from the database even if this code were reached by mistake.
 * Needs supabase/admin-controls.sql.
 */

export type UserFilter = "all" | "active" | "blocked" | "paid" | "empty" | "admins";
export const USER_FILTERS: { id: UserFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active (7 days)" },
  { id: "empty", label: "Out of searches" },
  { id: "paid", label: "Paid" },
  { id: "blocked", label: "Blocked" },
  { id: "admins", label: "Admins" },
];
export const isUserFilter = (v: unknown): v is UserFilter => USER_FILTERS.some((f) => f.id === v);

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  blocked: boolean;
  blocked_reason: string | null;
  credits: number;
  free_used: number;
  daily_limit: number | null;
  created_at: string;
  last_sign_in: string | null;
  searches_total: number;
  searches_today: number;
  last_search_at: string | null;
  paid_inr: number;
};

export type AdminStats = {
  users: number;
  new_7d: number;
  blocked: number;
  active_today: number;
  searches_today: number;
  searches_7d: number;
  revenue_total: number;
  revenue_30d: number;
  pending_payments: number;
  new_feedback: number;
  credits_outstanding: number;
  series: { day: string; searches: number; users: number }[];
};

export type FeedbackCategory = "bug" | "idea" | "praise" | "other";
export type FeedbackStatus = "new" | "reviewed" | "resolved";
export type FeedbackRow = {
  id: string;
  email: string;
  category: FeedbackCategory;
  rating: number | null;
  message: string;
  status: FeedbackStatus;
  admin_reply: string | null;
  created_at: string;
  reviewed_at: string | null;
};
export const FEEDBACK_CATEGORIES: FeedbackCategory[] = ["bug", "idea", "praise", "other"];

export type AppSettings = { default_daily_limit: number | null; searches_paused: boolean; announcement: string };
export type LogRow = { id: number; admin_email: string; target_email: string; action: string; detail: string | null; created_at: string };

const FEEDBACK_COLS = "id, email, category, rating, message, status, admin_reply, created_at, reviewed_at";
const num = (v: unknown) => Number(v ?? 0);

export async function listUsers(search = "", filter: UserFilter = "all", limit = 100): Promise<AdminUser[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_list_users", { p_search: search.trim().slice(0, 80) || null, p_filter: filter, p_limit: limit });
  if (error) throw error;
  return ((data ?? []) as AdminUser[]).map((u) => ({
    ...u,
    searches_total: num(u.searches_total),
    searches_today: num(u.searches_today),
    paid_inr: num(u.paid_inr),
  }));
}

export async function getStats(): Promise<AdminStats> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_stats");
  if (error) throw error;
  return data as AdminStats;
}

/** Cheap counts for the little badges on the admin tabs. Never throws. */
export async function getAdminCounts(): Promise<{ payments: number; feedback: number }> {
  const supabase = await createClient();
  const [p, f] = await Promise.all([
    supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("feedback").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);
  return { payments: p.count ?? 0, feedback: f.count ?? 0 };
}

export async function setBlocked(id: string, blocked: boolean, reason?: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_blocked", { p_user: id, p_blocked: blocked, p_reason: reason ?? null });
  if (error) throw error;
}

export async function adjustCredits(id: string, delta: number, note?: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_adjust_credits", { p_user: id, p_delta: delta, p_note: note ?? null });
  if (error) throw error;
  return num(data);
}

export async function setDailyLimit(id: string, limit: number | null) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_daily_limit", { p_user: id, p_limit: limit });
  if (error) throw error;
}

export async function resetFree(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_reset_free", { p_user: id });
  if (error) throw error;
}

/** Global settings. Readable by every signed-in user (for the announcement and the pause notice). Never throws. */
export async function getSettings(): Promise<AppSettings> {
  const fallback: AppSettings = { default_daily_limit: null, searches_paused: false, announcement: "" };
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("app_settings").select("default_daily_limit, searches_paused, announcement").eq("id", 1).maybeSingle();
    return data ? { default_daily_limit: data.default_daily_limit, searches_paused: !!data.searches_paused, announcement: data.announcement ?? "" } : fallback;
  } catch {
    return fallback;
  }
}

export async function updateSettings(s: AppSettings) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_update_settings", { p_default_daily_limit: s.default_daily_limit, p_paused: s.searches_paused, p_announcement: s.announcement });
  if (error) throw error;
}

export async function listLog(limit = 40): Promise<LogRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("admin_log").select("id, admin_email, target_email, action, detail, created_at").order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []) as LogRow[];
}

/* ---------- feedback ---------- */

export async function listFeedback(status: FeedbackStatus | "all", limit = 100): Promise<FeedbackRow[]> {
  const supabase = await createClient();
  let q = supabase.from("feedback").select(FEEDBACK_COLS).order("created_at", { ascending: false }).limit(limit);
  if (status !== "all") q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as FeedbackRow[];
}

export async function reviewFeedback(id: string, status: FeedbackStatus, reply?: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_review_feedback", { p_id: id, p_status: status, p_reply: reply ?? null });
  if (error) throw error;
}

export async function listMyFeedback(uid: string): Promise<FeedbackRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("feedback").select(FEEDBACK_COLS).eq("user_id", uid).order("created_at", { ascending: false }).limit(20);
  return (data ?? []) as FeedbackRow[];
}

export async function submitFeedback(category: FeedbackCategory, message: string, rating: number | null): Promise<FeedbackRow> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_feedback", { p_category: category, p_message: message, p_rating: rating });
  if (error) throw error;
  return data as FeedbackRow;
}
