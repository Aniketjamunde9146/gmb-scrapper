export type Lead = {
  id: string;
  name: string;
  category: string;
  phone?: string;
  website?: string;
  email?: string;
  address?: string;
  rating?: number;
  ratingCount?: number;
  lat: number;
  lon: number;
  mapUrl: string;
  source: "google" | "osm";
};

export const STATUSES = ["new", "contacted", "interested", "won", "lost"] as const;
export type Status = (typeof STATUSES)[number];
export const STATUS_LABEL: Record<Status, string> = {
  new: "New",
  contacted: "Contacted",
  interested: "Interested",
  won: "Won",
  lost: "Lost",
};

export type SavedLead = { lead: Lead; status: Status; savedAt: string; note?: string; /** YYYY-MM-DD */ followUp?: string };
