import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { Brace } from "@/components/ui/Brace";
import { APPS, SERVICES, WEB_PROJECTS } from "@/lib/content";
import styles from "./WhatWeDo.module.css";

// the four things people come for, each with its own page
const MAIN = [
  { title: "Websites", line: "Business sites, landing pages and portfolios that bring enquiries in.", href: "#web", img: WEB_PROJECTS[0]?.screenshot },
  { title: "Android & iOS apps", line: "Apps designed to be used, built properly and looked after.", href: "#apps", img: APPS[0]?.screens[0] },
  { title: "Branding & posters", line: "Logos, posters and campaign creative that look like you.", href: "#posters", img: "/work/posters/placeholder-poster-1.svg" },
  { title: "Video", line: "Realistic AI videos, reels and edits for social media and ads.", href: "/services/video-production/", img: "/work/reels/placeholder-reel-2.svg" },
];
const MORE = SERVICES.filter((s) => ["crm-erp", "social-media-content", "digital-marketing-ads", "strategy"].includes(s.slug));

/** Homepage: a short "what we do" that sends people to the right page, instead of every showcase at once. */
export function WhatWeDo() {
  return (
    <section className="section" aria-labelledby="wwd-title">
      <div className={`container ${styles.head}`}>
        <div>
          <p className="label">What we do</p>
          <h2 id="wwd-title" className="h2">One team, the <Brace>whole</Brace> job.</h2>
        </div>
        <p className="lead">Your website, app, ads and content, planned together so they work together. Tap one to see the work.</p>
      </div>
      <div className={`container ${styles.grid}`}>
        {MAIN.map((m, i) => (
          <Reveal key={m.href} delay={i * 80} className={styles.cell}>
            <Link href={m.href} className={styles.card}>
              <span className={styles.media}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.img} alt="" loading="lazy" />
              </span>
              <span className={styles.text}>
                <span className={styles.n}>{String(i + 1).padStart(2, "0")}</span>
                <strong>{m.title}</strong>
                <span>{m.line}</span>
              </span>
              <span className={styles.arrow} aria-hidden="true">↗</span>
            </Link>
          </Reveal>
        ))}
      </div>
      <div className={`container ${styles.more}`}>
        <span>Also:</span>
        {MORE.map((s) => (
          <Link key={s.slug} href={`/services/${s.slug}/`} className="chip">{s.name}</Link>
        ))}
        <Link href="/services/" className="link-arrow">All services →</Link>
      </div>
    </section>
  );
}
