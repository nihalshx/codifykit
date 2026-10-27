"use client";
/**
 * Apps section, rebuilt from the reference recording:
 *  A. Dark intro: big "{Apps} people actually use." heading, giant faint words sliding sideways with the
 *     scroll, and two tilted phones drifting up at different speeds.
 *  B. Pinned grid: five columns of app screens slide past at different speeds (alternating directions)
 *     while a hand-held phone stays in the middle column and its screen moves through three app screens.
 * GSAP ScrollTrigger drives both parts from the scroll position.
 */
import Link from "next/link";
import { useEffect, useRef } from "react";
import { APPS, APP_HERO_SCREENS } from "@/lib/content";
import styles from "./AppShowcase.module.css";

// where the screen sits on public/images/hand-phone.webp (1024 x 1536), measured from the green screen
const SCREEN = { left: 217 / 1024, top: 160 / 1536, width: 457 / 1024, height: 999 / 1536 };

const SCREENS = APPS.map((a) => a.screens[0]);
const COLS = 5;
const PER_COL = 5;
// fill the columns with the app screens, offset per column so neighbours differ
const columns = Array.from({ length: COLS }, (_, c) =>
  Array.from({ length: PER_COL }, (_, r) => {
    const i = (c * 3 + r * 2) % APPS.length;
    return { app: APPS[i], src: SCREENS[i], key: `${c}-${r}` };
  })
);

function Phone({ src, className }: { src: string; className?: string }) {
  return (
    <div className={`${styles.phone} ${className ?? ""}`}>
      <span className={styles.notch} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" draggable={false} />
    </div>
  );
}

export function AppShowcase() {
  const introRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const handRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ctx: gsap.Context | undefined;
    let cancelled = false;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const mobile = window.matchMedia("(max-width: 767px)").matches;

      ctx = gsap.context(() => {
        // ---- A. intro: words slide sideways, the two phones drift up at different speeds
        const intro = introRef.current!;
        gsap.to(intro.querySelector(`.${styles.words}`), {
          xPercent: -35,
          ease: "none",
          scrollTrigger: { trigger: intro, start: "top bottom", end: "bottom top", scrub: true },
        });
        gsap.fromTo(intro.querySelector(`.${styles.phoneA}`), { y: 120, rotate: -22 }, {
          y: -260, rotate: -26, ease: "none",
          scrollTrigger: { trigger: intro, start: "top bottom", end: "bottom top", scrub: true },
        });
        gsap.fromTo(intro.querySelector(`.${styles.phoneB}`), { y: 220, rotate: 16 }, {
          y: -380, rotate: 22, ease: "none",
          scrollTrigger: { trigger: intro, start: "top bottom", end: "bottom top", scrub: true },
        });

        // ---- B. pinned grid
        const grid = gridRef.current!;
        const cols = gsap.utils.toArray<HTMLElement>(`.${styles.col}`, grid);
        const tl = gsap.timeline({
          scrollTrigger: { trigger: grid, start: "top top", end: mobile ? "+=160%" : "+=260%", scrub: 0.6, pin: true, anticipatePin: 1 },
        });
        // columns: alternate directions, outer columns faster
        cols.forEach((col, i) => {
          const dir = i % 2 ? 1 : -1;
          const speed = [1.25, 0.8, 0.35, 0.8, 1.25][i] ?? 1;
          tl.fromTo(col, { yPercent: dir > 0 ? -18 * speed : 6 * speed }, { yPercent: dir > 0 ? 6 * speed : -18 * speed, ease: "none", duration: 1 }, 0);
        });
        // the hand rises into the middle column, straightening as it comes
        const hand = handRef.current!;
        tl.fromTo(hand, { yPercent: 70, rotate: 10, xPercent: 8 }, { yPercent: 0, rotate: 0, xPercent: 0, ease: "power2.out", duration: 0.25 }, 0);
        // the phone screen: scroll each app, then a native push to the next one
        const screens = gsap.utils.toArray<HTMLElement>(`.${styles.inScreen}`, hand);
        const seg = 0.7 / screens.length;
        screens.forEach((s, k) => {
          const start = 0.2 + k * seg;
          const img = s.querySelector("img");
          if (k > 0) tl.fromTo(s, { xPercent: 100 }, { xPercent: 0, ease: "power2.inOut", duration: seg * 0.25 }, start - seg * 0.25);
          tl.fromTo(img, { yPercent: 0 }, { yPercent: -48, ease: "power1.inOut", duration: seg * 0.6 }, start);
          const tap = s.querySelector(`.${styles.tap}`);
          tl.fromTo(tap, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, ease: "power1.out", duration: seg * 0.12 }, start + seg * 0.62);
          if (k < screens.length - 1) tl.to(s, { xPercent: -30, ease: "power2.inOut", duration: seg * 0.25 }, start + seg * 0.75);
        });
        // a slow push-in on the hand as the grid settles
        tl.to(hand, { scale: 1.06, ease: "none", duration: 0.3 }, 0.7);
      });
      // images and fonts change the page height: recalculate pin positions once they're in
      const refresh = () => ScrollTrigger.refresh();
      if (document.readyState === "complete") refresh();
      else window.addEventListener("load", refresh, { once: true });
      document.fonts.ready.then(refresh);
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section id="apps" className={styles.section} aria-labelledby="apps-title">
      {/* A. intro */}
      <div ref={introRef} className={styles.intro}>
        <div className={styles.words} aria-hidden="true">
          Android and iOS apps · designed to be used · Android and iOS apps · designed to be used ·
        </div>
        <div className={`container ${styles.introTop}`}>
          <h2 id="apps-title" className={styles.title}>
            <span className={styles.brace}>{"{"}</span>Apps<span className={styles.brace}>{"}"}</span> people
            <br /> actually use.
          </h2>
          <span className={styles.stars} aria-hidden="true">✳✳</span>
        </div>
        <div className={styles.pair} aria-hidden="true">
          <Phone src={SCREENS[0]} className={styles.phoneA} />
          <Phone src={SCREENS[1]} className={styles.phoneB} />
        </div>
        <div className={`container ${styles.introBottom}`}>
          <p>
            Android and iOS apps, designed to be used, not just looked at.
            <br />
            We plan them, build them and look after them.
          </p>
          <div className={styles.btns}>
            <Link href="/work/apps/" className="btn btn--light btn--sm">See all app work ↗</Link>
            <Link href="/talk/" className="btn btn--outline-light btn--sm">Get in touch</Link>
          </div>
        </div>
      </div>

      {/* B. pinned grid with the hand-held phone */}
      <div ref={gridRef} className={styles.gridWrap}>
        <div className={styles.grid}>
          {columns.map((col, c) => (
            <div key={c} className={styles.col} data-mid={c === 2 || undefined}>
              {col.map(({ app, src, key }, r) =>
                c === 2 && r === 2 ? (
                  <div key={key} className={styles.handSlot} />
                ) : (
                  <Link key={key} href={`/work/${app.slug}/`} className={styles.card} tabIndex={r === 0 ? 0 : -1}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" loading="lazy" draggable={false} />
                    <span className="sr-only">{app.title.startsWith("[") ? `App ${c * PER_COL + r + 1}` : app.title} app case study</span>
                  </Link>
                )
              )}
            </div>
          ))}
        </div>
        <div ref={handRef} className={styles.hand} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/hand-phone.webp" alt="" className={styles.handImg} draggable={false} width={1024} height={1536} />
          <div
            className={styles.screenSlot}
            style={{ left: `${SCREEN.left * 100}%`, top: `${SCREEN.top * 100}%`, width: `${SCREEN.width * 100}%`, height: `${SCREEN.height * 100}%` }}
          >
            {APP_HERO_SCREENS.map((src, k) => (
              <div key={src} className={styles.inScreen} style={{ zIndex: k + 1, transform: k ? "translateX(100%)" : undefined }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" draggable={false} />
                <span className={styles.tap} />
              </div>
            ))}
          </div>
        </div>
        <p className={styles.gridNote}>Every screen links to its case study.</p>
      </div>
    </section>
  );
}
