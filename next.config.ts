import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.redd.it" },
      { protocol: "https", hostname: "preview.redd.it" },
      { protocol: "https", hostname: "b.thumbs.redditmedia.com" },
    ],
  },
  async headers() {
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com https://cdn.userjot.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' blob: data: https://*.reddit.com https://*.redd.it https://images.unsplash.com https://b.thumbs.redditmedia.com https://i.redd.it https://*.stripe.com https://*.userjot.com",
      "connect-src 'self' https://*.reddit.com https://api.openrouter.ai https://api.stripe.com https://www.google-analytics.com https://*.userjot.com",
      "font-src 'self' https://fonts.gstatic.com",
      "frame-src 'self' https://js.stripe.com https://*.userjot.com https://share.descript.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ];

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspDirectives.join("; "),
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
