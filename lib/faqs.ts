/** Single source of truth for the FAQ: the landing page, the FAQ schema (SEO) and llms.txt all read this list. */
export const faqs: { q: string; a: string }[] = [
  { q: "Where does the data come from?", a: "Leads come live from Google Maps listings (through the official Places API when configured) with OpenStreetMap as a backup. We never invent business records." },
  { q: "What does “no website” mean?", a: "The business listing has no website URL. These are usually the easiest leads for web design and marketing services, and you can filter for them in one tap." },
  { q: "Which formats can I export?", a: "CSV, Excel (XLSX) and JSON. Export everything, only the filtered rows, or your saved pipeline." },
  { q: "Can I search any country?", a: "Yes. Enter any business type and any city and we search that area." },
  { q: "Do I need a card to start?", a: "No. You can create an account with email or Google and start searching without a card. You get 3 free searches, then you can buy a credit pack by UPI." },
  { q: "Why do some leads have no phone number?", a: "A phone number only appears when the business has listed it publicly on the map. Leads with a phone number or website are shown first." },
  { q: "Can I delete my data?", a: "Yes. Remove any saved lead or search from your dashboard, or delete your whole account from Settings. Deletion is permanent." },
  { q: "Is it legal to contact these businesses?", a: "Lead details are publicly listed business information. You are responsible for following the laws that apply to your outreach, such as spam, telemarketing and data-protection rules in your country. See our Terms for details." },
];
