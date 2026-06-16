import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
let apiHostname = "localhost";
try {
  apiHostname = new URL(apiUrl).hostname;
} catch {
  // keep default
}

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost", port: "8000" },
      { protocol: "https", hostname: apiHostname },
      { protocol: "http", hostname: apiHostname },
    ],
  },
};

export default nextConfig;
