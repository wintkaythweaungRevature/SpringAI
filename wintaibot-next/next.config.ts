import type { NextConfig } from "next";

const apiTarget =
  process.env.NEXT_PUBLIC_USE_LOCAL_API === "true"
    ? "http://localhost:8080"
    : "https://api.wintaibot.com";

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  // Mobile-first: optimize images, enable compression
  images: { formats: ['image/avif', 'image/webp'] },
  compress: true,
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${apiTarget}/api/:path*` },
      { source: "/ai/:path*", destination: `${apiTarget}/ai/:path*` },
    ];
  },
};

export default nextConfig;
