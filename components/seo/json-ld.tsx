import { faqs } from "../../lib/content";
import { site } from "../../lib/site";

/** Structured data for Google (SEO), AI answer engines (AEO) and generative search (GEO). */
export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site.url}/#org`,
        name: site.name,
        url: site.url,
        logo: `${site.url}/icon.svg`,
        ...(site.email ? { email: site.email } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        description: site.description,
        publisher: { "@id": `${site.url}/#org` },
        inLanguage: "en",
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${site.url}/#app`,
        name: site.name,
        url: site.url,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: site.description,
        featureList: ["Search businesses by type and city", "Phone, website and address on every lead", "Filter by phone or no website", "Save leads and track status", "Export to CSV"],
        offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        publisher: { "@id": `${site.url}/#org` },
      },
      {
        "@type": "FAQPage",
        "@id": `${site.url}/#faq`,
        mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };
  // "<" is escaped so the JSON can never close the script tag early.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
