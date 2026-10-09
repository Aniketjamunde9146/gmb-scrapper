import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { ConsentBanner } from "../components/consent-banner";
import { ThemeScript } from "../components/theme-script";
import { site } from "../lib/site";

const gtmScript = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0], j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-P7LDNS4X');`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  verification: { google: "TJJaEJ19AITDpVDqe_l8evQeluMEtt9dRJuBZLJz8oY" },
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
        <Script id="gtm-script" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: gtmScript }} />
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              '<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-P7LDNS4X" height="0" width="0" style="display:none;visibility:hidden"></iframe>',
          }}
        />
        <ThemeScript />
        {children}
        <ConsentBanner />
      </body>
    </html>
  );
}
