"use client";

/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages */
import { useEffect, useRef, useState } from "react";
import { acceptInvite, getUser, handleAuthCallback, login, logout, onAuthChange, requestPasswordRecovery, updateUser } from "@netlify/identity";
import { categories, type EditorProject, type Photo, type Revision } from "../gallery/model";
import { galleryOrigin, photoUrl, studioUrl } from "../gallery/origins";
import PortfolioGallery from "../components/PortfolioGallery";

type Upload = { id: string; file: File; status: string; progress: number; failed: boolean; done: boolean };
type Placement = { ids: string[]; etag: string };
async function api(action?: unknown, id?: string) {
  const response = await fetch(`/api/gallery?private=1${id ? `&id=${encodeURIComponent(id)}` : ""}`, { method: action ? "POST" : "GET", credentials: "same-origin", cache: "no-store", headers: action ? { "Content-Type": "application/json" } : {}, body: action ? JSON.stringify(action) : undefined });
  const result = await response.json().catch(() => ({ error: "The studio could not connect. Please retry." }));
  if (!response.ok) throw Object.assign(new Error(result.error || "The request could not be completed."), { status: response.status });
  return result;
}
function uploadImage(id: string, photo: string, blob: Blob, progress: (value: number) => void): Promise<Pick<Photo, "id" | "width" | "height">> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/gallery-media?project=${id}&photo=${photo}`); xhr.timeout = 90000;
    xhr.setRequestHeader("Content-Type", "image/jpeg");
    xhr.upload.onprogress = event => { if (event.lengthComputable) progress(Math.round(event.loaded / event.total * 90)); };
    xhr.onerror = xhr.ontimeout = () => reject(new Error("Upload interrupted. Your saved text is safe; retry this photo."));
    xhr.onload = () => {
      let result; try { result = JSON.parse(xhr.responseText); } catch { reject(new Error("The server could not process this photo. Please retry.")); return; }
      if (xhr.status < 200 || xhr.status >= 300) reject(new Error(result.error || "Upload failed. Please retry.")); else resolve(result);
    };
    xhr.send(blob);
  });
}

export default function Studio() {
  const [ready, setReady] = useState(false), [mirror, setMirror] = useState(false);
  const [signedIn, setSignedIn] = useState(false), [email, setEmail] = useState("logoscustombindings@yahoo.com"), [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "recover" | "password">("login"), [invite, setInvite] = useState<string | null>(null);
  const [message, setMessage] = useState(""), [error, setError] = useState("");
  const [projects, setProjects] = useState<EditorProject[] | null>(null), [placement, setPlacement] = useState<Placement>({ ids: [], etag: "new" });
  const [project, setProject] = useState<EditorProject | null>(null), [draft, setDraft] = useState<Revision | null>(null);
  const [dirty, setDirty] = useState(false), [busy, setBusy] = useState(false), [tab, setTab] = useState("All projects");
  const [uploads, setUploads] = useState<Upload[]>([]), [preview, setPreview] = useState(false);
  const [authNeeded, setAuthNeeded] = useState(false);
  const init = useRef(false), previewDialog = useRef<HTMLDialogElement>(null);
  const previewTrigger = useRef<HTMLButtonElement>(null);
  const load = async () => { const data = await api(); setProjects(data.projects); setPlacement({ ...data.features, ids: data.features.ids.filter((id: string) => data.projects.some((p: EditorProject) => p.id === id && p.published && !p.archived)) }); };

  useEffect(() => {
    if (init.current) return; init.current = true;
    if (window.location.origin !== galleryOrigin && !window.location.hostname.endsWith("--logos-custom-bindings.netlify.app")) { setMirror(true); setReady(true); return; }
    (async () => {
      const result = await handleAuthCallback();
      if (result?.type === "invite") { setInvite(result.token || null); setMode("password"); }
      else if (result?.type === "recovery") setMode("password");
      const user = await getUser(); setSignedIn(!!user);
      if (user && result?.type !== "recovery") await load();
    })().catch(e => setError(e.message)).finally(() => setReady(true));
  }, []);
  useEffect(() => onAuthChange((event, user) => { if (event === "logout") { setSignedIn(false); setAuthNeeded(true); } else if (user) setSignedIn(true); }), []);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty || busy) event.preventDefault(); };
    window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, busy]);
  useEffect(() => {
    if (!preview || !previewDialog.current) return;
    previewDialog.current.showModal(); const old = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { previewDialog.current?.close(); document.body.style.overflow = old; previewTrigger.current?.focus(); };
  }, [preview]);

  async function run(task: () => Promise<void>) {
    setBusy(true); setError(""); setMessage("");
    try { await task(); } catch (e) { setError((e as Error).message); if ((e as { status?: number }).status === 401) { setAuthNeeded(true); setMode("login"); } } finally { setBusy(false); }
  }
  function edit(value: EditorProject) { setProject(value); setDraft(structuredClone(value.draft)); setDirty(false); setUploads([]); setError(""); setMessage(""); }
  function change(update: Partial<Revision>) { setDraft(current => current ? { ...current, ...update } : null); setDirty(true); }
  function photoChange(id: string, update: Partial<Photo>) { if (draft) change({ photos: draft.photos.map(p => p.id === id ? { ...p, ...update } : p) }); }
  function movePhoto(index: number, offset: number) { if (!draft) return; const photos = [...draft.photos]; [photos[index], photos[index + offset]] = [photos[index + offset], photos[index]]; change({ photos }); }
  async function persist(action: string, value = draft) {
    if (!project || !value) return;
    let version = project.etag;
    if (dirty && ["archive", "unpublish"].includes(action)) {
      const saved = await api({ action: "save", id: project.id, etag: version, draft: value });
      version = saved.etag; setProject(saved); setDraft(structuredClone(saved.draft)); setDirty(false);
    }
    const updated = await api({ action, id: project.id, etag: version, draft: value });
    setProject(updated); setDraft(structuredClone(updated.draft)); setDirty(false);
    setProjects(current => current?.map(p => p.id === updated.id ? updated : p) || [updated]);
    if (["unpublish", "archive"].includes(action)) setPlacement(current => ({ ...current, ids: current.ids.filter(id => id !== updated.id) }));
    setMessage(action === "publish" ? "Published. Both galleries will show this version within a minute." : action === "save" ? "Draft saved. Visitors still see the last published version." : "Project updated.");
    return updated as EditorProject;
  }
  async function queueFiles(files: File[], retry?: Upload) {
    if (!project || !draft || busy) return;
    if (draft.photos.length + files.length > 20) { setError("Each project can have up to 20 photos. Choose fewer files or remove a photo first."); return; }
    await run(async () => {
      // Text is persisted before conversion or network upload begins.
      let saved = await persist("save"); if (!saved) return;
      const batch = retry ? [retry] : files.map(file => ({ id: crypto.randomUUID(), file, progress: 0, status: "Waiting", failed: false, done: false }));
      if (!retry) setUploads(current => [...current, ...batch]);
      const mark = (id: string, update: Partial<Upload>) => setUploads(current => current.map(u => u.id === id ? { ...u, ...update } : u));
      for (const item of batch) {
        try {
          mark(item.id, { status: "Preparing photo…", failed: false, progress: 0 });
          const { preparePhoto } = await import("./prepare-photo");
          const blob = await preparePhoto(item.file);
          mark(item.id, { status: "Uploading…" });
          const dimensions = await uploadImage(saved.id, item.id, blob, progress => mark(item.id, { progress, status: progress >= 90 ? "Finishing…" : "Uploading…" }));
          const next: Revision = { ...saved.draft, coverId: saved.draft.coverId || item.id, photos: [...saved.draft.photos, { ...dimensions, caption: "", alt: "", label: "" }] };
          saved = await api({ action: "save", id: saved.id, etag: saved.etag, draft: next }) as EditorProject;
          setProject(saved); setDraft(structuredClone(saved.draft));
          setProjects(current => current?.map(p => p.id === saved!.id ? saved! : p) || [saved!]);
          mark(item.id, { status: "Saved · add alt text below", progress: 100, done: true });
        } catch (e) { mark(item.id, { status: (e as Error).message, failed: true }); }
      }
      setMessage("Photo processing finished. Review the results below and add descriptive alt text before publishing.");
    });
  }
  const displayed = projects?.filter(p => tab === "Archived" ? p.archived : !p.archived && (tab === "Drafts" ? !p.published || p.draft.revision !== p.published.revision : tab === "Published" ? !!p.published : true));
  const authForm = <form className="studio-auth" onSubmit={event => {
    event.preventDefault(); void run(async () => {
      if (mode === "recover") { await requestPasswordRecovery(email); setMessage("If this email has an account, a password reset link is on its way. Check your inbox and spam folder."); return; }
      if (mode === "password") { if (invite) await acceptInvite(invite, password); else await updateUser({ password }); setInvite(null); }
      else await login(email, password);
      setPassword(""); setMode("login"); setSignedIn(true); setAuthNeeded(false); await load();
    });
  }}>
    <h2>{mode === "password" ? invite ? "Welcome, Johnny." : "Choose a new password." : mode === "recover" ? "Reset your password." : "Welcome back, Johnny."}</h2>
    <p>{mode === "password" ? "Choose a password of at least 12 characters that you don’t use anywhere else." : "Your photographs. Your stories. A space to share the work."}</p>
    {mode !== "password" && <label>Email address<input type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} /></label>}
    {mode !== "recover" && <label>{mode === "password" ? "New password" : "Password"}<input type="password" required minLength={mode === "password" ? 12 : 1} autoComplete={mode === "password" ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} /></label>}
    <button className="button" disabled={busy}>{busy ? "Please wait…" : mode === "recover" ? "Send reset link" : mode === "password" ? "Save password" : "Sign in"}</button>
    {mode !== "password" && <button className="studio-link" type="button" onClick={() => { setMode(mode === "recover" ? "login" : "recover"); setError(""); }}>{mode === "recover" ? "Back to sign in" : "Forgot your password?"}</button>}
    <small>Invitation-only access. Need help? Contact the person who manages your website.</small>
  </form>;

  return <div className="studio"><header className="studio-header"><a className="studio-brand" href="/"><img src="/lcb-circle-logo.png" width="46" height="46" alt="" /><span>Logos <small>Gallery Studio</small></span></a><div className="studio-actions"><a href="/portfolio/">View website ↗</a>{signedIn && <button disabled={busy} onClick={() => { if (dirty && !confirm("Leave unsaved edits? Your last saved draft is safe.")) return; void run(async () => { await logout(); setProject(null); setDraft(null); setProjects(null); setDirty(false); setUploads([]); }); }}>Sign out</button>}</div></header>
    <main id="main-content" className="studio-main">
      {error && <div className="studio-alert" role="alert">{error}</div>}{message && <div className="studio-notice" role="status">{message}</div>}
      {!ready ? <p role="status">Opening your studio…</p> : mirror ? <div className="studio-auth"><h1>Your gallery studio.</h1><p>Editing lives on the main website. Published projects appear here automatically, too.</p><a className="button" href={studioUrl}>Open Johnny’s studio ↗</a></div> : (!signedIn || mode === "password" || authNeeded) ? authForm : <>
        {!project ? <><div className="studio-heading"><div><p className="eyebrow">The work, collected</p><h1>Your projects.</h1><p>Save privately. Publish when it feels right.</p></div><button className="button" disabled={busy} onClick={() => void run(async () => { const value = await api({ action: "create" }); setProjects(current => [value, ...(current || [])]); edit(value); })}>＋ New project</button></div>
          <div className="studio-tabs" role="group" aria-label="Project status">{["All projects", "Published", "Drafts", "Archived"].map(t => <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>{t}</button>)}</div>
          {!projects ? <div className="studio-empty"><p>Your projects could not be loaded. Nothing has been removed.</p><button onClick={() => void run(load)}>Try again</button></div> : !displayed?.length ? <p className="studio-empty">No projects here yet.</p> : <div className="studio-grid">{displayed.map(p => { const cover = p.draft.photos.find(photo => photo.id === p.draft.coverId); return <article className="studio-card" key={p.id}>{cover ? <img src={photoUrl(p.id, cover.id, "thumb", true)} alt={cover.alt || "Project cover"} width={cover.width} height={cover.height} loading="lazy" /> : <div className="studio-no-photo">A new story starts here.</div>}<div className="studio-card-copy"><span className="eyebrow">{p.archived ? "Archived" : p.published ? p.draft.revision !== p.published.revision ? "Published · draft changes" : "Published" : "Draft"}</span><h2>{p.draft.title || "Untitled project"}</h2><p>{p.draft.category}</p><div className="studio-actions"><button disabled={busy} onClick={() => edit(p)}>{p.archived ? "Open" : "Edit project"}</button>{p.published && !p.archived && <button aria-pressed={placement.ids.includes(p.id)} disabled={busy} onClick={() => void run(async () => { const ids = placement.ids.includes(p.id) ? placement.ids.filter(id => id !== p.id) : [...placement.ids, p.id]; if (ids.length > 3) throw new Error("Three projects are already featured. Unfeature one first."); setPlacement(await api({ action: "features", ids, etag: placement.etag })); setMessage("Homepage selection saved."); })}>{placement.ids.includes(p.id) ? "★ Featured" : "☆ Feature"}</button>}</div></div></article>; })}</div>}
          <details className="studio-guide"><summary>A short guide to your studio</summary><ol><li>Choose New project, add a title, service category, and a short story.</li><li>Add photos from your phone or computer. Keep this tab open while each photo processes.</li><li>Add alt text describing what each photo shows. Captions and Before/After labels are optional.</li><li>Choose a cover and use Move earlier / Move later to arrange photos.</li><li>Save draft keeps work private. Preview lets you check the layout. Publish makes it visible on both websites.</li><li>Choose Feature on up to three published projects. Any remaining homepage spaces use your newest projects.</li><li>Unpublish hides a project. Archive stores it away; Restore returns it as a draft.</li></ol></details>
        </> : draft && <><div className="studio-heading"><div><button className="studio-link" disabled={busy} onClick={() => { if (!dirty || confirm("Leave unsaved edits? Your last saved draft is safe.")) { setProject(null); setDraft(null); setDirty(false); setUploads([]); } }}>← All projects</button><h1>{draft.title || "A new project."}</h1><p>{project.archived ? "Archived · restore to edit" : dirty ? "Unsaved changes" : "All changes saved"}</p></div><div className="studio-actions"><button ref={previewTrigger} disabled={!draft.photos.length || busy} onClick={() => setPreview(true)}>Preview</button>{!project.archived && <><button disabled={busy} onClick={() => void run(async () => { await persist("save"); })}>Save draft</button><button className="button" disabled={busy || uploads.some(u => !u.done)} onClick={() => void run(async () => { await persist("publish"); })}>{project.published ? "Publish changes" : "Publish"}</button></>}</div></div>
          <fieldset className="studio-editor" disabled={busy || project.archived}>
            <div className="studio-fields"><label>Project title<input maxLength={120} value={draft.title} onChange={e => change({ title: e.target.value })} /></label><label>Service category<select value={draft.category} onChange={e => change({ category: e.target.value as Revision["category"] })}>{categories.map(c => <option key={c}>{c}</option>)}</select></label><label>The project’s story<textarea rows={6} maxLength={3000} value={draft.description} onChange={e => change({ description: e.target.value })} placeholder="What made this piece special? Tell us about the book, materials, and finishing details." /></label><p className="studio-hint">Your published version stays unchanged until you choose Publish changes.</p></div>
            <div className="studio-upload"><span className="eyebrow">Photographs</span><h2>Let the details speak.</h2><p>Up to 20 photographs. JPG, PNG, WebP, HEIC or HEIF. Originals up to 20 MB and 48 megapixels each.</p><label className="studio-file">Add photos<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" onChange={e => { const files = Array.from(e.target.files || []); e.target.value = ""; if (files.length) void queueFiles(files); }} /></label><p className="studio-hint">Photos are prepared one at a time. Location details are removed. Keep this tab open until uploads finish.</p></div>
          </fieldset>
          {!!uploads.length && <ul className="studio-upload-list" aria-label="Upload progress">{uploads.map(u => <li key={u.id}><strong>{u.file.name}</strong><span role="status">{u.status}</span><progress aria-label={`${u.file.name} upload`} value={u.progress} max={100} />{u.failed && <div className="studio-actions"><button disabled={busy} onClick={() => void queueFiles([u.file], u)}>Retry</button><button disabled={busy} onClick={() => setUploads(current => current.filter(item => item.id !== u.id))}>Dismiss failed photo</button></div>}</li>)}</ul>}
          <div className="studio-photo-grid">{draft.photos.map((p, index) => <fieldset key={p.id} disabled={busy || project.archived} className="studio-photo"><img src={photoUrl(project.id, p.id, "thumb", true)} alt={p.alt || "Photo awaiting description"} width={p.width} height={p.height} loading="lazy" /><div className="studio-photo-fields"><div className="studio-actions"><button type="button" aria-pressed={draft.coverId === p.id} onClick={() => change({ coverId: p.id })}>{draft.coverId === p.id ? "★ Cover photo" : "Use as cover"}</button><span>{index + 1} / {draft.photos.length}</span></div><label>Alt text · required to publish<textarea maxLength={300} rows={2} value={p.alt} placeholder="Describe the cover, colors, and details visible in this photo." onChange={e => photoChange(p.id, { alt: e.target.value })} /></label><label>Caption · optional<input maxLength={600} value={p.caption} onChange={e => photoChange(p.id, { caption: e.target.value })} /></label><label>Before / after label<select value={p.label} onChange={e => photoChange(p.id, { label: e.target.value as Photo["label"] })}><option value="">No label</option><option>Before</option><option>After</option></select></label><div className="studio-actions"><button disabled={busy || project.archived || index === 0} onClick={() => movePhoto(index, -1)} aria-label={`Move photo ${index + 1} earlier`}>↑ Earlier</button><button disabled={busy || project.archived || index === draft.photos.length - 1} onClick={() => movePhoto(index, 1)} aria-label={`Move photo ${index + 1} later`}>↓ Later</button><button onClick={() => { if (confirm("Remove this photo from the draft? It stays in the published version until you publish changes.")) { const photos = draft.photos.filter(photo => photo.id !== p.id); change({ photos, coverId: draft.coverId === p.id ? photos[0]?.id || "" : draft.coverId }); } }}>Remove</button></div></div></fieldset>)}</div>
          <div className="studio-bottom-actions">{project.published && <button disabled={busy} onClick={() => { if (confirm("Hide this project from both public galleries? The draft will be kept.")) void run(async () => { await persist("unpublish"); }); }}>Unpublish project</button>}<button disabled={busy} onClick={() => { if (!project.archived && !confirm("Archive this project? It will be hidden, and you can restore its saved draft later.")) return; void run(async () => { await persist(project.archived ? "restore" : "archive"); }); }}>{project.archived ? "Restore project" : "Archive project"}</button><button disabled={busy} onClick={() => { if (!dirty || confirm("Reload the saved version and discard unsaved edits?")) void run(async () => edit(await api(undefined, project.id))); }}>Reload saved version</button></div>
          <dialog className="studio-preview" ref={previewDialog} onClose={() => setPreview(false)} onCancel={() => setPreview(false)} aria-label="Private project preview">{preview && <><div className="studio-heading"><p className="eyebrow">Private draft preview · not published</p><button autoFocus onClick={() => setPreview(false)}>Close preview ×</button></div><PortfolioGallery projects={[{ ...draft, id: project.id, slug: project.slug, publishedAt: project.publishedAt || project.updatedAt, updatedAt: project.updatedAt }]} privateMedia detail /></>}</dialog>
        </>}
      </>}
    </main><footer className="studio-footer">Logos Custom Bindings · Made one piece at a time.</footer>
  </div>;
}
