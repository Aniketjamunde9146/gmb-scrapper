import { createClient } from "./supabase/server";
import { FREE_SEARCHES, type PaymentRow } from "./billing";

export type Profile = { role: "user" | "admin"; freeLeft: number; credits: number; blocked: boolean; blockedReason: string | null };
const PAY_COLS = "id, email, pack, credits, amount_inr, utr, status, admin_note, created_at, reviewed_at";

/** Balance, role and suspension status for the signed-in user. Row Level Security returns only their own row. */
export async function getProfile(uid: string): Promise<Profile> {
  const supabase = await createClient();
  type Row = { role: string; free_used: number; credits: number; blocked?: boolean; blocked_reason?: string | null };
  const full = await supabase.from("profiles").select("role, free_used, credits, blocked, blocked_reason").eq("id", uid).maybeSingle();
  let data = full.data as Row | null;
  if (full.error) {
    // supabase/admin-controls.sql has not been run yet: fall back to the old columns so admins are not locked out.
    const legacy = await supabase.from("profiles").select("role, free_used, credits").eq("id", uid).maybeSingle();
    data = legacy.data as Row | null;
  }
  if (!data) return { role: "user", freeLeft: FREE_SEARCHES, credits: 0, blocked: false, blockedReason: null };
  return {
    role: data.role === "admin" ? "admin" : "user",
    freeLeft: Math.max(FREE_SEARCHES - data.free_used, 0),
    credits: data.credits,
    blocked: data.blocked === true,
    blockedReason: data.blocked_reason ?? null,
  };
}

export type SpendFail = "no_credits" | "blocked" | "paused" | "daily_limit";
export type Spend = { ok: true; ticket: string; freeLeft: number; credits: number } | { ok: false; reason: SpendFail; message?: string; limit?: number };

/** Takes one search (free first, then a credit) in a single atomic database step. */
export async function consumeSearch(): Promise<Spend> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("consume_search");
  if (error) throw error;
  const r = data as { ok: boolean; ticket?: string; free_left?: number; credits?: number; reason?: string; message?: string; limit?: number };
  if (!r?.ok || !r.ticket) {
    const reason: SpendFail = r?.reason === "blocked" || r?.reason === "paused" || r?.reason === "daily_limit" ? r.reason : "no_credits";
    return { ok: false, reason, message: r?.message || undefined, limit: r?.limit };
  }
  return { ok: true, ticket: r.ticket, freeLeft: r.free_left ?? 0, credits: r.credits ?? 0 };
}

export async function refundSearch(ticket: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("refund_search", { p_ticket: ticket });
  if (error) console.error("[refund]", error.message);
}

export async function listMyPayments(uid: string): Promise<PaymentRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("payments").select(PAY_COLS).eq("user_id", uid).order("created_at", { ascending: false }).limit(20);
  return (data ?? []) as PaymentRow[];
}

export async function submitPayment(pack: string, utr: string): Promise<PaymentRow> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_payment", { p_pack: pack, p_utr: utr });
  if (error) throw error;
  return data as PaymentRow;
}

/** Admin queue. The database only returns rows to users whose profiles.role is 'admin'. */
export async function listPayments(status: "pending" | "all", limit = 100): Promise<PaymentRow[]> {
  const supabase = await createClient();
  let q = supabase.from("payments").select(PAY_COLS).order("created_at", { ascending: false }).limit(limit);
  if (status === "pending") q = q.eq("status", "pending");
  const { data } = await q;
  return (data ?? []) as PaymentRow[];
}

export async function reviewPayment(id: string, action: "approve" | "reject", note?: string) {
  const supabase = await createClient();
  const { error } = action === "approve" ? await supabase.rpc("approve_payment", { p_id: id }) : await supabase.rpc("reject_payment", { p_id: id, p_note: note ?? null });
  if (error) throw error;
}

/** Friendly message for the error codes raised by the SQL functions. */
export function billingError(e: unknown): { status: number; message: string } {
  const m = e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : "";
  if (m.includes("bad_utr")) return { status: 400, message: "Enter the 12-digit UTR (UPI reference number) from your payment app." };
  if (m.includes("bad_pack")) return { status: 400, message: "That pack is not available. Pick another one." };
  if (m.includes("utr_used")) return { status: 409, message: "This UTR was already submitted. Check the number or contact us on WhatsApp." };
  if (m.includes("too_many_pending")) return { status: 429, message: "You already have 3 payments waiting for approval. Please wait for them to be reviewed." };
  if (m.includes("not_admin")) return { status: 403, message: "Not allowed." };
  if (m.includes("not_pending")) return { status: 409, message: "This payment was already reviewed." };
  if (m.includes("self_action")) return { status: 400, message: "You cannot do this to your own account." };
  if (m.includes("target_admin")) return { status: 400, message: "Admin accounts cannot be blocked." };
  if (m.includes("not_found")) return { status: 404, message: "Not found." };
  if (m.includes("bad_amount")) return { status: 400, message: "Enter a number between 1 and 10000." };
  if (m.includes("bad_limit")) return { status: 400, message: "Enter a limit between 0 and 100000, or leave it empty." };
  if (m.includes("bad_feedback")) return { status: 400, message: "Write at least 5 characters and pick a type." };
  if (m.includes("too_many_feedback")) return { status: 429, message: "You have sent a lot of feedback today. Please try again tomorrow." };
  if ((m.includes("admin_") || m.includes("feedback") || m.includes("app_settings")) && (m.includes("relation") || m.includes("function") || m.includes("schema cache"))) {
    return { status: 500, message: "Admin tools are not set up yet. Run supabase/admin-controls.sql in Supabase." };
  }
  if (m.includes("relation") || m.includes("function") || m.includes("schema cache")) return { status: 500, message: "Billing is not set up yet. Run supabase/billing-admin.sql in Supabase." };
  return { status: 500, message: "Something went wrong. Please try again." };
}
