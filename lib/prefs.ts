/** Small per-browser preferences (default city and niche, saved view choices). */
const KEY = "gmb.prefs.v1";
export type Prefs = { city?: string; niche?: string; view?: "cards" | "table"; sort?: string; savedView?: "list" | "board" };
export function loadPrefs(): Prefs {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Prefs; } catch { return {}; }
}
export function savePrefs(patch: Prefs) {
  try { localStorage.setItem(KEY, JSON.stringify({ ...loadPrefs(), ...patch })); } catch {}
}
