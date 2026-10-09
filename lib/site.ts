/** One place for the brand. Change the name here and it updates everywhere (header, SEO, emails, footer). */
export const site = {
  name: "GMB Scraper",
  short: "GMB Scraper",
  tagline: "Find local business leads in any city",
  description:
    "Search any business type in any city and get real local business leads with phone numbers, websites and addresses from Google Maps and OpenStreetMap. Filter, save and export to CSV in one click.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://gmbscrapper.vercel.app").replace(/\/$/, ""),
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@gmbscraper.app",
  updated: "2026-10-04",
};

export const niches = ["Dentist", "Restaurant", "Gym", "Salon", "Hotel", "Pharmacy", "School", "Real estate agent"];
