import { notFound } from "next/navigation";
import { getGallery } from "../../gallery/feed";
import { photoUrl, siteOrigin } from "../../gallery/origins";
import PortfolioGallery from "../../components/PortfolioGallery";
import { Shell } from "../../site";
export const dynamic = "force-dynamic";
async function findProject(slug: string) { return (await getGallery()).projects.find(p => p.slug === slug); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const project = await findProject((await params).slug);
  if (!project) return { title: "Project not found", robots: { index: false, follow: false } };
  const image = project.photos.find(p => p.id === project.coverId)!;
  return { title: project.title, description: project.description.slice(0, 160), alternates: { canonical: `${siteOrigin}/portfolio/${project.slug}/` }, openGraph: { title: project.title, description: project.description.slice(0, 160), url: `${siteOrigin}/portfolio/${project.slug}/`, images: [{ url: photoUrl(project.id, image.id), width: image.width, height: image.height, alt: image.alt }] }, twitter: { card: "summary_large_image", title: project.title, description: project.description.slice(0, 160), images: [photoUrl(project.id, image.id)] } };
}
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = await findProject((await params).slug); if (!project) notFound();
  const url = `${siteOrigin}/portfolio/${project.slug}/`;
  const schema = { "@context": "https://schema.org", "@graph": [{ "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: siteOrigin }, { "@type": "ListItem", position: 2, name: "Portfolio", item: `${siteOrigin}/portfolio/` }, { "@type": "ListItem", position: 3, name: project.title, item: url }] }, ...project.photos.map(photo => ({ "@type": "ImageObject", contentUrl: photoUrl(project.id, photo.id), name: photo.alt, caption: photo.caption || undefined, width: photo.width, height: photo.height }))] };
  return <Shell><main id="main-content" className="project-page"><div className="container"><nav aria-label="Breadcrumb" className="project-breadcrumb"><a href="/">Home</a> / <a href="/portfolio/">Portfolio</a></nav><PortfolioGallery projects={[project]} detail /><div className="quote-strip rule"><div><p className="eyebrow">Something of your own</p><h2>Give your book its next chapter.</h2></div><a className="button" href="/request-a-quote/">Request a Quote ↗</a></div></div></main><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} /></Shell>;
}
