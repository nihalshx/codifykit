"use client";
import { Brace } from "@/components/ui/Brace";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { T } from "@/components/ui/T";
import { Lightbox } from "@/components/ui/Lightbox";
import { CAMPAIGNS, POSTER_CATEGORIES } from "@/lib/content";
import styles from "./Posters.module.css";

const ratioCss = (f: string) => f.replace(":", " / ");

export function Posters({ heading = true }: { heading?: boolean }) {
  const [filter, setFilter] = useState("All");
  const [shown, setShown] = useState(filter);
  const [leaving, setLeaving] = useState(false);
  const [box, setBox] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setInView(true), io.disconnect()), { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // quick shuffle: old set fades/scales out, new set drops in
  const pick = (c: string) => {
    if (c === filter) return;
    setFilter(c);
    setLeaving(true);
    setTimeout(() => {
      setShown(c);
      setLeaving(false);
    }, 200);
  };

  const items = useMemo(() => {
    const list = shown === "All" ? CAMPAIGNS : CAMPAIGNS.filter((c) => c.category === shown);
    return list.flatMap((c) => c.posters.slice(0, 1).map((src) => ({ c, src })));
  }, [shown]);

  return (
    <section id="posters" className={`section ${styles.section}`}>
      <div className="container">
        {heading && (
          <div className={styles.head}>
            <div>
              <p className="label">Posters &amp; brand</p>
              <h2 className="h2">Posters that <Brace>stop</Brace> the scroll.</h2>
            </div>
            <Link href="/work/posters/" className="btn btn--ghost">See all posters ↗</Link>
          </div>
        )}
        <div className={styles.chips} role="group" aria-label="Filter posters">
          {POSTER_CATEGORIES.map((c) => (
            <button key={c} type="button" className="chip" aria-pressed={filter === c} onClick={() => pick(c)}>
              {c}
            </button>
          ))}
        </div>
        <div ref={gridRef} className={styles.grid} data-leaving={leaving} data-in={inView}>
          {items.map(({ c, src }, i) => (
            <button
              key={shown + c.slug}
              type="button"
              className={styles.poster}
              style={{ "--tilt": `${c.tilt}deg`, "--d": `${i * 60}ms`, aspectRatio: ratioCss(c.format) } as React.CSSProperties}
              onClick={() => setBox(i)}
              aria-label={`Open poster: ${c.title.startsWith("[") ? c.type : c.title}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" />
              <span className={styles.caption}>
                <T>{c.client}</T> · {c.type}
              </span>
            </button>
          ))}
          {!items.length && <p className="muted">Nothing in this category yet.</p>}
        </div>
      </div>
      {box !== null && (
        <Lightbox
          items={items.map(({ c, src }) => ({ src, alt: `${c.type} poster`, caption: <><T>{c.title}</T> · <T>{c.client}</T></> }))}
          index={box}
          onIndex={setBox}
          onClose={() => setBox(null)}
        />
      )}
    </section>
  );
}
