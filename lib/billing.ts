/**
 * Billing settings that are safe to use in the browser.
 * Price and size of each pack are enforced in Supabase (table credit_packs, see supabase/billing-admin.sql).
 * If you change a pack, change it in BOTH places.
 */
export const FREE_SEARCHES = 3;

export type Pack = { id: string; name: string; credits: number; price: number; hot?: boolean };
export const PACKS: Pack[] = [
  { id: "starter", name: "Starter", credits: 20, price: 199 },
  { id: "growth", name: "Growth", credits: 60, price: 499, hot: true },
  { id: "pro", name: "Pro", credits: 150, price: 999 },
];

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
export const perSearch = (p: Pack) => `₹${(p.price / p.credits).toFixed(p.price % p.credits === 0 ? 0 : 1)}`;

/** WhatsApp number as digits with country code, e.g. 919876543210. A bare 10-digit number gets 91 (India) in front. */
export function whatsappNumber(raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""): string {
  const d = raw.replace(/\D/g, "");
  if (d.length === 10) return `91${d}`;
  return d.length >= 11 && d.length <= 15 ? d : "";
}

export const payee = {
  upiId: (process.env.NEXT_PUBLIC_UPI_ID ?? "").trim(),
  name: (process.env.NEXT_PUBLIC_UPI_NAME ?? "GMB Scraper").trim(),
  qr: (process.env.NEXT_PUBLIC_UPI_QR ?? "").trim(),
};
export const paymentsReady = () => !!payee.upiId && !!whatsappNumber();

/** Opens the user's UPI app with the amount filled in (mobile). */
export function upiLink(amount: number, ref: string) {
  const q = new URLSearchParams({ pa: payee.upiId, pn: payee.name, am: String(amount), cu: "INR", tn: `GMB ${ref}` });
  return `upi://pay?${q.toString().replace(/\+/g, "%20")}`;
}

export type PaymentRow = {
  id: string;
  email: string;
  pack: string;
  credits: number;
  amount_inr: number;
  utr: string;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export const shortRef = (id: string) => id.slice(0, 8).toUpperCase();

/** The pre-filled WhatsApp message with the payment details, so the owner can match it to the UTR. */
export function whatsappProofLink(p: Pick<PaymentRow, "id" | "pack" | "credits" | "amount_inr" | "utr" | "email">): string {
  const to = whatsappNumber();
  if (!to) return "";
  const text = [
    "Hi, I have paid for GMB Scraper credits.",
    "",
    `Ref: ${shortRef(p.id)}`,
    `Pack: ${p.pack} (${p.credits} searches)`,
    `Amount: ${inr(p.amount_inr)}`,
    `UTR: ${p.utr}`,
    `Account: ${p.email}`,
    "",
    "Screenshot attached.",
  ].join("\n");
  return `https://wa.me/${to}?text=${encodeURIComponent(text)}`;
}
