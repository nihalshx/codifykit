import type { MetadataRoute } from "next";
import { CASE_STUDIES, SERVICES } from "@/lib/content";
import { SITE_URL } from "@/lib/site-url";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/", "/work/", "/work/apps/", "/work/web/", "/services/web/", "/services/apps/", "/contact/", "/work/posters/", "/work/videos/",
    "/services/", "/students/", "/about/", "/talk/",
    ...SERVICES.map((s) => `/services/${s.slug}/`),
    ...CASE_STUDIES.map((c) => `/work/${c.slug}/`),
  ];
  return paths.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "monthly" }));
}
