import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
