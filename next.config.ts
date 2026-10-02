import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prefer React strict mode for correctness
  reactStrictMode: true,

  // CDN-friendly static asset headers (Vercel edge)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, immutable",
          },
        ],
      },
      {
        // Hashed Next static assets — long cache
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Reduce accidental large body issues on AI route
  experimental: {
    // keep defaults; placeholder for future serverActions body size if needed
  },
};

export default nextConfig;
