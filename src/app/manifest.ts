import type { MetadataRoute } from "next";

/** Makes "Add to Home Screen" open the app full-screen, without browser controls. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Marketing Leadership OS",
    short_name: "Marketing OS",
    description: "A marketing-leadership operating system.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F1F2EC",
    theme_color: "#F1F2EC",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
