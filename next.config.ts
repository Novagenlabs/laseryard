import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    // The design brief form is a static file (public/design/index.html);
    // next start does not resolve directory indexes, so /design needs the map.
    return [{ source: "/design", destination: "/design/index.html" }];
  },
  async redirects() {
    return [
      {
        source: "/metabusinesscard",
        destination: "/unforgettable",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
