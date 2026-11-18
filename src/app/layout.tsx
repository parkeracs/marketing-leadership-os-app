import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { THEME_INIT_SCRIPT } from "@/components/ThemeToggle";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["opsz"], display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Marketing Leadership OS", template: "%s · Marketing Leadership OS" },
  description: "A marketing-leadership operating system.",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Marketing Leadership OS", statusBarStyle: "default" },
  // Next emits only the generic tag; older iOS versions need the Apple one to open full-screen.
  other: { "apple-mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  // Draw under the notch and home indicator in the home-screen app; CSS pads with the safe-area insets.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F1F2EC" },
    { media: "(prefers-color-scheme: dark)", color: "#12140F" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // The init script sets data-theme before React hydrates, so the attribute can differ from the server render.
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={`${fraunces.variable} ${inter.variable}`}>{children}</body>
    </html>
  );
}
