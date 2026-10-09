import { createClient } from "./supabase/server";
import { STATUSES, type Lead, type SavedLead, type Status } from "./types";
import { scoreLead } from "./score";

/**
 * All data lives in Supabase (see /supabase/schema.sql). Row Level Security means
 * every query below can only ever touch the signed-in user's own rows.
 */
const TZ = "Asia/Kolkata";
const dayKey = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
const dayLabel = (d: Date) => new Intl.DateTimeFormat("en-IN", { timeZone: TZ, day: "numeric", month: "short" }).format(d);

export type SearchRec = { id: string; q: string; city: string; total: number; withPhone: number; noWebsite: number; at: string };

export async function addSearch(uid: string, q: string, city: string, leads: Lead[]) {
  const supabase = await createClient();
  const { error } = await supabase.from("searches").insert({
    user_id: uid,
    q,
    city,
    total: leads.length,
    with_phone: leads.filter((l) => l.phone).length,
    no_website: leads.filter((l) => !l.website).length,
  });
  if (error) throw error;
}

/** True when the user has run 10+ searches in the last minute (protects the map APIs and your bill). */
export async function isRateLimited(uid: string) {
  const supabase = await createClient();
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count } = await supabase.from("searches").select("id", { count: "exact", head: true }).eq("user_id", uid).gte("created_at", since);
  return (count ?? 0) >= 10;
}

type SavedRow = { lead: unknown; status: string; note: string | null; created_at: string; follow_up?: string | null };
const toSaved = (r: SavedRow): SavedLead => ({ lead: r.lead as Lead, status: r.status as Status, note: r.note ?? "", savedAt: r.created_at, followUp: r.follow_up ?? undefined });

/** Reads saved leads. If the follow_up column has not been added yet (see supabase/schema.sql), it falls back to the old shape. */
async function readSaved(uid: string, limit: number): Promise<SavedLead[]> {
  const supabase = await createClient();
  const withDate = await supabase.from("saved_leads").select("lead, status, note, created_at, follow_up").eq("user_id", uid).order("created_at", { ascending: false }).limit(limit);
  if (!withDate.error) return ((withDate.data ?? []) as unknown as SavedRow[]).map(toSaved);
  const legacy = await supabase.from("saved_leads").select("lead, status, note, created_at").eq("user_id", uid).order("created_at", { ascending: false }).limit(limit);
  if (legacy.error) throw legacy.error;
  return ((legacy.data ?? []) as unknown as SavedRow[]).map(toSaved);
}

export async function listSaved(uid: string): Promise<SavedLead[]> {
  return readSaved(uid, 1000);
}

export async function setFollowUp(uid: string, id: string, date: string | null) {
  if (date !== null && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
  const supabase = await createClient();
  const { error } = await supabase.from("saved_leads").update({ follow_up: date }).eq("user_id", uid).eq("lead_id", id);
  if (error) throw error;
}

export async function saveLead(uid: string, lead: Lead) {
  const supabase = await createClient();
  const { error } = await supabase.from("saved_leads").upsert({ user_id: uid, lead_id: lead.id, lead }, { onConflict: "user_id,lead_id", ignoreDuplicates: true });
  if (error) throw error;
}

export async function setStatus(uid: string, id: string, status: Status) {
  if (!STATUSES.includes(status)) return;
  const supabase = await createClient();
  const { error } = await supabase.from("saved_leads").update({ status }).eq("user_id", uid).eq("lead_id", id);
  if (error) throw error;
}

export async function removeSaved(uid: string, id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("saved_leads").delete().eq("user_id", uid).eq("lead_id", id);
  if (error) throw error;
}

export async function getOverview(uid: string) {
  const supabase = await createClient();
  const [searchesRes, savedList] = await Promise.all([
    supabase
      .from("searches")
      .select("id, q, city, total, with_phone, no_website, created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(2000),
    readSaved(uid, 1000).catch(() => [] as SavedLead[]),
  ]);

  const searches: SearchRec[] = (searchesRes.data ?? []).map((s) => ({
    id: s.id,
    q: s.q,
    city: s.city,
    total: s.total,
    withPhone: s.with_phone,
    noWebsite: s.no_website,
    at: s.created_at,
  }));
  const saved = savedList;

  const days: { key: string; day: string; leads: number; searches: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push({ key: dayKey(d), day: dayLabel(d), leads: 0, searches: 0 });
  }
  for (const s of searches) {
    const row = days.find((d) => d.key === dayKey(new Date(s.at)));
    if (row) {
      row.leads += s.total;
      row.searches += 1;
    }
  }

  const pipeline = Object.fromEntries(STATUSES.map((st) => [st, saved.filter((x) => x.status === st).length])) as Record<Status, number>;

  // Week over week, for the trend chips on the stat cards.
  const sum = (from: number, to: number, k: "leads" | "searches") => days.slice(from, to).reduce((n, d) => n + d[k], 0);
  const trend = { leads: { now: sum(7, 14, "leads"), prev: sum(0, 7, "leads") }, searches: { now: sum(7, 14, "searches"), prev: sum(0, 7, "searches") } };

  // Follow-ups: anything dated today or earlier that is still open, plus the next 7 days.
  const today = dayKey(new Date());
  const soon = dayKey(new Date(Date.now() + 7 * 86400000));
  const open = saved.filter((s) => s.followUp && s.status !== "won" && s.status !== "lost");
  const due = open.filter((s) => s.followUp! <= soon).sort((a, b) => a.followUp!.localeCompare(b.followUp!)).slice(0, 6);
  const overdue = open.filter((s) => s.followUp! < today).length;

  // Best leads nobody has contacted yet.
  const next = saved
    .filter((s) => s.status === "new")
    .map((s) => ({ s, score: scoreLead(s.lead) }))
    .sort((a, b) => b.score.value - a.score.value)
    .slice(0, 5)
    .map(({ s, score }) => ({ ...s, score: score.value, tier: score.tier, pitch: score.pitch }));

  const tally = (pick: (s: SearchRec) => string) => {
    const m = new Map<string, number>();
    for (const s of searches) m.set(pick(s), (m.get(pick(s)) ?? 0) + s.total);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([label, n]) => ({ label, n }));
  };

  const reached = pipeline.contacted + pipeline.interested + pipeline.won + pipeline.lost;
  const progress = {
    searched: searches.length > 0,
    saved: saved.length > 0,
    contacted: reached > 0,
    followUp: saved.some((s) => !!s.followUp),
    won: pipeline.won > 0,
  };

  return {
    totals: {
      searches: searches.length,
      leads: searches.reduce((n, s) => n + s.total, 0),
      withPhone: searches.reduce((n, s) => n + s.withPhone, 0),
      noWebsite: searches.reduce((n, s) => n + s.noWebsite, 0),
      saved: saved.length,
    },
    chart: days.map(({ day, leads, searches }) => ({ day, leads, searches })),
    pipeline,
    recent: searches.slice(0, 6),
    trend,
    due,
    overdue,
    next,
    topNiches: tally((s) => s.q.trim().toLowerCase()),
    topCities: tally((s) => s.city.trim().toLowerCase()),
    winRate: reached ? Math.round((pipeline.won / reached) * 100) : 0,
    progress,
    today,
  };
}

export async function setNote(uid: string, id: string, note: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("saved_leads").update({ note: note.slice(0, 1000) }).eq("user_id", uid).eq("lead_id", id);
  if (error) throw error;
}

export async function listSearches(uid: string, limit = 200): Promise<SearchRec[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("searches").select("id, q, city, total, with_phone, no_website, created_at").eq("user_id", uid).order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []).map((s) => ({ id: s.id, q: s.q, city: s.city, total: s.total, withPhone: s.with_phone, noWebsite: s.no_website, at: s.created_at }));
}

export async function deleteSearch(uid: string, id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("searches").delete().eq("user_id", uid).eq("id", id);
  if (error) throw error;
}

export async function clearSearches(uid: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("searches").delete().eq("user_id", uid);
  if (error) throw error;
}

export async function clearSaved(uid: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("saved_leads").delete().eq("user_id", uid);
  if (error) throw error;
}
