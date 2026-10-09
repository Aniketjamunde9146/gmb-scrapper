import { Bookmark, Building2, Globe, Megaphone, PhoneCall, Search, FileSpreadsheet, MapPin, Map, MessageCircle, Mail } from "lucide-react";
import { site } from "./site";

/** All landing-page copy lives here. Edit text once; the page, FAQ schema and llms.txt all follow. */
export const usesGoogle = !!process.env.GOOGLE_MAPS_API_KEY;
export const dataSource = usesGoogle ? "Google Maps" : "OpenStreetMap";

export const definition = {
  question: `What is ${site.name}?`,
  answer: `${site.name} is a lead-finding web app. You type a business type (for example "dentist") and a city (for example "Pune"), and it returns real local businesses with their phone number, website, address and rating where listed publicly on ${usesGoogle ? "Google Maps and OpenStreetMap" : "OpenStreetMap"}. You can filter, save leads to a pipeline, and export them to CSV.`,
  facts: [
    { k: "You enter", v: "A business type and a city" },
    { k: "You get", v: "Name, phone, website, address, rating, map link" },
    { k: "Data from", v: usesGoogle ? "Google Maps (OpenStreetMap as backup)" : "OpenStreetMap" },
    { k: "Export", v: "CSV for Excel and Google Sheets" },
    { k: "Best for", v: "Freelancers, agencies, sales and tele-calling teams" },
  ],
};

export const features = [
  {
    icon: Search,
    image: "/illustrations/feature-search.webp",
    title: "Search any business, in any city",
    body: "Type “dentist” and “Pune” and get real businesses in seconds. No filters to learn, no spreadsheet to build.",
    points: ["Works for 30+ business types", "Contact-ready leads shown first"],
  },
  {
    icon: PhoneCall,
    image: "/illustrations/feature-contact.webp",
    title: "Contact details up front",
    body: "Phone, website and address on every lead, with one-tap call and WhatsApp buttons built in.",
    points: ["Call or WhatsApp in one tap", "“No website” badge for web-design leads"],
  },
  {
    icon: Bookmark,
    image: "/illustrations/feature-pipeline.webp",
    title: "Save leads and track every one",
    body: "Bookmark the leads you like, move them from New to Won, and export your list to CSV any time.",
    points: ["New → Contacted → Interested → Won/Lost", "One-click CSV export"],
  },
];

export const steps = [
  { name: "Search", text: "Enter a business type and a city on the home page or in your dashboard." },
  { name: "Review leads", text: "Browse real businesses with phone, website and address. Filter to “Has phone” or “No website”." },
  { name: "Save and export", text: "Save the leads you want, track their status, and download them as a CSV file." },
];

export const useCases = [
  { icon: Globe, title: "Web and app freelancers", body: "Filter for businesses with no website and pitch them a site." },
  { icon: PhoneCall, title: "Sales and tele-calling teams", body: "Build call lists by city and business type, then call straight from your phone." },
  { icon: Megaphone, title: "Marketing agencies", body: "Find local businesses to pitch SEO, ads and social media, and track outreach in one place." },
  { icon: Building2, title: "Expansion and market research", body: "See how many pharmacies, gyms or schools already exist in a city before you open the next one." },
];

export const sources = [
  { icon: Map, name: "Google Maps" },
  { icon: MapPin, name: "OpenStreetMap" },
  { icon: MessageCircle, name: "WhatsApp" },
  { icon: PhoneCall, name: "Phone" },
  { icon: Mail, name: "Email" },
  { icon: FileSpreadsheet, name: "CSV export" },
];

export { faqs } from "./faqs";
