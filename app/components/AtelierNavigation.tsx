"use client";

/* eslint-disable @next/next/no-html-link-for-pages */
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

const links = [
  ["The services", "/#services"], ["Selected work", "/portfolio/"],
  ["Our story", "/about/"], ["The process", "/process/"], ["Questions & answers", "/faq/"],
];
const serviceLinks = [
  ["Bible rebinding & restoration", "/bible-rebinding/"],
  ["Hand-bound journals", "/hand-bound-notebooks/"],
  ["Personalization & finishes", "/customizations/"],
  ["Custom work & note pad holders", "/custom-work/"],
  ["Book restoration", "/book-restoration/"],
  ["Custom leather Bibles", "/custom-leather-bibles/"],
];

export default function AtelierNavigation() {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  const close = () => { if (menu.current) menu.current.open = false; };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menu.current?.open) {
        close();
        menu.current?.querySelector("summary")?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !menu.current?.contains(event.target)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", outside);
    };
  }, []);
  return <header className="site-header atelier-header">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <div className="header-inner">
      <a href="/" className="brand" aria-label="Logos Custom Bindings home">
        <Image src="/lcb-circle-logo.png" alt="" width={48} height={48} unoptimized={process.env.NODE_ENV === "development"} className="brand-logo" />
        <span className="brand-text"><strong>Logos</strong><small>Custom Bindings</small></span>
      </a>
      <nav className="desktop-navigation" aria-label="Primary navigation">
        {links.slice(0, 4).map(([label, href]) => <a key={href} href={href} aria-current={pathname?.replace(/\/$/, "") === href.replace(/\/$/, "") ? "page" : undefined}>{label}</a>)}
      </nav>
      <a href="/request-a-quote/" className="header-cta">Request a Quote</a>
      <details ref={menu} className="atelier-menu">
        <summary aria-label="Explore the site"><span className="menu-word">Explore</span><span className="menu-lines" aria-hidden="true"><i /><i /></span></summary>
        <div className="menu-panel">
          <div className="menu-panel-intro"><span className="eyebrow">Logos Custom Bindings</span><p>A book worth keeping.<br /><em>A binding worth making.</em></p></div>
          <nav aria-label="Explore the site" className="menu-main" onClick={close}>
            {links.map(([label, href], index) => <a href={href} key={href}><span>0{index + 1}</span>{label}</a>)}
            <a href="/shop/"><span>06</span>The Etsy collection</a>
          </nav>
          <nav aria-label="Binding services" className="menu-services" onClick={close}>
            <p className="eyebrow">Made around you</p>
            {serviceLinks.map(([label, href]) => <a href={href} key={href}>{label}</a>)}
          </nav>
        </div>
      </details>
    </div>
  </header>;
}
