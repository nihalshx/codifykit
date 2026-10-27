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
  const rows: [string, string | undefined][] = [
    ["Client", c.client],
    ["Type", c.type],
    ["Year", c.year],
    ["Built with", c.builtWith.length ? c.builtWith.join(", ") : undefined],
  ];

  return (
    <>
      <section className="container page-hero">
        <p className="label"><Link href="/work/">Work</Link> / {c.kind}</p>
        <h1 className="h-display"><T>{c.title}</T></h1>
        <div className={styles.top}>
          <dl className={styles.table}>
            {rows.filter(([, v]) => v).map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd><T>{v}</T></dd></div>
            ))}
          </dl>
          {c.liveUrl && <a href={c.liveUrl} target="_blank" rel="noopener" className="btn">Visit live site ↗</a>}
        </div>
      </section>

      <section className="container section">
        <div className={styles.story}>
          <div><h2 className="h3">The problem</h2><p className="muted"><T>[PLACEHOLDER What the client needed]</T></p></div>
          <div><h2 className="h3">What we built</h2><p className="muted"><T>{c.oneLine}</T></p></div>
          <div>
            <h2 className="h3">The result</h2>
            <p className="muted"><T>[PLACEHOLDER Result, only real and approved numbers]</T></p>
            {c.facts.length > 0 && (
              <ul className={styles.facts}>{c.facts.map((f, k) => <li key={k}><T>{f}</T></li>)}</ul>
            )}
          </div>
        </div>
      </section>

      <section className="container">
        <div className={styles.gallery} data-kind={c.kind}>
          {c.images.map((src, k) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={k} src={src} alt={`${c.kind === "Websites" ? "Screenshot" : c.kind === "Apps" ? "App screen" : "Poster"} ${k + 1}`} loading={k ? "lazy" : "eager"} />
          ))}
        </div>
      </section>

      <section className="container section">
        <Link href={`/work/${next.slug}/`} className={styles.next}>
          <span className="label">Next project</span>
          <span className={styles.nextTitle}><T>{next.title}</T> →</span>
        </Link>
      </section>
      <KittoCta title="Want something like this?" />
    </>
  );
}
