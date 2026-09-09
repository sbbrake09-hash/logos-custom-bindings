"use client";

import { useEffect } from "react";

/** Content stays visible without JS. Only offscreen elements opt into reveals. */
export default function AtelierMotion() {
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const elements = Array.from(document.querySelectorAll<HTMLElement>(
      ".section-header, .intro-copy, .intro-list article, .service-card, .review-card, .reviews-heading, .process-step, .material-card, .story-quote, .story-copy > p, .service-aside, .quote-intro, .form-card, .gallery-card, .quote-strip"
    ));
    let observer: IntersectionObserver | undefined;
    const showAll = () => elements.forEach(element => element.classList.remove("reveal-pending"));
    const configure = () => {
      observer?.disconnect();
      showAll();
      if (preference.matches || !("IntersectionObserver" in window)) return;
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.remove("reveal-pending");
          observer?.unobserve(entry.target);
        });
      }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });
      elements.forEach((element, index) => {
        element.classList.add("reveal-element");
        element.style.setProperty("--reveal-delay", `${index % 3 * 55}ms`);
        if (element.getBoundingClientRect().top > window.innerHeight + 24) {
          element.classList.add("reveal-pending");
          observer?.observe(element);
        }
      });
    };
    const showFocused = (event: FocusEvent) => {
      if (event.target instanceof Element) {
        event.target.closest(".reveal-pending")?.classList.remove("reveal-pending");
      }
    };
    configure();
    preference.addEventListener("change", configure);
    document.addEventListener("focusin", showFocused);
    const onPageShow = (event: PageTransitionEvent) => { if (event.persisted) showAll(); };
    window.addEventListener("pageshow", onPageShow);
    return () => {
      observer?.disconnect();
      showAll();
      preference.removeEventListener("change", configure);
      document.removeEventListener("focusin", showFocused);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);
  return null;
}
