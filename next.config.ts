import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "axwwgrkdco.cloudimg.io",
      },
      {
        protocol: "https",
        hostname: "montia.es",
      },
      {
        protocol: "https",
        hostname: "www.restaurantelienzo.com",
      },
    ],
  },
};

export default nextConfig;
