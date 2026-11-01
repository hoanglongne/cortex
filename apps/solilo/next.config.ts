import type { NextConfig } from "next";

/**
 * Solilo was folded into Oratio (issue #89): everything useful (the Part 2 cue
 * cards, the guided self-rating) is in Oratio's solo practice. Every address
 * here goes to Oratio when NEXT_PUBLIC_ORATIO_URL is set. The source stays in
 * the repository (branch history) until the project can be removed.
 */
function oratioUrl(): string | null {
  const v = process.env.NEXT_PUBLIC_ORATIO_URL?.trim().replace(/\/+$/, "");
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

const nextConfig: NextConfig = {
  async redirects() {
    const to = oratioUrl();
    return to ? [{ source: "/:path*", destination: to, permanent: false }] : [];
  },
};

export default nextConfig;
