export type Consent = "all" | "essential";
export const CONSENT_KEY = "gmb_consent";

/** Read the visitor's cookie choice (browser only). Returns null until they choose. */
export function getConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "all" || v === "essential" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {}
  // 12-month cookie so the choice is also visible on the server if you ever need it.
  document.cookie = `${CONSENT_KEY}=${value}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
}

/**
 * FUTURE ANALYTICS: only load analytics / ad scripts when this returns true.
 * The site ships with no analytics, so today "all" and "essential" behave the same.
 */
export const analyticsAllowed = () => getConsent() === "all";
