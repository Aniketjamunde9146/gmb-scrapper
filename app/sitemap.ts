import type { MetadataRoute } from "next";
import { site } from "../lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(site.updated);
  return [
    { url: site.url, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/login`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site.url}/signup`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site.url}/dashboard`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${site.url}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site.url}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
