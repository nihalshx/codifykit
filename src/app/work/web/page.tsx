import type { Metadata } from "next";
import { WebShowcase } from "./WebShowcase";
import { T } from "@/components/ui/T";
import { WEB_PROJECTS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Websites we built",
  description: "Codifykit's website projects in a 3D showcase: business sites, landing pages, portfolios and dashboards.",
};

export default function WebPage() {
  return (
    <>
      <WebShowcase />
      {/* plain list for screen readers, search engines and no-WebGL browsers */}
      <section className="container section" aria-labelledby="web-list">
        <h2 id="web-list" className="h2">All website projects</h2>
        <ul style={{ marginTop: 24, paddingLeft: 18, display: "grid", gap: 8 }}>
          {WEB_PROJECTS.map((p) => (
            <li key={p.slug}>
              <a href={`/work/${p.slug}/`}><T>{p.title}</T></a> · {p.type} · <T>{p.oneLine}</T>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
