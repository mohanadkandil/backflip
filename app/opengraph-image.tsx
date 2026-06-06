import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Backflip — background removal + horizontal flip";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background:
          "linear-gradient(135deg, oklch(0.12 0 0) 0%, oklch(0.18 0 0) 100%)",
        color: "white",
        fontFamily: "ui-sans-serif, system-ui",
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontFamily: "ui-monospace, monospace",
          opacity: 0.6,
        }}
      >
        backflip
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 96, fontWeight: 600, lineHeight: 1.05 }}>
          Cut the background.
        </div>
        <div style={{ fontSize: 96, fontWeight: 600, opacity: 0.45 }}>
          Then flip it.
        </div>
      </div>
      <div
        style={{
          fontSize: 24,
          fontFamily: "ui-monospace, monospace",
          opacity: 0.55,
        }}
      >
        fal.ai · sharp · r2 · neon
      </div>
    </div>,
    size,
  );
}
