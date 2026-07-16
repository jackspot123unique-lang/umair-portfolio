import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  async rewrites() {
    // The public homepage is the original supplied HTML, retained byte-for-byte in its visual structure.
    return { beforeFiles: [{ source: "/", destination: "/portfolio-ui.html" }] };
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        // unsafe-inline is retained only because the user-supplied single HTML has inline CSS/JS and event handlers.
        { key: "Content-Security-Policy", value: "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; connect-src 'self' https://*.r2.cloudflarestorage.com; frame-src 'self' https:; base-uri 'self'; form-action 'self'" }
      ]
    }];
  }
};
export default config;
