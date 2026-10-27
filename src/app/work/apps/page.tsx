import type { Metadata } from "next";
import Link from "next/link";
import { AppsShowcase } from "./AppsShowcase";
import { T } from "@/components/ui/T";
import { APPS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Apps we built",
  description: "Android and iOS apps by Codifykit, shown on real phones in 3D. Designed to be used, not just looked at.",
};

export default function AppsPage() {
  return (
    <>
      <AppsShowcase />
      {/* plain list for screen readers, search engines and no-WebGL browsers */}
      <section className="container section" aria-labelledby="apps-list">
        <h2 id="apps-list" className="h2">All app projects</h2>
        <ul style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 20, listStyle: "none", padding: 0 }}>
          {APPS.map((a) => (
            <li key={a.slug}>
              <Link href={`/work/${a.slug}/`} style={{ textDecoration: "none" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.screens[0]} alt="" loading="lazy" style={{ borderRadius: 22, width: "100%", aspectRatio: "9 / 19.5", objectFit: "cover", objectPosition: "top" }} />
                <span style={{ display: "block", marginTop: 8 }}><T>{a.title}</T></span>
                <span className="muted" style={{ fontSize: 13 }}>{a.platforms.join(" + ")}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
