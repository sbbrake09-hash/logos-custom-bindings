import PortfolioGallery from "../components/PortfolioGallery";
import { getGallery } from "./feed";
import { homepageProjects } from "./model";
export default async function ServerGallery({ featured = false }: { featured?: boolean }) {
  try { const feed = await getGallery(); return <PortfolioGallery projects={featured ? homepageProjects(feed) : feed.projects} featured={featured} />; }
  catch { return <div className="gallery-unavailable" role="status"><h3>The gallery is taking a moment.</h3><p>We couldn’t load the photographs right now. Please refresh shortly, or <a href="/request-a-quote/">tell us about your project</a>.</p></div>; }
}
