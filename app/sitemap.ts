import type { MetadataRoute } from "next";
import { getGallery } from "./gallery/feed";
import { siteOrigin } from "./gallery/origins";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ["", "bible-rebinding", "book-restoration", "custom-leather-bibles", "hand-bound-notebooks", "custom-work", "customizations", "portfolio", "process", "about", "faq", "request-a-quote", "shop"];
  const { projects } = await getGallery();
  return [...routes.map(route => ({ url: `${siteOrigin}/${route ? `${route}/` : ""}`, changeFrequency: "monthly" as const, priority: route === "" ? 1 : 0.8 })), ...projects.map(project => ({ url: `${siteOrigin}/portfolio/${project.slug}/`, lastModified: new Date(project.publishedAt), changeFrequency: "monthly" as const, priority: 0.7 }))];
}
