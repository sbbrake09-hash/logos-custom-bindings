import { getStore } from "@netlify/blobs";
import { getUser, verifyRequestOrigin } from "@netlify/identity";
import { categories, type Project, type Revision, type Photo } from "../../../app/gallery/model";

export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export const records = () => getStore({ name: "gallery-projects-v1", consistency: "strong" });
export const media = () => getStore({ name: "gallery-media-v1", consistency: "strong" });
export const idPattern = /^[a-z0-9][a-z0-9-]{5,79}$/;
export function validId(value: unknown): asserts value is string { if (typeof value !== "string" || !idPattern.test(value)) throw new HttpError(400, "Invalid project or photo identifier."); }
export async function editor(request: Request) {
  if (request.method !== "GET") verifyRequestOrigin(request);
  const user = await getUser();
  if (!user?.confirmedAt || !user.invitedAt) throw new HttpError(401, "Please sign in again. Your saved drafts are safe.");
  if (user.email?.toLowerCase() !== "logoscustombindings@yahoo.com" || !user.roles?.includes("gallery-editor")) throw new HttpError(403, "This account does not have gallery editing access.");
  return user;
}
export function json(value: unknown, status = 200) { return Response.json(value, { status, headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex", "Vary": "Cookie, Origin" } }); }
export function failure(error: unknown) {
  const status = error instanceof HttpError ? error.status : (error as { status?: number })?.status === 403 ? 403 : 503;
  // Never serialize provider errors, tokens, object keys, or stack traces.
  return json({ error: status === 503 ? "Gallery storage is temporarily unavailable. Your last saved work is safe. Please retry." : (error as Error).message }, status);
}
export async function readProject(id: string) {
  validId(id);
  const found = await records().getWithMetadata(`projects/${id}`, { type: "json" });
  if (!found) throw new HttpError(404, "Project not found.");
  if (!found.etag) throw new Error("Missing version");
  return { project: found.data as Project, etag: found.etag };
}
export async function listProjects() {
  const { blobs } = await records().list({ prefix: "projects/" });
  // Bounded concurrency avoids flooding storage as the gallery grows.
  const result: (Project & { etag: string })[] = [];
  for (let i = 0; i < blobs.length; i += 12) {
    const group = await Promise.all(blobs.slice(i, i + 12).map(async b => {
      const value = await records().getWithMetadata(b.key, { type: "json" });
      if (!value) throw new Error("Missing listed project");
      if (!value.etag) throw new Error("Missing version");
      return { ...(value.data as Project), etag: value.etag };
    }));
    result.push(...group);
  }
  return result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
export async function features() {
  const value = await records().getWithMetadata("features", { type: "json" });
  return { ids: (value?.data?.ids || []) as string[], etag: value?.etag || "new" };
}
export function checkVersion(actual: string, supplied: unknown) {
  if (actual !== supplied) throw new HttpError(409, "This project changed in another session. Your edits are still on this screen. Copy any unsaved text, then reload the latest version.");
}
function text(value: unknown, maximum: number) {
  if (typeof value !== "string" || value.length > maximum) throw new HttpError(400, `Please keep text within ${maximum} characters.`);
  return value.trim();
}
export async function validateRevision(input: unknown, projectId: string, revision: number, publish: boolean): Promise<Revision> {
  const r = input as Revision;
  if (!r || !categories.includes(r.category) || !Array.isArray(r.photos) || r.photos.length > 20) throw new HttpError(400, "Choose a service category and no more than 20 photos.");
  const title = text(r.title, 120), description = text(r.description, 3000);
  if (publish && (title.length < 3 || description.length < 20 || !r.photos.length)) throw new HttpError(400, "Publishing needs a title, a description of at least 20 characters, and at least one photo.");
  const photos: Photo[] = [];
  const ids = new Set<string>();
  for (const item of r.photos) {
    validId(item.id);
    if (ids.has(item.id)) throw new HttpError(400, "A photo can appear only once in a project.");
    ids.add(item.id);
    const ready = await media().getMetadata(`${projectId}/${item.id}/full`);
    const thumb = await media().getMetadata(`${projectId}/${item.id}/thumb`);
    if (!ready || !thumb) throw new HttpError(400, "A photo has not finished uploading. Retry it before saving or publishing.");
    const alt = text(item.alt, 300), caption = text(item.caption, 600);
    if (publish && !alt) throw new HttpError(400, "Add descriptive alt text to every photo before publishing.");
    if (!["", "Before", "After"].includes(item.label)) throw new HttpError(400, "Invalid photo label.");
    photos.push({ id: item.id, width: Number(ready.metadata.width), height: Number(ready.metadata.height), alt, caption, label: item.label });
  }
  if (photos.length && !ids.has(r.coverId)) throw new HttpError(400, "Choose a cover photo from this project.");
  return { title, description, category: r.category, photos, coverId: photos.length ? r.coverId : "", revision };
}
export async function limitedBody(request: Request, limit: number) {
  if (Number(request.headers.get("content-length")) > limit) throw new HttpError(413, "This upload is too large.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Missing request body.");
  const chunks: Uint8Array[] = []; let size = 0;
  for (;;) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > limit) { await reader.cancel(); throw new HttpError(413, "This upload is too large."); } chunks.push(value); }
  return Buffer.concat(chunks);
}
