import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ConsentBanner } from "../components/consent-banner";
import { ThemeScript } from "../components/theme-script";
import { site } from "../lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.name,
    description: site.description,
    url: site.url,
  },
};

export const viewport: Viewport = {
  themeColor: "#eb6101",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeScript />
        {children}
        <ConsentBanner />
      </body>
    </html>
  );
}
