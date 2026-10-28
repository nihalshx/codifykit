"use client";
/**
 * Websites, rebuilt from the reference: a dark masonry wall of website screenshots whose columns
 * slide at different speeds as you scroll past. Each tile links to its case study.
 */
import Link from "next/link";
import { useEffect, useRef } from "react";
import { T } from "@/components/ui/T";
import { Brace } from "@/components/ui/Brace";
import { WEB_PROJECTS } from "@/lib/content";
import styles from "./Websites.module.css";

const COLS = 4;
// alternate wide (top of the page) and tall (more of the page) crops so the wall reads as masonry
const tiles = Array.from({ length: COLS * 3 }, (_, i) => {
  const p = WEB_PROJECTS[i % WEB_PROJECTS.length];
  return { p, tall: (i + Math.floor(i / COLS)) % 3 === 0, key: `${p.slug}-${i}` };
});
const columns = Array.from({ length: COLS }, (_, c) => tiles.filter((_, i) => i % COLS === c));

export function Websites() {
  const wallRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ctx: gsap.Context | undefined;
    let cancelled = false;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        const cols = gsap.utils.toArray<HTMLElement>(`.${styles.col}`, wallRef.current!);
        cols.forEach((col, i) => {
          const amt = [90, -60, 120, -40][i % 4];
          gsap.fromTo(col, { y: -amt }, {
            y: amt, ease: "none",
            scrollTrigger: { trigger: wallRef.current, start: "top bottom", end: "bottom top", scrub: 0.5 },
          });
        });
      });
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section id="web-wall" className={styles.section} aria-labelledby="web-wall-title">
      <div className={`container ${styles.head}`}>
        <div>
          <p className="label">Websites</p>
          <h2 id="web-wall-title" className="h2">
            Websites that bring <Brace>customers</Brace> in.
          </h2>
        </div>
        <div className={styles.headRight}>
          <p className="muted">
            Business sites, landing pages and portfolios, built to load fast, read well on a phone and turn visitors into enquiries.
          </p>
          <Link href="/work/web/" className="btn">View them in 3D ↗</Link>
        </div>
      </div>
      <div ref={wallRef} className={styles.wall}>
        {columns.map((col, c) => (
          <div key={c} className={styles.col}>
            {col.map(({ p, tall, key }) => (
              <Link key={key} href={`/work/${p.slug}/`} className={styles.tile} data-tall={tall || undefined}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.screenshot} alt="" loading="lazy" />
                <span className={styles.caption}>
                  <span className={styles.type}>{p.type}</span>
                  <span className={styles.name}><T>{p.title}</T></span>
                </span>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
