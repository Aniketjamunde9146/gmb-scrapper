
/**
 * Real lead data – no dummy records. Businesses come live from OpenStreetMap
 * (Nominatim for the city, Overpass for the businesses). Contact details appear
 * only when a mapper has added them, so coverage varies by city.
 */
import type { Lead } from "./types";
export type { Lead };

export type LeadSearch = { leads: Lead[]; area: string; source: "google" | "osm" };

const NICHES: { words: string[]; selectors: string[] }[] = [
  { words: ["dentist", "dental"], selectors: ['["amenity"="dentist"]', '["healthcare"="dentist"]'] },
  { words: ["doctor", "clinic", "physician"], selectors: ['["amenity"="clinic"]', '["amenity"="doctors"]', '["healthcare"="doctor"]'] },
  { words: ["hospital"], selectors: ['["amenity"="hospital"]'] },
  { words: ["pharmacy", "chemist", "medical store"], selectors: ['["amenity"="pharmacy"]'] },
  { words: ["restaurant", "dhaba"], selectors: ['["amenity"="restaurant"]'] },
  { words: ["cafe", "coffee"], selectors: ['["amenity"="cafe"]'] },
  { words: ["bakery"], selectors: ['["shop"="bakery"]'] },
  { words: ["gym", "fitness"], selectors: ['["leisure"="fitness_centre"]'] },
  { words: ["salon", "hairdresser", "barber", "parlour", "parlor"], selectors: ['["shop"="hairdresser"]', '["shop"="beauty"]'] },
  { words: ["spa", "massage"], selectors: ['["leisure"="spa"]', '["shop"="massage"]'] },
  { words: ["hotel", "lodge", "guest house"], selectors: ['["tourism"="hotel"]', '["tourism"="guest_house"]'] },
  { words: ["school"], selectors: ['["amenity"="school"]'] },
  { words: ["college", "university"], selectors: ['["amenity"="college"]', '["amenity"="university"]'] },
  { words: ["coaching", "tuition", "training"], selectors: ['["amenity"="language_school"]', '["office"="educational_institution"]', '["amenity"="training"]'] },
  { words: ["bank"], selectors: ['["amenity"="bank"]'] },
  { words: ["real estate", "property", "broker"], selectors: ['["office"="estate_agent"]'] },
  { words: ["lawyer", "advocate", "law firm"], selectors: ['["office"="lawyer"]'] },
  { words: ["accountant", "ca firm", "tax"], selectors: ['["office"="accountant"]', '["office"="tax_advisor"]'] },
  { words: ["car dealer", "showroom"], selectors: ['["shop"="car"]'] },
  { words: ["car repair", "garage", "mechanic"], selectors: ['["shop"="car_repair"]'] },
  { words: ["supermarket", "grocery", "kirana"], selectors: ['["shop"="supermarket"]', '["shop"="convenience"]', '["shop"="general"]'] },
  { words: ["jewellery", "jewelry", "jeweller"], selectors: ['["shop"="jewelry"]'] },
  { words: ["clothes", "boutique", "garment"], selectors: ['["shop"="clothes"]', '["shop"="boutique"]'] },
  { words: ["electronics", "mobile shop"], selectors: ['["shop"="electronics"]', '["shop"="mobile_phone"]'] },
  { words: ["optician", "eye"], selectors: ['["shop"="optician"]'] },
  { words: ["vet", "veterinary"], selectors: ['["amenity"="veterinary"]'] },
  { words: ["photographer", "photo studio"], selectors: ['["craft"="photographer"]', '["shop"="photo"]'] },
  { words: ["architect"], selectors: ['["office"="architect"]'] },
  { words: ["travel agent", "travel agency", "tour"], selectors: ['["shop"="travel_agency"]', '["office"="travel_agent"]'] },
  { words: ["it company", "software", "web design", "digital agency"], selectors: ['["office"="it"]', '["office"="company"]'] },
];

const UA = "GMB-Scraper/1.0 (business lead search; contact via site owner)";

const clean = (s: string) => s.replace(/[^\p{L}\p{N}\s&'-]/gu, " ").replace(/\s+/g, " ").trim();

function selectorsFor(q: string) {
  const term = q.toLowerCase();
  const hit = NICHES.find((n) => n.words.some((w) => term.includes(w)));
  if (hit) return hit.selectors;
  const safe = clean(term).replace(/[\\"]/g, "");
  return safe ? [`["name"~"${safe}",i]`] : [];
}

type OsmEl = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function pretty(v: string) {
  return v.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

function toLead(el: OsmEl): Lead | null {
  const t = el.tags ?? {};
  const name = t.name || t["name:en"];
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (!name || lat == null || lon == null) return null;
  const cat = t.amenity || t.shop || t.office || t.leisure || t.craft || t.tourism || t.healthcare || "business";
  const addr =
    t["addr:full"] ||
    [t["addr:housenumber"], t["addr:street"], t["addr:suburb"], t["addr:city"], t["addr:postcode"]]
      .filter(Boolean)
      .join(", ");
  let website = t.website || t["contact:website"] || t.url;
  if (website && !/^https?:\/\//i.test(website)) website = `https://${website}`;
  return {
    id: `${el.type}/${el.id}`,
    name,
    category: pretty(cat),
    phone: (t.phone || t["contact:phone"] || t["contact:mobile"] || t.mobile)?.split(";")[0].trim(),
    website,
    email: (t.email || t["contact:email"])?.split(";")[0].trim(),
    address: addr || undefined,
    lat,
    lon,
    mapUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
    source: "osm",
  };
}

async function osmSearch(query: string, city: string): Promise<LeadSearch> {
  const selectors = selectorsFor(query);
  if (!selectors.length) throw new Error("Please enter a business type, like dentist or gym.");

  const geoRes = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(city)}`,
    { headers: { "User-Agent": UA, "Accept-Language": "en" }, signal: AbortSignal.timeout(12000) },
  );
  if (!geoRes.ok) throw new Error("City lookup is unavailable right now. Please try again in a minute.");
  const geo = (await geoRes.json()) as { boundingbox: string[]; display_name: string }[];
  if (!geo.length) throw new Error(`We couldn't find a city called “${city}”. Check the spelling or add the state.`);
  const [south, north, west, east] = geo[0].boundingbox.map(Number);

  const bbox = `(${south},${west},${north},${east})`;
  const body = `[out:json][timeout:25];(${selectors.map((s) => `nwr${s}${bbox};`).join("")});out center tags 120;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(body)}`,
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error("The map data service is busy. Please try again in a moment.");
  const json = (await res.json()) as { elements: OsmEl[] };

  const seen = new Set<string>();
  const score = (l: Lead) => Number(!!l.phone) * 2 + Number(!!l.website) + Number(!!l.email);
  const leads = json.elements
    .map(toLead)
    .filter((l): l is Lead => !!l && !seen.has(l.id) && !!seen.add(l.id))
    .sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name));

  return { leads, area: geo[0].display_name.split(",").slice(0, 2).join(",").trim(), source: "osm" };
}

type GPlace = {
  id: string;
  displayName?: { text: string };
  primaryTypeDisplayName?: { text: string };
  formattedAddress?: string;
  internationalPhoneNumber?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  location?: { latitude: number; longitude: number };
};

/** Google Places API (New) – Text Search. Up to 3 pages x 20 = 60 businesses. */
async function googleSearch(query: string, city: string, key: string): Promise<LeadSearch> {
  const mask = [
    "places.id",
    "places.displayName",
    "places.primaryTypeDisplayName",
    "places.formattedAddress",
    "places.internationalPhoneNumber",
    "places.nationalPhoneNumber",
    "places.websiteUri",
    "places.rating",
    "places.userRatingCount",
    "places.googleMapsUri",
    "places.location",
    "nextPageToken",
  ].join(",");
  const leads: Lead[] = [];
  let pageToken: string | undefined;
  for (let page = 0; page < 3; page++) {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": mask },
      body: JSON.stringify({ textQuery: `${query} in ${city}`, pageSize: 20, languageCode: "en", ...(pageToken ? { pageToken } : {}) }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      if (page === 0) throw new Error(`Google Places error ${res.status}: ${(await res.text()).slice(0, 200)}`);
      break;
    }
    const json = (await res.json()) as { places?: GPlace[]; nextPageToken?: string };
    for (const p of json.places ?? []) {
      if (!p.displayName?.text || !p.location) continue;
      leads.push({
        id: `g/${p.id}`,
        name: p.displayName.text,
        category: p.primaryTypeDisplayName?.text ?? "Business",
        phone: p.internationalPhoneNumber ?? p.nationalPhoneNumber,
        website: p.websiteUri,
        address: p.formattedAddress,
        rating: p.rating,
        ratingCount: p.userRatingCount,
        lat: p.location.latitude,
        lon: p.location.longitude,
        mapUrl: p.googleMapsUri ?? `https://www.google.com/maps/place/?q=place_id:${p.id}`,
        source: "google",
      });
    }
    pageToken = json.nextPageToken;
    if (!pageToken) break;
  }
  return { leads, area: city, source: "google" };
}

/** Uses Google Maps when GOOGLE_MAPS_API_KEY is set (falls back to OpenStreetMap if Google fails). */
export async function searchLeads(query: string, city: string): Promise<LeadSearch> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (key) {
    try {
      return await googleSearch(query, city, key);
    } catch (e) {
      console.error("[leads] Google Places failed, falling back to OpenStreetMap:", e);
    }
  }
  return osmSearch(query, city);
}
