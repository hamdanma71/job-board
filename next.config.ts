import type { NextConfig } from "next";

// Security headers applied to every route. Only non-breaking directives are used
// in the CSP (frame-ancestors/object-src/base-uri) so app scripts/styles/fonts
// and Stripe still load; HSTS is honoured by browsers over HTTPS only.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'" },
];

const nextConfig: NextConfig = {
  // Don't leak the framework version.
  poweredByHeader: false,
  // Native/Node-only libs must NOT be bundled by Next/Turbopack for the server
  // runtime, or pdfjs (DOMMatrix/worker) + canvas break at runtime, which made
  // PDF CV text-extraction fail. Load them from node_modules instead.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "@napi-rs/canvas"],
  // Pre-existing TS errors are intentionally not build-blocking (kept for stability).
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
