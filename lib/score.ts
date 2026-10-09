import type { Lead } from "./types";

export type Tier = "hot" | "warm" | "cold";
export type Angle = "website" | "reputation" | "reviews" | "general";
export type Score = { value: number; tier: Tier; reasons: string[]; angle: Angle; pitch: string };

export const TIER_LABEL: Record<Tier, string> = { hot: "Hot", warm: "Warm", cold: "Cold" };

/**
 * Opportunity score, 0 to 100. It answers one question: "how likely is this business to need what I sell?"
 * No website is the strongest signal, then a reachable owner (phone, email), then weak reviews.
 */
export function scoreLead(l: Lead): Score {
  let v = 10;
  const reasons: string[] = [];
  if (!l.website) { v += 40; reasons.push("No website listed"); }
  if (l.phone) { v += 20; reasons.push("Phone number available"); }
  if (l.email) { v += 5; reasons.push("Email available"); }
  if (l.rating != null) {
    if (l.rating < 3.5) { v += 15; reasons.push(`Low rating (${l.rating.toFixed(1)})`); }
    else if (l.rating < 4.2) { v += 7; reasons.push(`Room to improve (${l.rating.toFixed(1)})`); }
  }
  if (l.ratingCount != null && l.ratingCount < 30) { v += 10; reasons.push("Few reviews"); }
  const value = Math.min(100, v);
  const tier: Tier = value >= 70 ? "hot" : value >= 45 ? "warm" : "cold";

  let angle: Angle = "general";
  let pitch = "Research the business before you reach out";
  if (!l.website) { angle = "website"; pitch = "Pitch a website"; }
  else if (l.rating != null && l.rating < 3.5) { angle = "reputation"; pitch = "Pitch reputation and review management"; }
  else if (l.ratingCount != null && l.ratingCount < 30) { angle = "reviews"; pitch = "Pitch a review campaign"; }
  else if (l.phone) { pitch = "Pitch local SEO or ads"; }
  return { value, tier, reasons, angle, pitch };
}

/** WhatsApp wants the country code. A bare 10 digit Indian number gets 91 in front. */
export function waNumber(phone: string) {
  const d = phone.replace(/[^\d]/g, "");
  return d.length === 10 ? `91${d}` : d.replace(/^0+/, "");
}
