"use client";
/**
 * "What we do", right after the hero: every service as one large row (name, one line, what it covers),
 * with a picture of the work that follows the pointer on hover. A row goes to the service's page; the
 * three services shown further down the homepage also offer a jump to their showcase.
 */
import Link from "next/link";
import { useRef, useState } from "react";
import { Brace } from "@/components/ui/Brace";
import { APPS, CAMPAIGNS, SERVICES, WEB_PROJECTS, serviceHref } from "@/lib/content";
import styles from "./WhatWeDo.module.css";

// a picture of the work for each service, and where on this page its showcase is
const EXTRA: Record<string, { img?: string; jump?: string }> = {
  web: { img: WEB_PROJECTS[0]?.screenshot, jump: "#web" },
  apps: { img: APPS[0]?.screens[0], jump: "#apps" },
  "branding-content": { img: CAMPAIGNS[0]?.posters[0], jump: "#posters" },
  "crm-erp": { img: APPS[4]?.screens[0] },
  "digital-marketing-ads": { img: CAMPAIGNS[3]?.posters[0] },
  strategy: { img: "/images/students-desk.webp" },
};

export function WhatWeDo() {
  const listRef = useRef<HTMLUListElement>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  return (
    <section className={`section ${styles.section}`} aria-labelledby="wwd-title">
      <div className={`container ${styles.head}`}>
        <div>
          <h2 id="wwd-title" className={styles.title}>One team, the <Brace>whole</Brace> job.</h2>
        </div>
        <div className={styles.side}>
          <p className="lead">Your website, app, brand and ads, planned together so they work together. Pick what you need, or tell us and we&apos;ll work it out with you.</p>
          <div className={styles.btns}>
            <Link href="/contact/" className="btn btn--violet">Start a project</Link>
            <Link href="/talk/" className="btn btn--ghost">Not sure? Ask Kitto</Link>
          </div>
        </div>
      </div>

      <div className="container">
        <ul
          ref={listRef}
          className={styles.list}
          onPointerMove={(e) => {
            const r = listRef.current!.getBoundingClientRect();
            setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
          }}
          onPointerLeave={() => setHover(null)}
        >
          {SERVICES.map((s) => {
            const extra = EXTRA[s.slug] ?? {};
            return (
              <li key={s.slug} className={styles.row} onPointerEnter={(e) => e.pointerType === "mouse" && setHover(s.slug)}>
                <Link href={serviceHref(s)} className={styles.main}>
                  <span className={styles.name}>{s.name}</span>
                  <span className={styles.short}>{s.short}</span>
                  <span className={styles.arrow} aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                </Link>
                {extra.jump
                  ? <a href={extra.jump} className={styles.jump}>See it below ↓</a>
                  : <span className={styles.slot} aria-hidden="true" />}
              </li>
            );
          })}
          {/* the picture that follows the pointer */}
          <span
            className={styles.preview}
            data-on={!!hover || undefined}
            style={{ transform: `translate(${pos.x + 28}px, ${pos.y - 110}px)` }}
            aria-hidden="true"
          >
            {SERVICES.map((s) => {
              const img = EXTRA[s.slug]?.img;
              return img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={s.slug} src={img} alt="" data-on={hover === s.slug || undefined} loading="lazy" />
              ) : null;
            })}
          </span>
        </ul>
      </div>
    </section>
  );
}
