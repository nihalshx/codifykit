import type { MetadataRoute } from "next";
import { CASE_STUDIES, SERVICES, serviceHref } from "@/lib/content";
import { SITE_URL } from "@/lib/site-url";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/", "/work/", "/work/apps/", "/work/web/", "/contact/", "/work/posters/", "/work/videos/",
    "/services/", "/students/", "/about/", "/talk/",
    ...SERVICES.map(serviceHref),
    ...CASE_STUDIES.map((c) => `/work/${c.slug}/`),
  ];
  return paths.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "monthly" }));
}
