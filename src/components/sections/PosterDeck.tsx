"use client";
/**
 * Posters as a fanned deck you can flip through, like a hand of cards.
 * Drag or swipe sideways, use the arrows or the keyboard, or click a card at the side to bring it forward.
 * The front poster tilts toward the cursor with a little glare; clicking it opens it full size.
 */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Brace } from "@/components/ui/Brace";
import { T } from "@/components/ui/T";
import { Lightbox } from "@/components/ui/Lightbox";
import { CAMPAIGNS, POSTER_CATEGORIES } from "@/lib/content";
import styles from "./PosterDeck.module.css";

const SPREAD = 0.62; // how far apart neighbouring cards sit, in card widths
const VISIBLE = 4; // cards drawn on each side of the front one

export function PosterDeck({ heading = true, dark = true }: { heading?: boolean; dark?: boolean }) {
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState(0);
  const [drag, setDrag] = useState(0); // live drag, in cards
  const [dragging, setDragging] = useState(false);
  const [box, setBox] = useState<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLButtonElement | null>(null);
  const start = useRef<{ x: number; w: number; moved: boolean } | null>(null);

  // every poster of every campaign in the category, so the deck is as full as the work allows
  const items = useMemo(() => {
    const list = filter === "All" ? CAMPAIGNS : CAMPAIGNS.filter((c) => c.category === filter);
    return list.flatMap((c) => c.posters.map((src, k) => ({ c, src, key: `${c.slug}-${k}` })));
  }, [filter]);
  const n = items.length;
  const go = useCallback((i: number) => setActive(((i % n) + n) % n), [n]);

  useEffect(() => setActive(0), [filter]);

  // keyboard: arrows flip while the deck has focus
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(active + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(active - 1); }
  };

  // drag / swipe
  const onDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const w = (stageRef.current?.querySelector(`.${styles.card}`) as HTMLElement | null)?.offsetWidth ?? 300;
    start.current = { x: e.clientX, w: w * SPREAD, moved: false };
  };
  const onMove = (e: React.PointerEvent) => {
    const s = start.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    if (!s.moved && Math.abs(dx) > 6) {
      s.moved = true;
      setDragging(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    if (s.moved) setDrag(-dx / s.w);
  };
  const onUp = () => {
    const s = start.current;
    start.current = null;
    if (!s?.moved) return;
    go(active + Math.round(drag));
    setDrag(0);
    // let the click that ends a drag pass without opening anything
    setTimeout(() => setDragging(false), 0);
  };

  // sideways wheel / trackpad flips one card at a time
  const wheelLock = useRef(0);
  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY) || Math.abs(e.deltaX) < 12) return;
    const now = performance.now();
    if (now - wheelLock.current < 280) return;
    wheelLock.current = now;
    go(active + Math.sign(e.deltaX));
  };

  // the front card leans toward the cursor
  const onTilt = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (dragging || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.setProperty("--rx", `${(-y * 12).toFixed(2)}deg`);
    e.currentTarget.style.setProperty("--ry", `${(x * 14).toFixed(2)}deg`);
    e.currentTarget.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(1)}%`);
    e.currentTarget.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(1)}%`);
  };
  const resetTilt = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };

  const pos = active + drag;
  const cur = items[active];

  return (
    <section id="posters" className={styles.section} data-dark={dark || undefined} aria-labelledby={heading ? "posters-title" : undefined} aria-label={heading ? undefined : "Posters"}>
      <div className={`container ${styles.head}`}>
        {heading && (
          <div>
            <p className="label">Posters &amp; brand</p>
            <h2 id="posters-title" className="h2">Posters that <Brace>stop</Brace> the scroll.</h2>
          </div>
        )}
        <div className={styles.chips} role="group" aria-label="Filter posters">
          {POSTER_CATEGORIES.map((c) => (
            <button key={c} type="button" className={styles.chip} aria-pressed={filter === c} onClick={() => setFilter(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={stageRef}
        className={styles.stage}
        data-dragging={dragging || undefined}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="Posters. Use the arrow keys to flip through."
        onKeyDown={onKey}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onWheel={onWheel}
      >
        {n === 0 && <p className={styles.empty}>Nothing in this category yet.</p>}
        {items.map(({ c, src, key }, i) => {
          // shortest way round the loop, so the deck wraps both ways
          let off = i - pos;
          if (n > 2) off = ((((off + n / 2) % n) + n) % n) - n / 2;
          const a = Math.abs(off);
          if (a > VISIBLE + 0.5) return null;
          const front = i === active && !dragging;
          return (
            <button
              key={key}
              ref={front ? frontRef : undefined}
              type="button"
              tabIndex={-1}
              className={styles.card}
              data-front={front || undefined}
              style={{
                "--x": `${off * SPREAD * 100}%`,
                "--y": `${Math.pow(a, 1.5) * 4}%`,
                "--r": `${off * 7}deg`,
                "--s": `${1 - Math.min(a, VISIBLE) * 0.07}`,
                "--o": `${a > VISIBLE - 0.5 ? Math.max(0, VISIBLE + 0.5 - a) : 1}`,
                "--dim": `${Math.min(a, 1) * 0.35}`,
                zIndex: 100 - Math.round(a * 10),
                aspectRatio: c.format.replace(":", " / "),
              } as React.CSSProperties}
              onClick={() => {
                if (dragging) return;
                if (i === active) setBox(i);
                else go(i);
              }}
              onPointerMove={front ? onTilt : undefined}
              onPointerLeave={front ? resetTilt : undefined}
              aria-label={i === active ? `Open ${c.type} full size` : `Show ${c.type}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" draggable={false} loading={a < 2 ? "eager" : "lazy"} />
              <span className={styles.glare} aria-hidden="true" />
            </button>
          );
        })}
      </div>

      {cur && (
        <div className={`container ${styles.bar}`}>
          <div className={styles.meta} aria-live="polite">
            <span className={styles.count}>
              {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </span>
            <strong><T>{cur.c.title}</T></strong>
            <span><T>{cur.c.client}</T> · {cur.c.type} · {cur.c.format}</span>
          </div>
          <div className={styles.controls}>
            <button type="button" className={styles.arrow} onClick={() => go(active - 1)} aria-label="Previous poster">←</button>
            <button type="button" className={styles.arrow} onClick={() => go(active + 1)} aria-label="Next poster">→</button>
            <button type="button" className={styles.open} onClick={() => setBox(active)}>View full size</button>
            {heading && <Link href="/work/posters/" className={styles.all}>All posters ↗</Link>}
          </div>
        </div>
      )}
      <p className={styles.hint} aria-hidden="true">Drag, swipe or use ← → to flip through</p>

      {box !== null && (
        <Lightbox
          items={items.map(({ c, src }) => ({ src, alt: `${c.type} poster`, caption: <><T>{c.title}</T> · <T>{c.client}</T></> }))}
          index={box}
          onIndex={(i) => { setBox(i); go(i); }}
          onClose={() => setBox(null)}
        />
      )}
    </section>
  );
}
