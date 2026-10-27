"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { Brace } from "@/components/ui/Brace";
import { SERVICES } from "@/lib/content";
import styles from "./Services.module.css";

// one image of each service's work for the hover preview (placeholders until real work is in)
const PREVIEW: Record<string, string> = {
  "web-app-development": "/work/web/placeholder-web-1.svg",
  "crm-erp": "/work/apps/placeholder-app-5.svg",
  "social-media-content": "/work/posters/placeholder-poster-1.svg",
  "video-production": "/work/reels/placeholder-reel-2.svg",
  "digital-marketing-ads": "/work/posters/placeholder-poster-4.svg",
  "branding-creative": "/work/posters/placeholder-poster-3.svg",
  strategy: "/work/apps/placeholder-app-2.svg",
};

export function Services() {
  const listRef = useRef<HTMLUListElement>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const chips = SERVICES.flatMap((sv) => sv.includes.map((x) => x.split(/[:(,]/)[0].trim()));
  const rowA = chips.filter((_, i) => i % 2 === 0);
  const rowB = chips.filter((_, i) => i % 2 === 1);
  return (
    <section className="section" aria-labelledby="services-title">
      <div className="container">
        <div className={styles.band} aria-hidden="true">
          <p className={styles.bandTitle}>Everything we <Brace>build</Brace> and run</p>
          {[rowA, rowB].map((row, r) => (
            <div key={r} className={styles.chipRow} data-reverse={r === 1 || undefined}>
              <div className={styles.chipTrack}>
                {[...row, ...row].map((c, i) => (
                  <span key={i} className={styles.chipItem}><i />{c}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={`container ${styles.grid}`}>
        <Reveal>
          <p className="label">Services</p>
          <h2 id="services-title" className="h2">One team, the <Brace>whole</Brace> job.</h2>
          <p className="lead" style={{ marginTop: 20 }}>
            Website, app, systems, ads, video and design, without five different vendors.
          </p>
        </Reveal>
        <ul
          ref={listRef}
          className={styles.list}
          onMouseMove={(e) => {
            const r = listRef.current!.getBoundingClientRect();
            setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
          }}
          onMouseLeave={() => setHover(null)}
        >
          {SERVICES.map((s, i) => (
            <Reveal as="li" key={s.slug} delay={i * 60}>
              <Link href={`/services/${s.slug}/`} className={styles.row} onMouseEnter={() => setHover(s.slug)}>
                <span className={styles.n}>{s.n}</span>
                <span className={styles.name}>{s.name}</span>
                <span className={styles.short}>{s.short}</span>
                <span className={styles.arrow} aria-hidden="true">→</span>
              </Link>
            </Reveal>
          ))}
          <span
            className={styles.preview}
            data-on={!!hover}
            style={{ transform: `translate(${pos.x + 24}px, ${pos.y - 90}px)` }}
            aria-hidden="true"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {hover && <img src={PREVIEW[hover]} alt="" />}
          </span>
        </ul>
      </div>
    </section>
  );
}
