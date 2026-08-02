import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep pdf-parse / pdfjs / canvas out of the Turbopack bundle (Node runtime).
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "@napi-rs/canvas"],
  experimental: {
    serverActions: {
      // Allow 5MB resume + form payload headroom
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
