export const categories = ["Bible Rebinding & Restoration", "Hand-Bound Journals", "Personalization & Finishes", "Custom Work"] as const;
export type Category = typeof categories[number];
export type Photo = { id: string; width: number; height: number; alt: string; caption: string; label: "" | "Before" | "After" };
export type Revision = { title: string; description: string; category: Category; photos: Photo[]; coverId: string; revision: number };
export type Project = { id: string; slug: string; draft: Revision; published: Revision | null; archived: boolean; createdAt: string; updatedAt: string; publishedAt: string | null };
export type EditorProject = Project & { etag: string };
export type PublicProject = Revision & { id: string; slug: string; publishedAt: string; updatedAt: string };
export type GalleryFeed = { projects: PublicProject[]; featuredIds: string[] };
export const blankRevision = (): Revision => ({ title: "", description: "", category: categories[0], photos: [], coverId: "", revision: 1 });
export function homepageProjects(feed: GalleryFeed) {
  const ranked = feed.featuredIds.map(id => feed.projects.find(p => p.id === id)).filter((p): p is PublicProject => !!p);
  return [...ranked, ...feed.projects.filter(p => !feed.featuredIds.includes(p.id))].slice(0, 3);
}
export function slugify(title: string) { return title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72) || "project"; }
