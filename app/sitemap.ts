import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "bible-rebinding", "book-restoration", "custom-leather-bibles", "hand-bound-notebooks", "custom-work", "customizations", "portfolio", "process", "about", "faq", "request-a-quote", "shop"];
  return routes.map((route) => ({ url: `https://logoscustombindings.com/${route ? `${route}/` : ""}`, lastModified: new Date("2026-08-12"), changeFrequency: "monthly", priority: route === "" ? 1 : route === "request-a-quote" ? 0.95 : 0.8 }));
}
