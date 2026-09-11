import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WildQuest",
    short_name: "WildQuest",
    description: "Capture creatures, build a team, and battle on Solana.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f3eb",
    theme_color: "#193b56",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
