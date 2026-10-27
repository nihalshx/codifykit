import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { KittoCta } from "@/components/ui/KittoCta";
import { WorkCard } from "@/components/pages/WorkCard";
import { T } from "@/components/ui/T";
import { CASE_STUDIES, PLATFORM_TECH, SERVICES, TOOLS, real, serviceBySlug } from "@/lib/content";
import styles from "../services.module.css";
import s2 from "./service.module.css";

const RELATED: Record<string, ("Apps" | "Websites" | "Posters")[]> = {
  "web-app-development": ["Websites", "Apps"],
  "crm-erp": ["Apps", "Websites"],
  "social-media-content": ["Posters"],
  "video-production": ["Posters"],
  "digital-marketing-ads": ["Posters", "Websites"],
  "branding-creative": ["Posters"],
  strategy: ["Websites", "Apps", "Posters"],
};
const TOOL_GROUPS: Record<string, string[]> = {
  "web-app-development": ["Mobile apps", "Web front end", "Backend & data"],
  "crm-erp": ["CRM & ERP", "Backend & data", "Web front end"],
  "social-media-content": ["Design & video", "Ads & marketing"],
  "video-production": ["Design & video"],
  "digital-marketing-ads": ["Ads & marketing", "Design & video"],
  "branding-creative": ["Design & video"],
  strategy: ["Mobile apps", "Web front end", "Backend & data", "CRM & ERP", "Design & video", "Ads & marketing"],
};

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = serviceBySlug((await params).slug);
  return s ? { title: s.name, description: `${s.name}: ${s.short}. From Codifykit, one team for the tech, the creative and the marketing.` } : {};
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const s = serviceBySlug((await params).slug);
  if (!s) notFound();
  const related = CASE_STUDIES.filter((c) => RELATED[s.slug].includes(c.kind)).slice(0, 6);
  const tools = TOOLS.filter((g) => TOOL_GROUPS[s.slug].includes(g.name))
    .map((g) => ({ ...g, items: real(g.items) }))
    .filter((g) => g.items.length);
  const platforms = PLATFORM_TECH.map((p) => ({ ...p, items: real(p.items) }));
  const others = SERVICES.filter((o) => o.slug !== s.slug);

  return (
    <>
      {/* the opening screen: the service on the left, what's included on the right (no empty half) */}
      <section className={`container page-hero ${s2.hero}`}>
        <div>
          <p className="label">Service {s.n}</p>
          <h1 className="h-display">{s.name}</h1>
          <p className="lead">{s.short}.</p>
          <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
            <Link href="/contact/" className="btn btn--violet">Start a project</Link>
            {s.slug === "web-app-development" ? (
              <>
                <Link href="/services/web/" className="btn btn--ghost">Websites →</Link>
                <Link href="/services/apps/" className="btn btn--ghost">Android &amp; iOS apps →</Link>
              </>
            ) : (
              <Link href="/work/" className="btn btn--ghost">See our work</Link>
            )}
          </div>
        </div>
        <div className={s2.includedBox}>
          <h2 className={s2.includedTitle}>What we do for you</h2>
          <ul className={s2.included}>
            {s.includes.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </section>

      {s.slug === "web-app-development" && (
        <section className="container section">
          <p className="label">Platforms</p>
          <h2 className="h2">Android and iOS apps, from one team.</h2>
          <p className="lead" style={{ marginTop: 16 }}>
            We mainly build apps in Flutter, so one codebase runs on both Android and iOS. If your project needs another stack, we can work in that too.
          </p>
          <div className={s2.platforms}>
            {platforms.map((p) => (
              <div key={p.name} className={s2.platform}>
                <h3 className="h3">{p.name}</h3>
                <ul>{p.items.map((i) => <li key={i}><T>{i}</T></li>)}</ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="container section">
          <div className={s2.head}>
            <div>
              <p className="label">Related work</p>
              <h2 className="h2">Things we&apos;ve built.</h2>
            </div>
            <Link href="/work/" className="btn btn--ghost">All work ↗</Link>
          </div>
          <div className={s2.work}>
            {related.map((c) => <WorkCard key={c.slug} item={c} />)}
          </div>
        </section>
      )}

      {tools.length > 0 && (
      <section className="container section">
        <p className="label">Tools &amp; technologies</p>
        <h2 className="h2">What we use for this.</h2>
        <div className={s2.tools}>
          {tools.map((g) => (
            <div key={g.name} className={s2.tool}>
              <span className={s2.toolN}>{g.n}</span>
              <h3>{g.name}</h3>
              <ul>{g.items.map((i) => <li key={i}><T>{i}</T></li>)}</ul>
            </div>
          ))}
        </div>
      </section>
      )}


      <section className="container section">
        <p className="label">Other services</p>
        <div className={styles.grid}>
          {others.map((o) => (
            <Link key={o.slug} href={`/services/${o.slug}/`} className={styles.card}>
              <span className={styles.n}>{o.n}</span>
              <h3 className={styles.name}>{o.name}</h3>
              <p className="muted">{o.short}</p>
            </Link>
          ))}
        </div>
      </section>

      <KittoCta title={`Thinking about ${s.name.replace("&", "and")}?`} />
    </>
  );
}
