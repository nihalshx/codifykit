import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { KittoCta } from "@/components/ui/KittoCta";
import { T } from "@/components/ui/T";
import { CASE_STUDIES, isPlaceholder } from "@/lib/content";
import styles from "./case.module.css";

export function generateStaticParams() {
  return CASE_STUDIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = CASE_STUDIES.find((x) => x.slug === slug);
  if (!c) return {};
  const title = isPlaceholder(c.title) ? `${c.kind} case study` : c.title;
  return { title, description: isPlaceholder(c.oneLine) ? `A ${c.type.toLowerCase()} by Codifykit.` : c.oneLine };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = CASE_STUDIES.findIndex((c) => c.slug === slug);
  if (i < 0) notFound();
  const c = CASE_STUDIES[i];
  const next = CASE_STUDIES[(i + 1) % CASE_STUDIES.length];
  const prev = CASE_STUDIES[(i - 1 + CASE_STUDIES.length) % CASE_STUDIES.length];
  const need = c.kind === "Apps" ? "Android / iOS app" : c.kind === "Websites" ? "Website" : "Branding & posters";
  const story = [
    ["The problem", c.problem],
    ["What we built", c.oneLine],
    ["The result", c.result],
  ].filter(([, v]) => v) as [string, string][];
  const rows: [string, string | undefined][] = [
    ["Client", c.client],
    ["Type", c.type],
    ["Year", c.year],
    ["Built with", c.builtWith.length ? c.builtWith.join(", ") : undefined],
  ];

  return (
    <>
      {/* the opening screen: the facts on the left, the work itself on the right */}
      <section className={`container page-hero ${styles.hero}`}>
        <div>
          <nav aria-label="Breadcrumb" className={styles.crumbs}>
            <Link href="/work/">← All work</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/work/?filter=${c.kind}`}>{c.kind}</Link>
          </nav>
          <h1 className="h-display"><T>{c.title}</T></h1>
          <div className={styles.top}>
            <dl className={styles.table}>
              {rows.filter(([, v]) => v).map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd><T>{v}</T></dd></div>
              ))}
            </dl>
            <div className={styles.actions}>
              {c.liveUrl && <a href={c.liveUrl} target="_blank" rel="noopener" className="btn btn--ghost">Visit live site ↗</a>}
              <Link href={`/contact/?need=${encodeURIComponent(need)}`} className="btn btn--violet">Start a project like this</Link>
            </div>
          </div>
        </div>
        <figure className={styles.cover} data-kind={c.kind}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.images[0]} alt={`${c.kind === "Websites" ? "Screenshot" : c.kind === "Apps" ? "App screen" : "Poster"} 1`} />
        </figure>
      </section>

      {story.length > 0 && (
        <section className="container section">
          <div className={styles.story}>
            {story.map(([h, v], k) => (
              <div key={h}>
                <h2 className="h3">{h}</h2>
                <p className="muted"><T>{v}</T></p>
                {k === story.length - 1 && c.facts.length > 0 && (
                  <ul className={styles.facts}>{c.facts.map((f, j) => <li key={j}><T>{f}</T></li>)}</ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {c.images.length > 1 && (
        <section className="container">
          <div className={styles.gallery} data-kind={c.kind}>
            {c.images.slice(1).map((src, k) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={k} src={src} alt={`${c.kind === "Websites" ? "Screenshot" : c.kind === "Apps" ? "App screen" : "Poster"} ${k + 2}`} loading="lazy" />
            ))}
          </div>
        </section>
      )}

      <nav className={`container section ${styles.pager}`} aria-label="More projects">
        <Link href={`/work/${prev.slug}/`} className={styles.next}>
          <span className="label">Previous</span>
          <span className={styles.nextTitle}>← <T>{prev.title}</T></span>
        </Link>
        <Link href={`/work/${next.slug}/`} className={styles.next} data-next>
          <span className="label">Next project</span>
          <span className={styles.nextTitle}><T>{next.title}</T> →</span>
        </Link>
      </nav>
      <KittoCta title="Want something like this?" />
    </>
  );
}
