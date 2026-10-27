"use client";
/**
 * Websites in a browser window you can actually use: pick a project on the left and scroll the real
 * page inside the window. Left alone, the window scrolls itself slowly and moves on to the next site;
 * it stops as soon as the visitor points at it, scrolls or picks a site.
 */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Brace } from "@/components/ui/Brace";
import { T } from "@/components/ui/T";
import { WEB_PROJECTS, isPlaceholder } from "@/lib/content";
import styles from "./WebBrowser.module.css";

const SPEED = 70; // px per second while it scrolls itself
const PAUSE = 1400; // ms at the bottom before the next site

export function WebBrowser() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [held, setHeld] = useState(false); // the visitor is using it
  const viewRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const state = useRef({ inView: false, held: false, reduced: false, bottomAt: 0, y: 0 });
  const p = WEB_PROJECTS[active];

  useEffect(() => {
    state.current.held = held;
  }, [held]);

  // auto-scroll, only while the section is on screen and nobody is using it
  useEffect(() => {
    const S = state.current;
    S.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(([e]) => (S.inView = e.isIntersecting), { threshold: 0.35 });
    if (sectionRef.current) io.observe(sectionRef.current);
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const v = viewRef.current;
      if (v && S.inView && !S.held && !S.reduced) {
        const max = v.scrollHeight - v.clientHeight;
        if (max > 0) {
          if (S.y < max - 1) {
            S.y = Math.min(max, S.y + (SPEED * dt) / 1000);
            v.scrollTop = S.y;
            S.bottomAt = 0;
          } else if (!S.bottomAt) {
            S.bottomAt = now;
          } else if (now - S.bottomAt > PAUSE) {
            S.bottomAt = 0;
            setActive((a) => (a + 1) % WEB_PROJECTS.length);
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  // a new site starts at the top
  useEffect(() => {
    state.current.y = 0;
    state.current.bottomAt = 0;
    if (viewRef.current) viewRef.current.scrollTop = 0;
    setProgress(0);
  }, [active]);

  const onScroll = () => {
    const v = viewRef.current;
    if (!v) return;
    const max = v.scrollHeight - v.clientHeight;
    setProgress(max > 0 ? v.scrollTop / max : 0);
    if (state.current.held) state.current.y = v.scrollTop;
  };

  const pick = (i: number) => {
    setActive(i);
    setHeld(true);
  };

  return (
    <section ref={sectionRef} id="web" className={styles.section} aria-labelledby="web-title">
      <div className={`container ${styles.layout}`}>
        <div className={styles.side}>
          <p className="label">Websites</p>
          <h2 id="web-title" className="h2">
            Websites that bring <Brace>customers</Brace> in.
          </h2>
          <p className={`muted ${styles.intro}`}>Pick a site and scroll it right here, the way your customers would.</p>
          <ol className={styles.list}>
            {WEB_PROJECTS.map((w, i) => (
              <li key={w.slug}>
                <button type="button" aria-pressed={i === active} onClick={() => pick(i)}>
                  <span className={styles.n}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={styles.name}>
                    <T>{w.title}</T>
                    <small>{w.type}</small>
                  </span>
                  <span className={styles.bar} aria-hidden="true">
                    <i style={{ transform: `scaleX(${i === active ? progress : 0})` }} />
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <div className={styles.btns}>
            <Link href="/services/web/" className="btn btn--violet">Web development</Link>
            <Link href="/work/web/" className="btn btn--ghost">See them on a laptop ↗</Link>
          </div>
        </div>

        <div
          className={styles.browser}
          onPointerEnter={(e) => e.pointerType === "mouse" && setHeld(true)}
          onPointerLeave={(e) => e.pointerType === "mouse" && setHeld(false)}
          onTouchStart={() => setHeld(true)}
          onFocus={() => setHeld(true)}
          onBlur={() => setHeld(false)}
        >
          <div className={styles.chrome}>
            <span className={styles.dots} aria-hidden="true"><i /><i /><i /></span>
            <span className={styles.address}>
              <span aria-hidden="true">🔒</span> {p.domain}
            </span>
            <Link href={`/work/${p.slug}/`} className={styles.caseLink}>Case study →</Link>
          </div>
          <div
            ref={viewRef}
            className={styles.view}
            onScroll={onScroll}
            tabIndex={0}
            aria-label={`${isPlaceholder(p.title) ? p.type : p.title}, scroll to see the whole page`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={p.slug} src={p.screenshot} alt={`Full page of ${isPlaceholder(p.title) ? "a " + p.type.toLowerCase() : p.title}`} className={styles.page} />
          </div>
          <span className={styles.scrollHint} data-hide={held || progress > 0.04 || undefined} aria-hidden="true">
            Scroll inside ↓
          </span>
          <span className={styles.track} aria-hidden="true"><i style={{ height: `${Math.max(8, progress * 100)}%` }} /></span>
        </div>
      </div>
    </section>
  );
}
