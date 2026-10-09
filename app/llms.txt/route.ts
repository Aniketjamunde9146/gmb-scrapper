import { definition, faqs, steps } from "../../lib/content";
import { site } from "../../lib/site";

export const dynamic = "force-static";

/** /llms.txt: a plain-text summary for AI assistants (GEO). Generated from the same content as the page. */
export function GET() {
  const body = `# ${site.name}

> ${site.description}

## What it is
${definition.answer}

## Quick facts
${definition.facts.map((f) => `- ${f.k}: ${f.v}`).join("\n")}

## How it works
${steps.map((s, i) => `${i + 1}. ${s.name}: ${s.text}`).join("\n")}

## Pages
- [Home](${site.url}/): overview, features, FAQ
- [Privacy Policy](${site.url}/privacy)
- [Terms of Use](${site.url}/terms)

## FAQ
${faqs.map((f) => `### ${f.q}\n${f.a}`).join("\n\n")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" } });
}
