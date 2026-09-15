"use client";
/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages */
import { useEffect, useRef, useState } from "react";
import { categories, type PublicProject, type Photo } from "../gallery/model";
import { photoUrl } from "../gallery/origins";

export default function PortfolioGallery({ projects, featured = false, detail = false, privateMedia = false }: { projects: PublicProject[]; featured?: boolean; detail?: boolean; privateMedia?: boolean }) {
  const [category, setCategory] = useState("All work");
  const [selected, setSelected] = useState<PublicProject | null>(null), [photoIndex, setPhotoIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null), trigger = useRef<HTMLElement | null>(null);
  const touch = useRef<number | null>(null);
  const filters = ["All work", ...categories.filter(c => projects.some(p => p.category === c))];
  const visible = featured || detail ? projects : projects.filter(p => category === "All work" || p.category === category);
  const photo = selected?.photos[photoIndex];
  const isOpen = !!selected;
  useEffect(() => {
    if (!isOpen || !dialog.current) return;
    const element = dialog.current; element.showModal();
    const previousOverflow = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { element.close(); document.body.style.overflow = previousOverflow; trigger.current?.focus({ preventScroll: true }); };
  }, [isOpen]);
  const open = (project: PublicProject, index: number, element: HTMLElement) => { trigger.current = element; setPhotoIndex(index); setSelected(project); };
  const move = (offset: number) => { if (selected) setPhotoIndex(i => (i + offset + selected.photos.length) % selected.photos.length); };
  const image = (p: PublicProject, item: Photo, thumb = false, eager = false) => <img src={photoUrl(p.id, item.id, thumb ? "thumb" : "full", privateMedia)} alt={item.alt} width={item.width} height={item.height} loading={eager ? "eager" : "lazy"} decoding="async" />;
  const photoFigure = (p: PublicProject, item: Photo) => <figure key={item.id}><button className="story-photo-button" onClick={e => open(p, p.photos.indexOf(item), e.currentTarget)} aria-label={`Enlarge ${item.alt || "photograph"}`}>{image(p, item)}{item.label && <span className="photo-label">{item.label}</span>}</button>{item.caption && <figcaption>{item.caption}</figcaption>}</figure>;
  return <div className={`atelier-gallery${featured ? " featured-gallery" : ""}`}>
    {!featured && !detail && <div className="gallery-toolbar"><div className="gallery-filters" role="group" aria-label="Filter portfolio">{filters.map(value => <button type="button" key={value} aria-pressed={category === value} onClick={() => setCategory(value)}>{value}</button>)}</div><p className="gallery-count" role="status">{visible.length} selected projects</p></div>}
    {!projects.length && <p className="gallery-empty">New work is being prepared for the gallery. Please visit again soon.</p>}
    {detail ? visible.map(p => <article className="project-story" key={p.id}><p className="eyebrow">{p.category}</p><h1>{p.title || "Untitled project"}</h1><p className="project-description">{p.description}</p>
      {p.photos.some(photo => photo.label === "Before") && p.photos.some(photo => photo.label === "After") && <section className="before-after" aria-label="Before and after"><h2>A new chapter.</h2><div className="story-photo-grid">{[...p.photos.filter(photo => photo.label === "Before"), ...p.photos.filter(photo => photo.label === "After")].map(photo => photoFigure(p, photo))}</div></section>}
      <div className="story-photo-grid">{p.photos.filter(photo => !(p.photos.some(item => item.label === "Before") && p.photos.some(item => item.label === "After")) || !photo.label).map(photo => photoFigure(p, photo))}</div>
    </article>) : <div className="gallery-grid">{visible.map(p => { const cover = p.photos.find(photo => photo.id === p.coverId) || p.photos[0]; return <article className="gallery-card" key={p.id}>{cover && <a className="gallery-image-link" href={`/portfolio/${p.slug}/`} aria-label={`View ${p.title}`} onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); open(p, p.photos.indexOf(cover), event.currentTarget); }}>{image(p, cover, true)}<span className="gallery-view">View the details <span aria-hidden="true">↗</span></span></a>}<div className="gallery-caption"><span className="eyebrow">{p.category}</span><h3><a href={`/portfolio/${p.slug}/`}>{p.title}</a></h3><p>{p.photos.length} {p.photos.length === 1 ? "photograph" : "photographs"}</p></div></article>; })}</div>}
    <dialog ref={dialog} className="project-dialog" aria-labelledby="project-title" onClose={() => setSelected(null)} onCancel={() => setSelected(null)} onClick={e => { if (e.target === e.currentTarget) setSelected(null); }} onKeyDown={e => { if (e.key === "ArrowRight") { e.preventDefault(); move(1); } if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); } }}>
      {selected && photo && <div className="project-dialog-inner"><div className="dialog-top"><span className="eyebrow">A closer look · {photoIndex + 1} / {selected.photos.length}</span><button type="button" autoFocus onClick={() => setSelected(null)} aria-label="Close project">Close ×</button></div><div className="dialog-layout"><div><div className="dialog-image" onTouchStart={e => { touch.current = e.touches[0].clientX; }} onTouchEnd={e => { if (touch.current !== null) { const delta = e.changedTouches[0].clientX - touch.current; if (Math.abs(delta) > 60) move(delta < 0 ? 1 : -1); } touch.current = null; }}>{image(selected, photo, false, true)}{photo.label && <span className="photo-label">{photo.label}</span>}</div>{photo.caption && <p className="viewer-caption">{photo.caption}</p>}{selected.photos.length > 1 && <div className="gallery-thumbnails" role="group" aria-label="Project photographs">{selected.photos.map((p, index) => <button key={p.id} type="button" aria-label={`Photo ${index + 1}${p.label ? `: ${p.label}` : ""}`} aria-pressed={photoIndex === index} onClick={() => setPhotoIndex(index)}>{image(selected, p, true)}</button>)}</div>}</div><div className="dialog-copy"><p className="eyebrow">{selected.category}</p><h2 id="project-title">{selected.title || "Untitled project"}</h2><p className="project-description">{selected.description}</p>{!privateMedia && <><a className="button" href={`/portfolio/${selected.slug}/`}>Read the project story ↗</a><a href="/request-a-quote/">Start your own project</a></>}{selected.photos.length > 1 && <div className="dialog-pagination"><button type="button" onClick={() => move(-1)} aria-label="Previous photograph">←</button><span role="status">Photo {photoIndex + 1} of {selected.photos.length}</span><button type="button" onClick={() => move(1)} aria-label="Next photograph">→</button></div>}</div></div></div>}
    </dialog>
  </div>;
}
