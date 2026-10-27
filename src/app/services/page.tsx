import type { Metadata } from "next";
import Link from "next/link";
import { Process } from "@/components/sections/Process";
import { KittoCta } from "@/components/ui/KittoCta";
import { Reveal } from "@/components/ui/Reveal";
import { SERVICES } from "@/lib/content";
import styles from "./services.module.css";

export const metadata: Metadata = {
  title: "Services",
  description: "Websites, Android and iOS apps, custom CRM & ERP, social media, AI and organic video, Meta and ChatGPT ads, branding and student project guidance. One team, the whole job.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="container page-hero">
        <p className="label">Services</p>
        <h1 className="h-display">One team, the whole job.</h1>
        <p className="lead">
          Your website, app, systems, ads and content, planned together so they work together. No juggling five different vendors.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
          <Link href="/services/web/" className="btn btn--ghost">Web development →</Link>
          <Link href="/services/apps/" className="btn btn--ghost">App development →</Link>
          <Link href="/contact/" className="btn btn--violet">Start a project</Link>
        </div>
      </section>
      <section className="container">
        <div className={styles.grid}>
          {SERVICES.map((s, i) => (
            <Reveal key={s.slug} delay={(i % 3) * 80}>
              <Link href={`/services/${s.slug}/`} className={styles.card}>
                <span className={styles.n}>{s.n}</span>
                <h2 className={styles.name}>{s.name}</h2>
                <p className="muted">{s.short}</p>
                <ul>
                  {s.includes.map((x) => <li key={x}>{x}</li>)}
                </ul>
                <span className={styles.more}>Learn more →</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      <Process />
      <KittoCta />
    </>
  );
}
