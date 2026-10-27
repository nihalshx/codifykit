import Link from "next/link";
import type { ReactNode } from "react";
import { Process } from "@/components/sections/Process";
import { Reveal } from "@/components/ui/Reveal";
import { Brace } from "@/components/ui/Brace";
import { CONTACT, SITE, real, type ServicePage } from "@/lib/content";
import { IconAsterisk } from "@/components/ui/Icons";
import styles from "./ServiceLanding.module.css";

/**
 * One template for the service landing pages, laid out like the reference:
 * intro with a pill strip → what you get → the dark showcase (passed in) → process →
 * services we provide → tools & technologies → start a project.
 * Placeholder values ([FILL IN …]) are left out here, so nothing half-finished shows.
 */
export function ServiceLanding({
  page,
  strip,
  children,
}: {
  page: ServicePage;
  /** images that slide through the pill at the top */
  strip: string[];
  /** the dark showcase section */
  children: ReactNode;
}) {
  const stack = page.stack.map((g) => ({ ...g, items: real(g.items) })).filter((g) => g.items.length);
  const stats = SITE.stats.enabled ? (SITE.stats.items as { value: string; label: string }[]) : [];

  return (
    <div className={styles.page}>
      {/* intro */}
      <section className={`container ${styles.intro}`} aria-labelledby="landing-title">
        <div className={styles.introTop}>
          <div>
            <p className="label">{page.label}</p>
            <h1 id="landing-title" className={styles.title}>
              {page.titleBefore} <Brace>{page.brace}</Brace> {page.titleAfter}
            </h1>
          </div>
          <div className={styles.introSide}>
            <p className="lead">{page.lead}</p>
            <div className={styles.btns}>
              <Link href={`/contact/?need=${encodeURIComponent(page.need)}`} className="btn btn--violet">Start a project</Link>
              <Link href={page.showcaseLink.href} className="btn btn--ghost">{page.showcaseLink.label}</Link>
            </div>
          </div>
        </div>
        <div className={styles.pill} aria-hidden="true">
          <div className={styles.pillTrack}>
            {[...strip, ...strip].map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt="" loading={i < 6 ? "eager" : "lazy"} />
            ))}
          </div>
          <div className={styles.pillMarquee}>
            <span>
              {Array.from({ length: 4 }, (_, i) => (
                <b key={i}>{page.pill}<IconAsterisk size={28} className={styles.star} /></b>
              ))}
            </span>
          </div>
        </div>
      </section>

      {/* what you get (real numbers replace this only when site.json has stats enabled) */}
      <section className={`container ${styles.promises}`} aria-label="What you get">
        {stats.length > 0 && (
          <ul className={styles.stats}>
            {stats.map((s) => (
              <li key={s.label}><strong>{s.value}</strong><span>{s.label}</span></li>
            ))}
          </ul>
        )}
        <ul className={styles.promiseList}>
          {page.promises.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 70}>
              <h2>{p.title}</h2>
              <p>{p.text}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      {children}

      <Process ctaHref="/contact/" />

      {/* services we provide */}
      <section className="container section" aria-labelledby="provide-title">
        <div className={styles.provide}>
          <div className={styles.cubes} aria-hidden="true">
            {Array.from({ length: 7 }, (_, i) => <span key={i} />)}
          </div>
          <h2 id="provide-title" className={styles.provideTitle}>
            {page.servicesTitleBefore} <Brace>{page.servicesBrace}</Brace>
          </h2>
          <ul className={styles.chips}>
            {page.services.map((s) => (
              <li key={s}><i aria-hidden="true" />{s}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* tools & technologies */}
      {stack.length > 0 && (
        <section className="container section" aria-labelledby="stack-title">
          <div className={styles.stackHead}>
            <h2 id="stack-title" className={styles.stackTitle}>
              Tools we use for <span>{page.stackFor.toLowerCase()}</span>
            </h2>
            <p className="muted">
              We mainly build apps in Flutter, so one codebase runs on Android and iOS. If your project needs another stack, we work in that too.
            </p>
          </div>
          <div className={styles.stack}>
            {stack.map((g) => (
              <div key={g.name}>
                  <h3>{g.name}</h3>
                <ul>{g.items.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* start a project */}
      <section className="container section" aria-labelledby="start-title">
        <div className={styles.start}>
          <div>
            <p className="label">Start a project</p>
            <h2 id="start-title" className={styles.startTitle}>
              Have a <Brace>project</Brace> in mind?
            </h2>
            <p className="lead">Tell us what you need and we&apos;ll come back to you with the next steps and a rough price.</p>
          </div>
          <div className={styles.startBtns}>
            <Link href={`/contact/?need=${encodeURIComponent(page.need)}`} className="btn btn--violet">Start a project</Link>
            <a href={CONTACT.whatsapp} target="_blank" rel="noopener" className="btn btn--ghost">WhatsApp us ↗</a>
            <Link href="/talk/" className="link-arrow">Or ask Kitto first</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
