import type { Angle } from "./score";

export type Channel = "whatsapp" | "email" | "call";
export type Template = { id: string; channel: Channel; angle: Angle; title: string; subject?: string; body: string };
export type Vars = { business: string; category: string; city: string; sender: string; rating?: string };

export const CHANNEL_LABEL: Record<Channel, string> = { whatsapp: "WhatsApp", email: "Email", call: "Call script" };
export const ANGLE_LABEL: Record<Angle, string> = { website: "No website", reputation: "Low rating", reviews: "Few reviews", general: "General" };
export const VARIABLES = ["{business}", "{category}", "{city}", "{sender}", "{rating}"] as const;

export const DEFAULT_TEMPLATES: Template[] = [
  { id: "wa-website", channel: "whatsapp", angle: "website", title: "Offer a simple website",
    body: "Hi {business} team, I found your {category} listing on Google Maps and noticed there is no website linked. I build fast, simple websites for local businesses so customers can see services, hours and a call button in one place. Can I send you a quick sample made for {business}?\n\n{sender}" },
  { id: "wa-reputation", channel: "whatsapp", angle: "reputation", title: "Help with reviews",
    body: "Hi {business} team, I came across your {category} listing in {city}. It has a {rating} star rating, and I think a few small changes could lift it quickly. I help local businesses collect better reviews and reply to the ones that hurt. Would you like a short plan for {business}?\n\n{sender}" },
  { id: "wa-reviews", channel: "whatsapp", angle: "reviews", title: "Start a review campaign",
    body: "Hi {business} team, your {category} listing in {city} has very few reviews, so new customers cannot see how good you are. I set up a simple way to ask happy customers for a review. Can I show you how it works?\n\n{sender}" },
  { id: "wa-general", channel: "whatsapp", angle: "general", title: "Quick introduction",
    body: "Hi {business} team, I am {sender}. I help {category} businesses in {city} get more customers online. Do you have two minutes this week to hear one idea for {business}?" },
  { id: "em-website", channel: "email", angle: "website", title: "Offer a simple website", subject: "A website for {business}",
    body: "Hello {business} team,\n\nI found your {category} listing on Google Maps and saw that it has no website. Customers who search for you today cannot see your services or hours before they call.\n\nI build fast, mobile-friendly websites for local businesses. I can send a free sample page for {business} within two days.\n\nWould you like to see it?\n\nThanks,\n{sender}" },
  { id: "em-reputation", channel: "email", angle: "reputation", title: "Help with reviews", subject: "Improving the rating for {business}",
    body: "Hello {business} team,\n\nYour {category} listing in {city} currently has a {rating} star rating. Most customers check the rating before they call.\n\nI help local businesses collect more genuine reviews and answer the critical ones. I can share a short, practical plan for {business} if you are interested.\n\nThanks,\n{sender}" },
  { id: "em-reviews", channel: "email", angle: "reviews", title: "Start a review campaign", subject: "More reviews for {business}",
    body: "Hello {business} team,\n\nYour {category} listing in {city} has only a few reviews, which makes it harder for new customers to trust it.\n\nI set up a simple process that asks happy customers for a review right after a visit. Shall I show you how it would work for {business}?\n\nThanks,\n{sender}" },
  { id: "em-general", channel: "email", angle: "general", title: "Quick introduction", subject: "An idea for {business}",
    body: "Hello {business} team,\n\nI help {category} businesses in {city} get more customers online. I have one idea for {business} that takes about ten minutes to explain.\n\nWhen is a good time to talk?\n\nThanks,\n{sender}" },
  { id: "call-website", channel: "call", angle: "website", title: "Call: no website",
    body: "Open: Hi, is this {business}? I am {sender}. Do you have 30 seconds?\n\nWhy I am calling: I saw your {category} listing on Google Maps and there is no website on it.\n\nAsk: When customers search for you online, how do they find your prices and hours today?\n\nOffer: I can make a simple site and send a free sample first.\n\nClose: Can I send the sample on WhatsApp to this number?" },
  { id: "call-reputation", channel: "call", angle: "reputation", title: "Call: low rating",
    body: "Open: Hi, is this {business}? I am {sender}. Do you have 30 seconds?\n\nWhy I am calling: your {category} listing shows {rating} stars, and I help businesses in {city} fix that.\n\nAsk: Do you currently ask customers for reviews after a visit?\n\nOffer: A short plan to collect better reviews and reply to old ones.\n\nClose: Can I send the plan on WhatsApp?" },
  { id: "call-reviews", channel: "call", angle: "reviews", title: "Call: few reviews",
    body: "Open: Hi, is this {business}? I am {sender}. Do you have 30 seconds?\n\nWhy I am calling: your {category} listing in {city} has very few reviews.\n\nAsk: Would you like more customers to see how good your work is?\n\nOffer: A simple way to ask happy customers for a review.\n\nClose: Can I show you how it works this week?" },
  { id: "call-general", channel: "call", angle: "general", title: "Call: introduction",
    body: "Open: Hi, is this {business}? I am {sender}. Do you have 30 seconds?\n\nWhy I am calling: I help {category} businesses in {city} get more customers online.\n\nAsk: How do most of your new customers find you today?\n\nClose: Can I send you one idea on WhatsApp?" },
];

export function fill(text: string, v: Vars) {
  return text
    .replaceAll("{business}", v.business)
    .replaceAll("{category}", v.category.toLowerCase())
    .replaceAll("{city}", v.city || "your area")
    .replaceAll("{sender}", v.sender)
    .replaceAll("{rating}", v.rating ?? "low");
}

/** Edits are kept in this browser only. */
const KEY = "gmb.templates.v1";
export type Overrides = Record<string, { body?: string; subject?: string }>;
export function loadOverrides(): Overrides {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Overrides; } catch { return {}; }
}
export function saveOverrides(o: Overrides) {
  try { localStorage.setItem(KEY, JSON.stringify(o)); } catch {}
}
export function resolve(t: Template, o: Overrides): Template {
  const x = o[t.id];
  return x ? { ...t, body: x.body ?? t.body, subject: x.subject ?? t.subject } : t;
}
