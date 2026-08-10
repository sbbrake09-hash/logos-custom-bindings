/* eslint-disable @next/next/no-html-link-for-pages -- the site uses plain crawlable anchors for intentionally simple static navigation. */
import type { Metadata } from "next";
import Image from "next/image";

const BASE_URL = "https://logoscustombindings.com";
const JOTFORM_URL = "https://form.jotform.com/250864020093147?canva-app=1&_height=620";

type Service = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  intro: string;
  bullets: string[];
  sectionTitle: string;
  sectionCopy: string;
  materials: { label: string; title: string; copy: string }[];
};

export const services: Record<string, Service> = {
  "bible-rebinding": {
    slug: "bible-rebinding",
    eyebrow: "The work we are known for",
    title: "Custom Bible rebinding, made to be lived in.",
    description: "Restore a faithful companion with a new leather cover, stronger structure, and details chosen for your story.",
    intro: "A Bible that has been carried, marked, and returned to for years deserves more than a quick repair. Logos Custom Bindings rebuilds worn Bibles with durable materials and a careful respect for the pages already inside.",
    bullets: ["Leather recovering and full rebinding", "Repairs for worn covers, spines, and corners", "Custom colors, linings, ribbons, and imprinting", "Mail-in service available throughout the United States"],
    sectionTitle: "Preserve the pages. Reimagine the binding.",
    sectionCopy: "Every Bible arrives with its own history. We look at the condition of the text block, the original construction, and the way you use it before recommending the right approach. The result is a working Bible that feels personal, balanced, and ready for many more years.",
    materials: [
      { label: "01 / Structure", title: "A stronger spine", copy: "We address the places where everyday use has made the original cover tired, loose, or difficult to handle." },
      { label: "02 / Cover", title: "Leather with character", copy: "Choose from a considered palette of premium leathers and finishes to create a cover that feels like yours." },
      { label: "03 / Detail", title: "A personal mark", copy: "Add ribbons, imprinting, contrasting leather, or other details that make the finished Bible unmistakably personal." },
    ],
  },
  "book-restoration": {
    slug: "book-restoration",
    eyebrow: "For books with a history",
    title: "Book restoration that keeps the story intact.",
    description: "Careful restoration and rebinding for cherished journals, heirlooms, notebooks, and other books that deserve a second life.",
    intro: "Restoration is a conversation between what a book has been and what it still needs to become. We work with the existing pages and character of a piece while improving the protection, usability, and finish.",
    bullets: ["Journal and notebook restoration", "Heirloom and keepsake book repairs", "Custom book covers and replacement bindings", "Material and finish recommendations based on use"],
    sectionTitle: "The right amount of intervention.",
    sectionCopy: "Some books need a new cover. Others need a more involved rebuild. We explain the options clearly so you can decide whether to preserve the original look, introduce a new material, or create something entirely custom.",
    materials: [
      { label: "01 / Assess", title: "Read the wear", copy: "Loose boards, tired corners, cracked leather, and weakened joints each tell us something about the right repair." },
      { label: "02 / Restore", title: "Respect the original", copy: "We protect the parts that make the book meaningful while strengthening the parts that need to work harder." },
      { label: "03 / Finish", title: "Make it yours", copy: "A refined color, monogram, or new cover can give an old favorite a future without erasing its past." },
    ],
  },
  "custom-leather-bibles": {
    slug: "custom-leather-bibles",
    eyebrow: "Made from the beginning",
    title: "Custom leather Bibles with heirloom presence.",
    description: "For a new Bible or a special gift, create a leather cover with the weight, color, and personal details that make it worth keeping.",
    intro: "A custom Bible can be a meaningful gift, a milestone marker, or the beginning of a lifetime of use. Logos brings the same care to new bindings as to restoration work, with a focus on proportion, touch, and long-term durability.",
    bullets: ["Custom-made leather covers", "Personalized imprinting and design details", "Gift-ready work for weddings, graduations, and milestones", "New Bibles and journals also available through Etsy"],
    sectionTitle: "An object with a reason to stay.",
    sectionCopy: "We believe a beautiful Bible should feel good in the hand and become more meaningful with use. Your choices in leather, color, lining, ribbons, and imprinting turn a useful book into a lasting personal object.",
    materials: [
      { label: "01 / Gift", title: "Made for a moment", copy: "Create a thoughtful, enduring gift for a wedding, ordination, graduation, or personal milestone." },
      { label: "02 / Design", title: "Quietly distinctive", copy: "The best custom work does not need to be loud. It needs to feel considered, balanced, and unmistakably yours." },
      { label: "03 / Keep", title: "Built for decades", copy: "Choose a finish that will gain character as it is carried, opened, read, and handed down." },
    ],
  },
  "hand-bound-notebooks": {
    slug: "hand-bound-notebooks",
    eyebrow: "For the blank page",
    title: "Hand-bound notebooks for ideas worth keeping.",
    description: "Beautifully crafted journals, notebooks, and note pads made with premium materials, vibrant colors, and personal details.",
    intro: "A good notebook invites you to return to it. Our hand-bound journals and custom note pads are designed to feel intentional from the first page, with materials and personalization chosen around how you plan to use them.",
    bullets: ["Hand-bound journals and notebooks", "Custom note pad holders", "Leather covers and personalized imprinting", "A wide range of colors and material combinations"],
    sectionTitle: "A blank page, with a little more gravity.",
    sectionCopy: "From a refined writing journal to a distinctive gift, each notebook is built as a small piece of functional craft. Tell us what you want it to hold and we can help shape the cover around it.",
    materials: [
      { label: "01 / Write", title: "Made to be used", copy: "Choose a format and finish that feels right for notes, sketches, planning, reflection, or daily carry." },
      { label: "02 / Color", title: "A palette of possibilities", copy: "Pair premium materials and vibrant colors to create something calm, expressive, or completely unexpected." },
      { label: "03 / Gift", title: "Personal by design", copy: "Add an imprint or custom detail to make a journal feel like it was made for one person alone." },
    ],
  },
  customizations: {
    slug: "customizations",
    eyebrow: "The details make the binding",
    title: "Custom details, chosen with intention.",
    description: "Turn a beautiful binding into your binding with material, color, imprinting, ribbons, and other personalized options.",
    intro: "Customization is not about adding everything. It is about finding the combination of details that makes a piece feel complete. We will help you choose options that suit the book, the way it will be used, and the feeling you want it to carry.",
    bullets: ["Premium leather and color selection", "Imprinting and personalized lettering", "Custom book ribbons and coordinating details", "Note pad holders and other growing capabilities"],
    sectionTitle: "Start with the feeling you want.",
    sectionCopy: "Tell us whether you are after understated, traditional, colorful, rugged, or quietly luxurious. We can translate that direction into a thoughtful set of materials and details.",
    materials: [
      { label: "01 / Materials", title: "Leather and lining", copy: "Select a tactile cover and interior combination that complements the book and the life it will have." },
      { label: "02 / Personal", title: "Imprint and mark", copy: "Add a name, initials, title, emblem, or other meaningful detail to the cover." },
      { label: "03 / Finish", title: "Ribbons and accents", copy: "Small decisions—ribbons, contrast, edge details—bring the whole piece into focus." },
    ],
  },
};

export const siteRoutes: Record<string, string> = {
  "bible-rebinding": "service",
  "book-restoration": "service",
  "custom-leather-bibles": "service",
  "hand-bound-notebooks": "service",
  customizations: "service",
  portfolio: "portfolio",
  process: "process",
  about: "about",
  faq: "faq",
  "request-a-quote": "quote",
  shop: "shop",
};

function absolute(path: string) {
  return `${BASE_URL}${path}`;
}

function JsonLd({ data }: { data: object | object[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

function OrganizationSchema() {
  return (
    <JsonLd data={{
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "Organization", "@id": `${BASE_URL}/#organization`, name: "Logos Custom Bindings", url: BASE_URL, logo: absolute("/lcb-circle-logo.png"), sameAs: ["https://www.etsy.com/", "https://www.instagram.com/"] },
        { "@type": "WebSite", "@id": `${BASE_URL}/#website`, url: BASE_URL, name: "Logos Custom Bindings", publisher: { "@id": `${BASE_URL}/#organization` } },
      ],
    }} />
  );
}

function Breadcrumbs({ current }: { current: string }) {
  return <div className="breadcrumb"><a href="/">Home</a><span> &nbsp;/&nbsp; </span>{current}</div>;
}

function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a href="/" className="brand" aria-label="Logos Custom Bindings home">
          <Image src="/lcb-circle-logo.png" alt="" width={44} height={44} className="brand-logo" />
          <span className="brand-text"><strong>Logos</strong><small>Custom Bindings</small></span>
        </a>
        <nav className="nav" aria-label="Primary navigation">
          <a href="/bible-rebinding/">Bible Rebinding</a>
          <a href="/services">Services</a>
          <a href="/portfolio/">Portfolio</a>
          <a href="/about/">Our Story</a>
          <a href="/faq/">FAQ</a>
        </nav>
        <span className="menu-note">Nationwide mail-in</span>
        <a href="/request-a-quote/" className="header-cta">Request a Quote <span aria-hidden="true">↗</span></a>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-main">
        <div>
          <a href="/" className="brand" aria-label="Logos Custom Bindings home"><Image src="/lcb-circle-logo.png" alt="" width={44} height={44} className="brand-logo" /><span className="brand-text"><strong>Logos</strong><small>Custom Bindings</small></span></a>
          <p>Custom Bible rebinding, book restoration, and handcrafted notebooks made with care and shipped throughout the United States.</p>
        </div>
        <div><h4>Explore</h4><div className="footer-links"><a href="/bible-rebinding/">Bible Rebinding</a><a href="/book-restoration/">Book Restoration</a><a href="/hand-bound-notebooks/">Hand-Bound Notebooks</a><a href="/portfolio/">Portfolio</a></div></div>
        <div><h4>Start here</h4><div className="footer-links"><a href="/request-a-quote/">Request a Quote</a><a href="/process/">How It Works</a><a href="/faq/">Frequently Asked Questions</a><a href="/shop/">Shop on Etsy ↗</a></div></div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} Logos Custom Bindings</span><span>Handcrafted with patience. Built to last.</span></div>
    </footer>
  );
}

function Shell({ children, schema }: { children: React.ReactNode; schema?: React.ReactNode }) {
  return <><Header />{children}{schema}{<Footer />}</>;
}

export function HomePage() {
  return (
    <Shell schema={<OrganizationSchema />}>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Bible rebinding · book restoration · custom journals</p>
            <h1>Crafted to hold what matters.</h1>
            <p className="lead">Custom Bible rebinding and beautifully made books for the stories, ideas, and faith you return to again and again.</p>
            <div className="hero-actions"><a className="button" href="/request-a-quote/">Start your project <span aria-hidden="true">↗</span></a><a className="button secondary" href="/portfolio/">View past work</a></div>
            <div className="hero-note"><i /> <span>Nationwide mail-in craftsmanship · Led by Johnny</span></div>
          </div>
          <div className="hero-visual" role="img" aria-label="A treasured book on a warm leather surface"><div className="hero-stamp"><span>Made for<br />many more<br />chapters</span></div></div>
        </section>

        <section className="section"><div className="container intro"><div className="intro-copy"><p className="eyebrow">A better kind of repair</p><h2>Keep the pages. Renew the feeling.</h2><p>That Bible on your shelf carries your story—the notes in the margins, the underlined verses, the worn spine from years of use. Logos Custom Bindings gives those pages a new life without erasing what they mean.</p></div><div className="intro-list"><article><span className="index">01</span><div><h3>Bible rebinding</h3><p>Custom leather covers, careful restoration, and a stronger structure for your most trusted book.</p></div></article><article><span className="index">02</span><div><h3>Book restoration</h3><p>Respectful repairs for journals, heirlooms, notebooks, and books that have earned their wear.</p></div></article><article><span className="index">03</span><div><h3>Personal details</h3><p>Choose leather, color, imprinting, ribbons, and the finishing touches that make it yours.</p></div></article></div></div></section>

        <section className="section maroon-band"><div className="container"><div className="section-header"><div><p className="eyebrow">The studio offering</p><h2>Work made for a lifetime of use.</h2></div><p>Every project is considered individually, from the first look at the pages to the final detail on the cover.</p></div><div className="service-grid"><a className="service-card" href="/bible-rebinding/"><span className="card-number">01</span><div><h3>Custom Bible Rebinding</h3><p>Restore your faithful companion with leather, structure, and details chosen around your story.</p></div><span className="service-link">Explore the work ↗</span></a><a className="service-card" href="/book-restoration/"><span className="card-number">02</span><div><h3>Book & Journal Restoration</h3><p>Give worn journals and heirlooms the protection they need for the next chapter.</p></div><span className="service-link">Explore the work ↗</span></a><a className="service-card" href="/hand-bound-notebooks/"><span className="card-number">03</span><div><h3>Hand-Bound Notebooks</h3><p>Beautiful blank pages, premium materials, and personalization made for gifting or keeping.</p></div><span className="service-link">Explore the work ↗</span></a></div></div></section>

        <section className="section"><div className="container"><div className="section-header"><div><p className="eyebrow">Selected work</p><h2>Made one piece at a time.</h2></div><a href="/portfolio/" className="button secondary">See the portfolio ↗</a></div><div className="portfolio-grid"><a className="project large one" href="/portfolio/"><div className="project-label"><strong>Rebound in character</strong><span>Custom Bible rebinding</span></div></a><a className="project two" href="/portfolio/"><div className="project-label"><strong>For the daily page</strong><span>Hand-bound journal</span></div></a><a className="project three" href="/portfolio/"><div className="project-label"><strong>A treasured return</strong><span>Book restoration</span></div></a></div></div></section>

        <section className="section compact" style={{ background: "#ede5da" }}><div className="container quote-strip"><div><p className="eyebrow">Your book has a next chapter</p><h2>Tell us what you want to keep—and what you want to change.</h2><p>Share a few details and photos. We will help you find the right approach for your project.</p></div><a href="/request-a-quote/" className="button">Request a Quote <span aria-hidden="true">↗</span></a></div></section>
      </main>
    </Shell>
  );
}

function ServiceSchema({ service }: { service: Service }) {
  return <JsonLd data={{ "@context": "https://schema.org", "@type": "Service", name: service.title, description: service.description, provider: { "@type": "Organization", name: "Logos Custom Bindings", url: BASE_URL }, areaServed: "United States", url: absolute(`/${service.slug}/`) }} />;
}

export function ServicePage({ service }: { service: Service }) {
  return <Shell schema={<ServiceSchema service={service} />}><main><section className="page-hero"><div className="container"><Breadcrumbs current={service.title} /><p className="eyebrow">{service.eyebrow}</p><h1>{service.title}</h1><p className="lead">{service.description}</p></div></section><section className="section"><div className="container service-layout"><div className="prose"><h2>{service.sectionTitle}</h2><p>{service.intro}</p><p>{service.sectionCopy}</p><h3>What we can help with</h3><ul>{service.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul><h3>A considered finish</h3><div className="material-grid">{service.materials.map((item) => <div className="material-card" key={item.title}><span>{item.label}</span><h3>{item.title}</h3><p>{item.copy}</p></div>)}</div></div><aside className="service-aside"><p className="eyebrow">Mail-in service</p><h3>Let’s talk about your project.</h3><p>Send a few details about the book, its condition, and the finish you have in mind. We’ll help you understand the next step.</p><a className="button" href="/request-a-quote/">Request a Quote ↗</a><a className="button secondary" href="/process/">See how it works</a></aside></div></section></main></Shell>;
}

function PortfolioPage() {
  const projects = [
    ["Custom Bible rebinding", "A worn cover replaced with a lasting leather binding and personal detail.", "one"],
    ["Hand-bound journal", "A colorful, tactile writing companion made for everyday return.", "two"],
    ["Journal restoration", "A well-loved notebook renewed without losing its familiar character.", "three"],
    ["Personalized details", "Imprinting, ribbons, contrast, and the little decisions that finish a piece.", "one"],
  ];
  return <Shell><main><section className="page-hero"><div className="container"><Breadcrumbs current="Portfolio" /><p className="eyebrow">Past work</p><h1>Objects made to become part of the story.</h1><p className="lead">A selection of custom Bible rebinding, restored journals, and handcrafted notebooks. More than a gallery, these are examples of what careful work can make possible.</p></div></section><section className="section"><div className="container"><div className="portfolio-grid">{projects.map(([title, copy, image], index) => <article className={`project ${image} ${index === 0 ? "large" : ""}`} key={title}><div className="project-label"><strong>{title}</strong><span>{copy}</span></div></article>)}</div><div className="quote-strip rule"><div><p className="eyebrow">Your project will be different</p><h2>Bring us the idea, the heirloom, or the worn favorite.</h2></div><a className="button" href="/request-a-quote/">Start a conversation ↗</a></div></div></section></main></Shell>;
}

function ProcessPage() {
  const steps = [["01", "Tell us about it", "Use the quote form to share the book, its condition, what you want to change, and any details that matter to you."], ["02", "Choose the direction", "We review the project and talk through materials, personalization, shipping, timing, and the right level of restoration."], ["03", "Send it safely", "Once the project is agreed, we will share clear instructions for mailing your Bible, journal, or book to the workshop."], ["04", "Receive the next chapter", "Your finished piece returns ready to be carried, opened, written in, and used for many years to come."]];
  return <Shell><main><section className="page-hero"><div className="container"><Breadcrumbs current="Process" /><p className="eyebrow">How it works</p><h1>A clear path from worn to wonderful.</h1><p className="lead">We make the process personal, practical, and easy to understand—even when the project itself is one of a kind.</p></div></section><section className="section"><div className="container"><div className="process-grid">{steps.map(([number, title, copy]) => <article className="process-step" key={number}><span className="step-num">{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section><section className="section" style={{ background: "#ede5da" }}><div className="container intro"><div className="intro-copy"><p className="eyebrow">Before you send it</p><h2>What helps us give you a thoughtful answer.</h2></div><div className="intro-list"><article><span className="index">01</span><div><h3>Tell us how you use it</h3><p>Daily carry, study, gifting, family history, or a special occasion all point toward different choices.</p></div></article><article><span className="index">02</span><div><h3>Share the condition</h3><p>Photos of the cover, spine, corners, and pages help us understand the starting point.</p></div></article><article><span className="index">03</span><div><h3>Name the feeling</h3><p>Traditional, understated, expressive, rugged, or refined—your direction helps shape the material palette.</p></div></article></div></div></section></main></Shell>;
}

function AboutPage() {
  return <Shell schema={<OrganizationSchema />}><main><section className="page-hero"><div className="container"><Breadcrumbs current="Our Story" /><p className="eyebrow">The hands behind the work</p><h1>Good work starts with paying attention.</h1><p className="lead">Led by Johnny, Logos Custom Bindings creates personalized, hand-crafted covers and bindings for Bibles, journals, notebooks, and the books people are not ready to let go of.</p></div></section><section className="section"><div className="container intro"><div className="intro-copy"><p className="eyebrow">Why Logos</p><h2>Craft is how we make care visible.</h2></div><div className="prose"><p>A Bible is not just paper and leather. A journal is not just a stack of pages. The things we return to collect meaning through use, and a good binding should respect both the object and the person who carries it.</p><p>At Logos Custom Bindings, we combine a practical understanding of structure with an eye for beautiful materials and personal details. The goal is not to make every piece the same. It is to make each one feel right.</p><p>Our capabilities continue to grow, from custom Bible rebinding and restoration to hand-bound journals, note pad holders, and other thoughtful objects made for daily life.</p></div></div></section><section className="section maroon-band"><div className="container quote-strip"><div><p className="eyebrow">Made with patience</p><h2>Bring something meaningful. We’ll help you give it a future.</h2></div><a className="button secondary" style={{ borderColor: "#f2d5a9", color: "#fff5e8" }} href="/request-a-quote/">Request a Quote ↗</a></div></section></main></Shell>;
}

function FaqPage() {
  const questions = [["What does Bible rebinding include?", "Depending on the Bible and its condition, rebinding can include replacing the cover, strengthening the structure, repairing worn areas, adding new leather, and selecting personal details such as ribbons or imprinting."], ["Can a damaged Bible be rebound?", "Often, yes. The best next step depends on the condition of the text block, pages, spine, and cover. Photos help us understand what is possible before you send it."], ["What materials are available?", "We work with a range of premium leathers, colors, linings, ribbons, and personalization options. We will recommend combinations based on how you want the finished piece to feel and function."], ["How does mail-in rebinding work?", "Tell us about the project first. Once we understand the work, we will explain the next steps and provide safe mailing instructions for sending your Bible, journal, or book to the workshop."], ["How much does custom Bible rebinding cost?", "Projects are quoted individually because condition, size, materials, and customization all affect the work. The quote form is the fastest way to receive a thoughtful estimate."], ["How long does a project take?", "Timing depends on the type of work, the current queue, materials, and the condition of the book. We will discuss the expected timeline before the project begins."], ["Does Logos provide the Bible or notebook?", "We can work with a book you send us, and we also carry a selection of new Bibles and journals through our Etsy shop."], ["What makes Logos different from a standard repair shop?", "We approach each piece as both a functional book and a meaningful object, combining practical restoration with custom materials, personal details, and a finish designed to last."]];
  return <Shell schema={<JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: questions.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) }} />}><main><section className="page-hero"><div className="container"><Breadcrumbs current="FAQ" /><p className="eyebrow">Helpful answers</p><h1>Before you send your book.</h1><p className="lead">A few of the questions we hear most often about rebinding, restoration, materials, shipping, and custom work.</p></div></section><section className="section"><div className="container"><div className="faq-grid">{questions.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></div></section></main></Shell>;
}

function QuotePage() {
  return <Shell><main className="quote-page"><section className="page-hero"><div className="container"><Breadcrumbs current="Request a Quote" /><p className="eyebrow">Start your project</p><h1>Let’s make a plan for the book you love.</h1><p className="lead">Tell us what you are starting with, what you want to change, and the feeling you want the finished piece to have. We serve customers nationwide by mail.</p></div></section><section className="section"><div className="container quote-shell"><div className="quote-intro"><p className="eyebrow">A little context helps</p><h2>Bring the details. We’ll bring the craft.</h2><p>For the most useful first response, have these details nearby:</p><ul><li>What kind of book or Bible is it?</li><li>What condition is the cover and spine in?</li><li>What materials or colors are you drawn to?</li><li>Do you want imprinting, ribbons, or other details?</li><li>When do you hope to have it back?</li></ul><p>After you submit, we may follow up for photos or a few additional measurements.</p></div><div className="form-card"><p className="eyebrow">Project intake</p><h2>Tell us about your book.</h2><p>The form below connects to the existing Logos contact workflow. Include as much detail as you can in the message field.</p><iframe className="jotform" title="Logos Custom Bindings project quote form" src={JOTFORM_URL} loading="lazy" /> <p className="form-fallback">Prefer a direct link? <a href="https://form.jotform.com/250864020093147" target="_blank" rel="noreferrer">Open the quote form in a new window ↗</a></p></div></div></section></main></Shell>;
}

function ShopPage() {
  return <Shell><main><section className="page-hero"><div className="container"><Breadcrumbs current="Shop" /><p className="eyebrow">Ready-made pieces</p><h1>Find a finished piece, or start something custom.</h1><p className="lead">Our custom work begins here, but Logos also carries a selection of brand-new Bibles and journals through Etsy.</p></div></section><section className="section"><div className="container intro"><div className="intro-copy"><p className="eyebrow">The Etsy collection</p><h2>Thoughtful objects, ready to find their person.</h2><p>Explore available Bibles, journals, and other crafted pieces in the Logos shop. For a one-of-a-kind request, return here and start a quote.</p><a className="button" href="https://www.etsy.com/" target="_blank" rel="noreferrer">Visit the Etsy shop ↗</a></div><div className="intro-list"><article><span className="index">01</span><div><h3>Ready to buy</h3><p>Browse current pieces and gifts without waiting for a custom project timeline.</p></div></article><article><span className="index">02</span><div><h3>Made with the same care</h3><p>New Bibles and journals carry the same attention to material, touch, and finish.</p></div></article><article><span className="index">03</span><div><h3>Want something different?</h3><p>Tell us what you have in mind and we will help you explore a custom path.</p></div></article></div></div></section></main></Shell>;
}

export function RoutePage({ route }: { route: string }) {
  if (route in services) return <ServicePage service={services[route]} />;
  if (route === "portfolio") return <PortfolioPage />;
  if (route === "process") return <ProcessPage />;
  if (route === "about") return <AboutPage />;
  if (route === "faq") return <FaqPage />;
  if (route === "request-a-quote") return <QuotePage />;
  if (route === "shop") return <ShopPage />;
  return null;
}

export function generateRouteMetadata(route: string): Metadata {
  const service = services[route];
  const titles: Record<string, [string, string]> = {
    portfolio: ["Custom Bible Rebinding & Book Restoration Portfolio", "Explore Logos Custom Bindings projects, from restored Bibles and journals to handcrafted notebooks and personalized covers."],
    process: ["How Bible Rebinding and Book Restoration Works", "See how Logos Custom Bindings handles nationwide mail-in Bible rebinding, book restoration, materials, quotes, and returns."],
    about: ["About Logos Custom Bindings", "Meet the craft and care behind Logos Custom Bindings, led by Johnny and focused on meaningful books made to last."],
    faq: ["Bible Rebinding and Book Restoration FAQ", "Answers about Bible rebinding, book restoration, leather covers, custom materials, shipping, pricing, and turnaround."],
    "request-a-quote": ["Request a Custom Bible Rebinding Quote", "Tell Logos Custom Bindings about your Bible, journal, notebook, or book restoration project. Nationwide mail-in service available."],
    shop: ["Shop New Bibles and Handcrafted Journals", "Browse ready-made Bibles and journals from Logos Custom Bindings on Etsy, or request a custom project."],
  };
  const [title, description] = service
    ? [service.title, service.description]
    : titles[route] ?? ["Logos Custom Bindings", "Custom Bible rebinding, book restoration, and handcrafted notebooks made with care."];
  return { title, description, alternates: { canonical: absolute(`/${route}/`) }, openGraph: { title, description, url: absolute(`/${route}/`), type: "website" } };
}
