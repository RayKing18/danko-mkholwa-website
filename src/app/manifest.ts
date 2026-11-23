import type { MetadataRoute } from "next";

/** PWA manifest — lets customers add Danko Mkholwa to their home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Danko Mkholwa — Flavour That Feels Like Home",
    short_name: "Danko Mkholwa",
    description:
      "Order burgers, loaded fries and mocktails from Danko Mkholwa, Newcastle KZN. Order, Chommie!",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0b0b",
    theme_color: "#0b0b0b",
    lang: "en-ZA",
    categories: ["food", "shopping"],
    icons: [
      { src: "/api/icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/api/icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/api/icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Order now", url: "/menu", description: "Browse the menu and order" },
      { name: "My basket", url: "/basket" },
    ],
  };
}
