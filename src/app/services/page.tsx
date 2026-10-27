import type { Metadata } from "next";
import Link from "next/link";
import { Process } from "@/components/sections/Process";
import { Faq } from "@/components/ui/Faq";
import { KittoCta } from "@/components/ui/KittoCta";
import { Reveal } from "@/components/ui/Reveal";
import { Crumbs } from "@/components/ui/Crumbs";
import { FAQ, SERVICES, serviceHref } from "@/lib/content";
import styles from "./services.module.css";

export const metadata: Metadata = {
  title: "Services",
  description: "Websites, Android and iOS apps, branding and content, custom CRM & ERP, marketing and ads, and strategy. One team, the whole job.",
};

export default function ServicesPage() {
  return (
    <>
      <section className={`container page-hero ${styles.hero}`}>
        <div>
          <Crumbs trail={[{ label: "Services" }]} />
          <h1 className="h-display">One team, the whole job.</h1>
        </div>
        <div>
          <p className="lead">
            Your website, app, systems, ads and content, planned together so they work together. Pick one, or pick a few. No juggling five different vendors.
          </p>
          <div className={styles.btns}>
            <Link href="/contact/" className="btn btn--violet">Start a project</Link>
            <Link href="/talk/" className="btn btn--ghost">Not sure? Ask Kitto</Link>
          </div>
        </div>
      </section>

      <section className="container" aria-label="Our services">
        <ul className={styles.grid}>
          {SERVICES.map((s, i) => (
            <Reveal as="li" key={s.slug} delay={(i % 3) * 80} className={styles.cell}>
              <div className={styles.card}>
                <span className={styles.n}>{s.n}</span>
                <h2 className={styles.name}>
                  <Link href={serviceHref(s)} className={styles.cover}>{s.name}</Link>
                </h2>
                <p className="muted">{s.short}</p>
                <ul>
                  {s.includes.map((x) => <li key={x}>{x}</li>)}
                </ul>
                <span className={styles.more} aria-hidden="true">See the service →</span>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      <Process />
      <Faq items={FAQ} />
      <KittoCta />
    </>
  );
}
