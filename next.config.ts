import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Allow 5MB resume + form payload headroom
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
