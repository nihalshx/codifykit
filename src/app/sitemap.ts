import type { MetadataRoute } from "next";
import { CASE_STUDIES, SERVICES } from "@/lib/content";
export const dynamic = "force-static";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://codifykit.pages.dev";
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/", "/work/", "/work/apps/", "/work/web/", "/work/posters/", "/work/videos/",
    "/services/", "/students/", "/about/", "/talk/",
    ...SERVICES.map((s) => `/services/${s.slug}/`),
    ...CASE_STUDIES.map((c) => `/work/${c.slug}/`),
  ];
  return paths.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "monthly" }));
}
