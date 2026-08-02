import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep pdf-parse / pdfjs / canvas out of the Turbopack bundle (Node runtime).
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "@napi-rs/canvas"],
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
    /**
     * Soft-nav client cache. Default dynamic staleTime is 0 (every click
     * re-fetched). Public ISR + HR dynamic pages reuse the last payload briefly.
     */
    staleTimes: {
      dynamic: 60,
      static: 300,
    },
    serverActions: {
      // Allow 5MB resume + form payload headroom
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
