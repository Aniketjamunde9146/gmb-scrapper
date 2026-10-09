import type { MetadataRoute } from "next";
import { site } from "../lib/site";

// Public pages are open to search engines AND AI assistants (good for GEO / AI answers).
// Private app areas are closed to everyone.
const AI_BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Applebot-Extended", "CCBot"];
const PRIVATE = ["/dashboard", "/api/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: PRIVATE }, ...AI_BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow: PRIVATE }))],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
