// Public configuration only. Neither host receives another host's credentials.
export const galleryOrigin = (process.env.NEXT_PUBLIC_GALLERY_ORIGIN || "https://logos-custom-bindings.netlify.app").replace(/\/$/, "");
export const siteOrigin = (process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://logoscustombindings.com").replace(/\/$/, "");
export const studioUrl = `${galleryOrigin}/admin/`;
export function photoUrl(projectId: string, photoId: string, size: "full" | "thumb" = "full", privateMedia = false) {
  return `${privateMedia ? "" : galleryOrigin}/api/gallery-media?project=${encodeURIComponent(projectId)}&photo=${encodeURIComponent(photoId)}&size=${size}${privateMedia ? "&private=1" : ""}`;
}
