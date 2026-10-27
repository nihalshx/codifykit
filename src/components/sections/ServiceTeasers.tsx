import Link from "next/link";
import { Brace } from "@/components/ui/Brace";
import { T } from "@/components/ui/T";
import { Reveal } from "@/components/ui/Reveal";
import { APPS, CAMPAIGNS, SERVICES, WEB_PROJECTS, serviceHref } from "@/lib/content";
import styles from "./ServiceTeasers.module.css";

/**
 * Homepage: one short teaser per main service, all the same shape (what it is, three pieces of work,
 * the way in). The full showcase for each lives on its service page, so nothing is shown twice.
 */
type Piece = { src: string; href: string; label: string };
const CHAPTERS: {
  id: string;
  name: string;
  line: string;
  href: string;
  cta: string;
  frame: "browser" | "phone" | "poster";
  pieces: Piece[];
  extra?: { href: string; label: string };
}[] = [
  {
    id: "web",
    name: "Websites",
    line: "Business sites, landing pages, portfolios and online stores that load fast, read well on a phone and bring enquiries in.",
    href: "/services/web/",
    cta: "See websites",
    frame: "browser",
    pieces: WEB_PROJECTS.slice(0, 3).map((p) => ({ src: p.screenshot, href: `/work/${p.slug}/`, label: p.title })),
    extra: { href: "/work/web/", label: "View in 3D" },
  },
  {
    id: "apps",
    name: "Android & iOS apps",
    line: "Apps designed to be used, not just looked at. Planned with you, built properly and looked after once they're live.",
    href: "/services/apps/",
    cta: "See apps",
    frame: "phone",
    pieces: APPS.slice(0, 3).map((a) => ({ src: a.screens[0], href: `/work/${a.slug}/`, label: a.title })),
    extra: { href: "/work/apps/", label: "View in 3D" },
  },
  {
    id: "posters",
    name: "Branding & content",
    line: "Logos, posters, social media and video, planned so every post, reel and ad looks like the same brand.",
    href: "/services/branding-content/",
    cta: "See branding & content",
    frame: "poster",
    pieces: CAMPAIGNS.slice(0, 3).map((c) => ({ src: c.posters[0], href: `/work/${c.slug}/`, label: c.title })),
    extra: { href: "/work/?filter=Videos", label: "Watch the reels" },
  },
];
const MORE = SERVICES.filter((s) => !CHAPTERS.some((c) => c.href === serviceHref(s)));

export function ServiceTeasers() {
  return (
    <section className="section" aria-labelledby="teasers-title">
      <div className={`container ${styles.head}`}>
        <h2 id="teasers-title" className="h2">One team, the <Brace>whole</Brace> job.</h2>
        <p className="lead">Your website, app, ads and content, planned together so they work together. Pick where you want to start.</p>
      </div>

      <div className={`container ${styles.list}`}>
        {CHAPTERS.map((c) => (
          <Reveal key={c.id} as="article" id={c.id} className={styles.chapter} aria-labelledby={`${c.id}-title`}>
            <div className={styles.copy}>
              <h3 id={`${c.id}-title`} className={styles.name}>{c.name}</h3>
              <p className={styles.line}>{c.line}</p>
              <div className={styles.links}>
                <Link href={c.href} className="btn btn--violet btn--sm">{c.cta} →</Link>
                {c.extra && <Link href={c.extra.href} className={styles.extra}>{c.extra.label} ↗</Link>}
              </div>
            </div>
            <ul className={styles.pieces} data-frame={c.frame}>
              {c.pieces.map((p, i) => (
                <li key={p.href + i}>
                  <Link href={p.href} className={styles.piece}>
                    {c.frame === "browser" && <span className={styles.chrome} aria-hidden="true"><i /><i /><i /></span>}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.src} alt="" loading="lazy" />
                    <span className="sr-only"><T>{p.label}</T>: case study</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>

      <div className={`container ${styles.more}`}>
        <span>Also</span>
        {MORE.map((s) => (
          <Link key={s.slug} href={serviceHref(s)} className={styles.chip}>
            <strong>{s.name}</strong>
            <small>{s.short}</small>
          </Link>
        ))}
        <Link href="/services/" className="link-arrow">All services →</Link>
      </div>
    </section>
  );
}
