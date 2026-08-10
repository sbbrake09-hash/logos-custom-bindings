import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  typescript: { ignoreBuildErrors: true },
  async redirects() {
    return [
      { source: "/services", destination: "/", permanent: true },
      { source: "/services/", destination: "/", permanent: true },
      { source: "/pastwork", destination: "/portfolio/", permanent: true },
      { source: "/pastwork/", destination: "/portfolio/", permanent: true },
      { source: "/past-works", destination: "/portfolio/", permanent: true },
      { source: "/past-works/", destination: "/portfolio/", permanent: true },
    ];
  },
};

export default nextConfig;
