import type { Config } from "@netlify/functions";
import { blankRevision, slugify, type Project } from "../../app/gallery/model";
import { editor, records, json, failure, features, listProjects, readProject, checkVersion, validateRevision, HttpError, limitedBody } from "./_shared/gallery";

export default async (request: Request) => {
  try {
    const url = new URL(request.url);
    if (request.method === "GET" && !url.searchParams.has("private")) {
      const [all, placement] = await Promise.all([listProjects(), features()]);
      if (!(await records().getMetadata("seed-complete"))) throw new HttpError(503, "Gallery is being prepared.");
      const projects = all.filter(p => p.published && !p.archived).map(p => ({ ...p.published!, id: p.id, slug: p.slug, publishedAt: p.publishedAt!, updatedAt: p.publishedAt! })).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
      return json({ projects, featuredIds: placement.ids.filter(id => projects.some(p => p.id === id)) });
    }
    await editor(request);
    if (request.method === "GET") {
      const id = url.searchParams.get("id");
      if (id) { const { project, etag } = await readProject(id); return json({ ...project, etag }); }
      const [projects, placement] = await Promise.all([listProjects(), features()]);
      return json({ projects, features: placement });
    }
    if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
    let body;
    try { body = JSON.parse((await limitedBody(request, 100_000)).toString()); } catch (e) { if (e instanceof HttpError) throw e; throw new HttpError(400, "Invalid request."); }
    const now = new Date().toISOString();
    if (body.action === "create") {
      const id = crypto.randomUUID();
      const project: Project = { id, slug: "", draft: blankRevision(), published: null, archived: false, createdAt: now, updatedAt: now, publishedAt: null };
      const result = await records().setJSON(`projects/${id}`, project, { onlyIfNew: true });
      if (!result.modified) throw new HttpError(409, "Please retry creating the project.");
      return json({ ...project, etag: result.etag }, 201);
    }
    if (body.action === "features") {
      const current = await features(); checkVersion(current.etag, body.etag);
      if (!Array.isArray(body.ids) || body.ids.length > 3 || new Set(body.ids).size !== body.ids.length) throw new HttpError(400, "Choose up to three different featured projects.");
      for (const id of body.ids) { const { project } = await readProject(id); if (!project.published || project.archived) throw new HttpError(400, "Only published projects can be featured."); }
      const result = await records().setJSON("features", { ids: body.ids }, current.etag === "new" ? { onlyIfNew: true } : { onlyIfMatch: current.etag });
      if (!result.modified) throw new HttpError(409, "Homepage selections changed. Reload and try again.");
      return json({ ids: body.ids, etag: result.etag });
    }
    const { project, etag } = await readProject(body.id); checkVersion(etag, body.etag);
    switch (body.action) {
      case "save":
      case "publish": {
        if (project.archived) throw new HttpError(400, "Restore this project before editing.");
        const publish = body.action === "publish";
        const revision = await validateRevision(body.draft, project.id, project.draft.revision + 1, publish);
        project.draft = revision;
        if (publish) {
          project.slug ||= `${slugify(revision.title)}-${project.id}`;
          project.published = structuredClone(revision); project.publishedAt = now;
        }
        break;
      }
      case "unpublish": project.published = null; break;
      case "archive": project.archived = true; project.published = null; break;
      case "restore": project.archived = false; break;
      default: throw new HttpError(400, "Unknown action.");
    }
    project.updatedAt = now;
    const result = await records().setJSON(`projects/${project.id}`, project, { onlyIfMatch: etag });
    if (!result.modified) throw new HttpError(409, "A newer save exists. Your edits are still here; copy them before reloading.");
    return json({ ...project, etag: result.etag });
  } catch (error) { return failure(error); }
};
export const config: Config = { path: "/api/gallery" };
