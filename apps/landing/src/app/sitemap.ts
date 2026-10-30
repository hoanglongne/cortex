import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/links";

const PAGES = ["", "/hoc-vien", "/chung-chi", "/giao-vien", "/trung-tam", "/dang-nghi-toi", "/thi-diem"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((p) => ({ url: `${SITE_URL}${p}` }));
}
