"use client";

/* eslint-disable @next/next/no-html-link-for-pages */
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";

const projects = [
  { title: "Bible Rebinding & Personalized Imprinting", category: "Personal details", detail: "A verse, carried with you.", copy: "Gold scripture imprinting, a tooled spine, and personalized red ribbons bring individual meaning to this leather Bible.", image: "/portfolio/bible-rebinding-imprinting.jpg", alt: "Custom rebound Bible with tooled spine, red ribbons, and gold scripture imprinting." },
  { title: "Leather Bindings in Color", category: "Leather bindings", detail: "Color, chosen by you.", copy: "Turquoise and pink covers paired with ribbon markers and personalized gold lettering. A different expression of the same careful craft.", image: "/portfolio/hand-bound-journals-color.jpg", alt: "Turquoise and pink leather-bound books with personalized gold lettering and ribbon markers." },
  { title: "Bible Rebinding & Ribbon Details", category: "Leather bindings", detail: "Every binding has a story.", copy: "A collection of finished Bibles showing different leather grains, gold imprinting, and coordinating ribbon colors.", image: "/portfolio/stacked-bibles-imprinting.png", alternate: "/portfolio/stacked-bibles-edited.jpg", alt: "Stacked custom Bibles with leather covers, gold imprinting, and colorful ribbon markers." },
  { title: "Custom Scripture Ribbons", category: "Personal details", detail: "Meaning in the smallest details.", copy: "Personalized scripture ribbons sit against gilt page edges and a richly colored leather cover.", image: "/portfolio/leather-bible-ribbons.png", alt: "Close-up of a leather Bible with gilt page edges and red scripture ribbons." },
  { title: "Textured Leather & Personalization", category: "Personal details", detail: "A texture all its own.", copy: "A deeply textured cover with a personalized inset panel—a distinctive approach to a familiar, much-loved book.", image: "/portfolio/textured-leather-personalization.jpg", alt: "Black textured leather Bible cover with a personalized inset panel." },
  { title: "Custom Bible Pair", category: "Leather bindings", detail: "Made to be used. Made to be yours.", copy: "Two personalized black leather Bibles, each finished with its own name imprint, page edges, and ribbon markers.", image: "/portfolio/two-custom-bibles.jpg", alt: "Two personalized black leather Bibles with contrasting page edges and ribbon markers." },
];
const filters = ["All work", "Leather bindings", "Personal details"];

export default function PortfolioGallery({ featured = false }: { featured?: boolean }) {
  const [category, setCategory] = useState("All work");
  const [selected, setSelected] = useState<number | null>(null);
  const [alternate, setAlternate] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLAnchorElement | null>(null);
  const visible = featured ? projects.slice(0, 3) : projects.filter(project => category === "All work" || project.category === category);
  const project = selected === null ? null : projects[selected];
  const isOpen = selected !== null;

  useEffect(() => {
    const element = dialog.current;
    if (!isOpen || !element) return;
    element.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      trigger.current?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  const filter = (value: string) => {
    const update = () => flushSync(() => setCategory(value));
    if (document.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.classList.add("filtering-gallery");
      const transition = document.startViewTransition(update);
      const clear = () => document.documentElement.classList.remove("filtering-gallery");
      void transition.finished.then(clear, clear);
    } else update();
  };
  const move = (direction: number) => {
    setAlternate(false);
    setSelected(index => ((index ?? 0) + direction + projects.length) % projects.length);
  };

  return <div className={`atelier-gallery${featured ? " featured-gallery" : ""}`}>
    {!featured && <div className="gallery-toolbar">
      <div className="gallery-filters" role="group" aria-label="Filter portfolio">
        {filters.map(value => <button type="button" key={value} aria-pressed={category === value} onClick={() => filter(value)}>{value}</button>)}
      </div>
      <p className="gallery-count" role="status">{visible.length} selected projects</p>
    </div>}
    <div className="gallery-grid">
      {visible.map(item => <article className="gallery-card" key={item.image}>
        <a className="gallery-image-link" href={item.image} aria-label={`View ${item.title}`} onClick={event => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          trigger.current = event.currentTarget;
          setAlternate(false);
          setSelected(projects.indexOf(item));
        }}>
          <Image src={item.image} alt={item.alt} fill unoptimized={process.env.NODE_ENV === "development"} sizes={featured ? "(max-width: 600px) 100vw, 33vw" : "(max-width: 600px) 100vw, 50vw"} className="gallery-image" />
          <span className="gallery-view">View the details <span aria-hidden="true">↗</span></span>
        </a>
        <div className="gallery-caption"><span className="eyebrow">{item.category}</span><h3>{item.detail}</h3><p>{item.title}</p></div>
      </article>)}
    </div>
    <dialog ref={dialog} className="project-dialog" aria-labelledby="project-title" onClose={() => setSelected(null)} onCancel={() => setSelected(null)} onClick={event => { if (event.target === event.currentTarget) setSelected(null); }} onKeyDown={event => {
      if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
    }}>
      {project && <div className="project-dialog-inner">
        <div className="dialog-top"><span className="eyebrow">A closer look · {String((selected ?? 0) + 1).padStart(2, "0")} / 06</span><button type="button" autoFocus onClick={() => setSelected(null)} aria-label="Close project">Close <span aria-hidden="true">×</span></button></div>
        <div className="dialog-layout">
          <div className="dialog-image"><Image unoptimized={process.env.NODE_ENV === "development"} key={alternate ? project.alternate : project.image} src={alternate && project.alternate ? project.alternate : project.image} alt={project.alt} width={1000} height={1100} sizes="(max-width: 760px) 90vw, 65vw" />{project.alternate && <button className="alternate-image" type="button" onClick={() => setAlternate(value => !value)}>{alternate ? "Original photograph" : "Alternate photograph"} ↗</button>}</div>
          <div className="dialog-copy" aria-live="polite"><p className="eyebrow">{project.category}</p><h2 id="project-title">{project.detail}</h2><p>{project.copy}</p><a href="/request-a-quote/" className="button">Create something personal ↗</a><div className="dialog-pagination"><button type="button" onClick={() => move(-1)} aria-label="Previous project">←</button><span>Explore the work</span><button type="button" onClick={() => move(1)} aria-label="Next project">→</button></div></div>
        </div>
      </div>}
    </dialog>
  </div>;
}
