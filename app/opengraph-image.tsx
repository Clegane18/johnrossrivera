import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

// Generates the 1200×630 social share card at build/request time — replaces the missing static
// /images/og.png. System fonts only (no network fetch), so it works under any CSP.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = siteConfig.title;

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "#0a0a0a",
        color: "#fafafa",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 30,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "#a1a1aa",
        }}
      >
        {siteConfig.role}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 88,
          fontWeight: 800,
          marginTop: 24,
          lineHeight: 1.05,
        }}
      >
        {siteConfig.name}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 36,
          marginTop: 32,
          color: "#d4d4d8",
          maxWidth: "900px",
        }}
      >
        {siteConfig.heroTagline}
      </div>
    </div>,
    { ...size }
  );
}
