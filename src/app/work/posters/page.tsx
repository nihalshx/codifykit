import type { Metadata } from "next";
import { PosterShowcase } from "./PosterShowcase";
import { T } from "@/components/ui/T";
import { CAMPAIGNS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Posters & creatives",
  description: "Codifykit's posters, product creatives and campaigns in a 3D showcase.",
};

export default function PostersPage() {
  return (
    <>
      <PosterShowcase />
      <section className="container section" aria-labelledby="poster-list">
        <h2 id="poster-list" className="h2">All poster campaigns</h2>
        <ul style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 20, listStyle: "none", padding: 0 }}>
          {CAMPAIGNS.map((c) => (
            <li key={c.slug}>
              <a href={`/work/${c.slug}/`} style={{ textDecoration: "none" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.posters[0]} alt={`${c.type} poster`} loading="lazy" style={{ borderRadius: 10, width: "100%" }} />
                <span style={{ display: "block", marginTop: 8 }}><T>{c.title}</T></span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
