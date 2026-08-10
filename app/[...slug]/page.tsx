import { notFound } from "next/navigation";
import { generateRouteMetadata, RoutePage, siteRoutes } from "../site";

export function generateStaticParams() {
  return Object.keys(siteRoutes)
    .filter((slug) => slug !== "home")
    .map((slug) => ({ slug: slug.split("/") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  return generateRouteMetadata(slug.join("/"));
}

export default async function NestedPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const route = slug.join("/");
  if (!siteRoutes[route]) notFound();
  return <RoutePage route={route} />;
}
