import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
