import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MindBridge — Mental Wellness AI",
    short_name: "MindBridge",
    description:
      "Your AI mental wellness companion. Evidence-based support, personalized daily guidance, and always-on emotional presence.",
    start_url: "/",
    lang: "nb",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#6366F1",
    background_color: "#F9FAFB",
    categories: ["health", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [],
  };
}
