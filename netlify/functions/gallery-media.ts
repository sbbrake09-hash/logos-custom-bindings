import sharp from "sharp";
import type { Config } from "@netlify/functions";
import { editor, media, readProject, validId, json, failure, limitedBody, HttpError } from "./_shared/gallery";

export default async (request: Request) => {
  try {
    const url = new URL(request.url);
    const projectId = url.searchParams.get("project"); validId(projectId);
    const photoId = url.searchParams.get("photo"); validId(photoId);
    const privateRead = url.searchParams.has("private");
    if (request.method !== "GET" || privateRead) await editor(request);
    const { project } = await readProject(projectId);
    const prefix = `${projectId}/${photoId}`;
    if (request.method === "GET") {
      if (!privateRead && (project.archived || !project.published?.photos.some(p => p.id === photoId))) throw new HttpError(404, "Photo not found.");
      const size = url.searchParams.get("size") === "thumb" ? "thumb" : "full";
      const image = await media().get(`${prefix}/${size}`, { type: "arrayBuffer" });
      if (!image) throw new HttpError(404, "Photo not found.");
      return new Response(image, { headers: { "Content-Type": "image/webp", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", ...(privateRead ? { "X-Robots-Tag": "noindex" } : {}) } });
    }
    if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
    if (project.archived) throw new HttpError(400, "Restore the project before adding photos.");
    // Photo IDs are immutable; retries can never replace a live photograph.
    const existing = await media().getMetadata(`${prefix}/full`);
    if (existing && await media().getMetadata(`${prefix}/thumb`)) return json({ id: photoId, ...existing.metadata });
    const input = await limitedBody(request, 3 * 1024 * 1024);
    let full, thumbnail;
    try {
      const source = sharp(input, { limitInputPixels: 48_000_000, animated: false, failOn: "warning" });
      const info = await source.metadata();
      if (!["jpeg", "png", "webp"].includes(info.format || "") || (info.pages || 1) > 1) throw new Error("Not a photograph");
      full = await source.rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer({ resolveWithObject: true });
      thumbnail = await sharp(full.data).resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
    } catch { throw new HttpError(415, "This is not a supported photograph. Use a valid JPG, PNG, WebP, or convert HEIC in the editor."); }
    const metadata = { width: full.info.width, height: full.info.height };
    await media().set(`${prefix}/thumb`, thumbnail.buffer.slice(thumbnail.byteOffset, thumbnail.byteOffset + thumbnail.byteLength) as ArrayBuffer, { onlyIfNew: true, metadata });
    await media().set(`${prefix}/full`, full.data.buffer.slice(full.data.byteOffset, full.data.byteOffset + full.data.byteLength) as ArrayBuffer, { onlyIfNew: true, metadata });
    return json({ id: photoId, ...metadata }, 201);
  } catch (error) { return failure(error); }
};
export const config: Config = { path: "/api/gallery-media" };
