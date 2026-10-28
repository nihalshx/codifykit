import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { KittoCta } from "@/components/ui/KittoCta";
import { WorkCard } from "@/components/pages/WorkCard";
import { Crumbs } from "@/components/ui/Crumbs";
import { Faq } from "@/components/ui/Faq";
import { ServiceSwitch } from "@/components/ui/ServiceSwitch";
import { T } from "@/components/ui/T";
import { CASE_STUDIES, DETAIL_SERVICES, FAQ, TOOLS, real, serviceBySlug } from "@/lib/content";
import s2 from "./service.module.css";

// the kind of past work that shows this service best, and the filter on /work that lists it
const RELATED: Record<string, { kinds: ("Apps" | "Websites" | "Posters")[]; filter: string }> = {
  "crm-erp": { kinds: ["Apps", "Websites"], filter: "Apps" },
  "digital-marketing-ads": { kinds: ["Posters"], filter: "Posters" },
  strategy: { kinds: ["Websites", "Apps", "Posters"], filter: "" },
};
const TOOL_GROUPS: Record<string, string[]> = {
  "crm-erp": ["CRM & ERP", "Backend & data", "Web front end"],
  "digital-marketing-ads": ["Ads & marketing", "Design & video"],
  strategy: ["Mobile apps", "Web front end", "Backend & data", "CRM & ERP", "Design & video", "Ads & marketing"],
};

export function generateStaticParams() {
  return DETAIL_SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = serviceBySlug((await params).slug);
  return s ? { title: s.name, description: `${s.name}: ${s.short}. From Codifykit, one team for the tech, the creative and the marketing.` } : {};
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const s = serviceBySlug((await params).slug);
  if (!s) notFound();
  const rel = RELATED[s.slug];
  // one of each kind first, so a mixed list doesn't open on three of the same
  const pool = rel.kinds.map((k) => CASE_STUDIES.filter((c) => c.kind === k));
  const related = Array.from({ length: 3 }, (_, i) => pool[i % pool.length][Math.floor(i / pool.length)]).filter(Boolean);
  const tools = TOOLS.filter((g) => TOOL_GROUPS[s.slug].includes(g.name))
    .map((g) => ({ ...g, items: real(g.items) }))
    .filter((g) => g.items.length);
  const start = `/contact/?need=${encodeURIComponent(s.need)}`;

  return (
    <>
      {/* the opening screen: the service on the left, what's included on the right */}
      <section className={`container page-hero ${s2.hero}`}>
        <div>
          <Crumbs trail={[{ href: "/services/", label: "Services" }, { label: s.name }]} />
          <h1 className="h-display">{s.name}</h1>
          <p className="lead">{s.short}.</p>
          <div className={s2.btns}>
            <Link href={start} className="btn btn--violet">Start a project</Link>
            <Link href="/talk/" className="btn btn--ghost">Ask Kitto first</Link>
          </div>
          {s.slug === "strategy" && (
            <p className={s2.aside}>Here for a college project? <Link href="/students/">See student project help →</Link></p>
          )}
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

      {related.length > 0 && (
        <section className="container section">
          <div className={s2.head}>
            <div>
              <p className="label">Our work</p>
              <h2 className="h2">Things we&apos;ve built.</h2>
            </div>
            <Link href={rel.filter ? `/work/?filter=${rel.filter}` : "/work/"} className="btn btn--ghost">See more work →</Link>
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
                <h3>{g.name}</h3>
                <ul>{g.items.map((i) => <li key={i}><T>{i}</T></li>)}</ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <Faq items={[...s.faq, ...FAQ.slice(0, 3)]} />
      <ServiceSwitch current={s.slug} />
      <KittoCta title={`Thinking about ${s.name.replace(/&/g, "and")}?`} />
    </>
  );
}
