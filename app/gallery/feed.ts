import { galleryOrigin } from "./origins";
import type { GalleryFeed } from "./model";

export async function getGallery(): Promise<GalleryFeed> {
  const response = await fetch(`${galleryOrigin}/api/gallery`, { cache: "no-store", signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error("The portfolio is temporarily unavailable. Please try again shortly.");
  const feed = await response.json();
  if (!Array.isArray(feed.projects) || !Array.isArray(feed.featuredIds)) throw new Error("The gallery returned an invalid response.");
  return feed;
}
