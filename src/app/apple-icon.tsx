import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon for iPhone and iPad: the brand mark on Pine. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: 180, height: 180, background: "#234430", display: "flex" }}>
        <svg width="180" height="180" viewBox="0 0 32 32">
          <path d="M7.5 16h15" stroke="#F1F2EC" strokeWidth="2.2" strokeLinecap="square" />
          <path d="M17 10h6v6" stroke="#F1F2EC" strokeWidth="2.2" fill="none" strokeLinecap="square" />
          <path d="M23 16v6h-6" stroke="#C9A15F" strokeWidth="2.2" fill="none" strokeLinecap="square" />
        </svg>
      </div>
    ),
    size
  );
}
