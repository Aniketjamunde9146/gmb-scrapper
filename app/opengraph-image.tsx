import { ImageResponse } from "next/og";
import { site } from "../lib/site";

export const alt = `${site.name}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(135deg,#FFF1CF 0%,#F8B500 45%,#EB6101 100%)", color: "#2a1608" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 34, fontWeight: 700 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "#EB6101", display: "flex" }} />
          {site.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3 }}>Find local business leads in one search.</div>
          <div style={{ fontSize: 34, opacity: 0.8 }}>Phone, website and address for any business, in any city.</div>
        </div>
      </div>
    ),
    size,
  );
}
