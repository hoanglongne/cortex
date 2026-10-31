import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/links";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/auth", "/profile", "/auth-bridge"] }, sitemap: `${SITE_URL}/sitemap.xml` };
}
