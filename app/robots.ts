import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/gallery?private=", "/api/gallery-media*private="] },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: ["/admin/", "/api/gallery?private=", "/api/gallery-media*private="] },
    ],
    sitemap: "https://logoscustombindings.com/sitemap.xml",
    host: "https://logoscustombindings.com",
  };
}
