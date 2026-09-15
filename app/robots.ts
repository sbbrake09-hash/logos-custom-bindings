import type { MetadataRoute } from "next";
import { siteOrigin } from "./gallery/origins";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/gallery?private=", "/api/gallery-media*private="] },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: ["/admin/", "/api/gallery?private=", "/api/gallery-media*private="] },
    ],
    sitemap: `${siteOrigin}/sitemap.xml`,
    host: siteOrigin,
  };
}
