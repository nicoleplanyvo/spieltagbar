import type { NextConfig } from "next";

const securityHeaders = [
  // Verhindert MIME-Type-Sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Verhindert Clickjacking (Iframe-Einbettung)
  { key: "X-Frame-Options", value: "DENY" },
  // XSS-Schutz (Legacy-Browser)
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Referrer Policy — schuetzt sensible URLs
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Permissions Policy — deaktiviert unnoetige Browser-APIs
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), payment=(self)",
  },
  // HSTS — erzwingt HTTPS (2 Jahre, inkl. Subdomains)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://tmssl.akamaized.net https://*.stripe.com",
      "connect-src 'self' https://api.stripe.com https://api.football-data.org",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // output: "standalone" — wird fuer Plesk-Deployment aktiviert (siehe deploy.sh)
  // Im lokalen Dev nicht noetig
  output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tmssl.akamaized.net",
        pathname: "/images/wappen/**",
      },
    ],
  },
  async headers() {
    return [
      {
        // Alle Routen
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
