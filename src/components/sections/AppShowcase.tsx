"use client";
/**
 * Apps section, signature #2. Spec: prompts/app-showcase-prompt.md (+ overrides in docs/04).
 * One scroll value `p` (0..1) from the sticky wrapper drives four beats:
 *   0.00-0.20 lift · 0.20-0.55 screen comes alive · 0.55-0.85 grid assembles · 0.85-1 settle
 */
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { APPS, APP_HERO_SCREENS } from "@/lib/content";
import { useMediaQuery, useReducedMotion } from "@/lib/useReducedMotion";
import styles from "./AppShowcase.module.css";

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
const span = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// where the screen sits on public/images/hand-phone.webp (1024 x 1536), measured from the green screen
const SCREEN = { left: 217 / 1024, top: 160 / 1536, width: 457 / 1024, height: 999 / 1536 };
const ORIGIN = `${((SCREEN.left + SCREEN.width / 2) * 100).toFixed(2)}% ${((SCREEN.top + SCREEN.height / 2) * 100).toFixed(2)}%`;

const GRID_APPS = APPS.slice(0, 9);
// 5 columns x 2 rows; the hand-held phone takes the centre-bottom cell (row 2, col 3)
const PHONE_CELL = 7;
const CELLS = Array.from({ length: 10 }, (_, i) => i);

// stable pseudo-random start offsets for the flying cards
const seeded = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

type Geo = { dx: number; dy: number; s: number };

function HeroScreens({ p }: { p: MotionValue<number> }) {
  const n = APP_HERO_SCREENS.length;
  const a = 0.2, b = 0.55;
  const seg = (b - a) / n;
  return (
    <div className={styles.screen}>
      {APP_HERO_SCREENS.map((src, k) => (
        <InScreen key={src} src={src} p={p} start={a + k * seg} seg={seg} first={k === 0} last={k === n - 1} />
      ))}
    </div>
  );
}

function InScreen({ src, p, start, seg, first, last }: { src: string; p: MotionValue<number>; start: number; seg: number; first: boolean; last: boolean }) {
  // 1) thumb-scroll its content  2) tap  3) native push to the next screen
  const y = useTransform(p, (v) => `${-48 * inOut(span(v, start, start + seg * 0.7))}%`);
  const x = useTransform(p, (v) => {
    const enter = first ? 1 : easeOut(span(v, start - seg * 0.15, start));
    const exit = last ? 0 : easeOut(span(v, start + seg * 0.85, start + seg));
    return `${(1 - enter) * 100 - exit * 30}%`;
  });
  const tapT = useTransform(p, (v) => span(v, start + seg * 0.68, start + seg * 0.84));
  const tapScale = useTransform(tapT, (t) => (t <= 0 ? 0 : t));
  const tapOpacity = useTransform(tapT, (t) => (t <= 0 || t >= 1 ? 0 : 1 - t));
  const dim = useTransform(p, (v) => (last ? 0 : 0.35 * easeOut(span(v, start + seg * 0.85, start + seg))));
  return (
    <motion.div className={styles.inScreen} style={{ x, zIndex: Math.round(start * 100) }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img src={src} alt="" style={{ y }} draggable={false} />
      <motion.span className={styles.tap} style={{ scale: tapScale, opacity: tapOpacity }} />
      <motion.span className={styles.dim} style={{ opacity: dim }} />
    </motion.div>
  );
}

function GridCard({ app, index, p, phoneCol, phoneRow, reduced }: { app: (typeof APPS)[number]; index: number; p: MotionValue<number>; phoneCol: number; phoneRow: number; reduced: boolean }) {
  const cell = index >= PHONE_CELL ? index + 1 : index;
  const col = cell % 5, row = Math.floor(cell / 5);
  const dist = Math.hypot(col - phoneCol, row - phoneRow) / Math.hypot(3, 1); // 0 near phone .. 1 far
  const start = 0.55 + dist * 0.15;
  const t = useTransform(p, (v) => (reduced ? 1 : easeOut(span(v, start, start + 0.15))));
  const ox = (seeded(index, 1) * 2 - 1) * 300, oy = (seeded(index, 2) * 2 - 1) * 200, orot = (seeded(index, 3) * 2 - 1) * 15;
  const parallax = col % 2 ? -20 : 20;
  const x = useTransform(t, (k) => (1 - k) * ox);
  const y = useTransform(p, (v) => (1 - t.get()) * oy + (reduced ? 0 : parallax * span(v, 0.7, 1)));
  const rotate = useTransform(t, (k) => (1 - k) * orot);
  const scale = useTransform(t, (k) => 0.85 + 0.15 * k);
  const opacity = t;
  return (
    <motion.div className={styles.cell} style={{ gridColumn: col + 1, gridRow: row + 1, x, y, rotate, scale, opacity }}>
      <Link href={`/work/${app.slug}/`} className={styles.appCard}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={app.screens[0]} alt="" loading="lazy" draggable={false} />
        <span className="sr-only">{app.title.startsWith("[") ? `App ${index + 1}` : app.title} app case study</span>
      </Link>
    </motion.div>
  );
}

export function AppShowcase() {
  const reduced = useReducedMotion();
  const mobile = useMediaQuery("(max-width: 767px)");
  const wrapRef = useRef<HTMLElement>(null);
  const handRef = useRef<HTMLDivElement>(null);
  const cellRef = useRef<HTMLDivElement>(null);
  const geo = useRef<Geo>({ dx: 0, dy: 0, s: 0.72 });
  const [, force] = useState(0);
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] });
  const p = useTransform(scrollYProgress, (v) => (reduced ? 1 : v));

  // measure: where the phone has to go to become the centre-bottom grid cell
  useLayoutEffect(() => {
    if (mobile) return;
    const measure = () => {
      const hand = handRef.current, cell = cellRef.current;
      if (!hand || !cell) return;
      const w = hand.offsetWidth, hh = hand.offsetHeight;
      // offsetLeft/Top ignore the CSS `translate: -50% -44%` on .hand, so add it back
      const h = { left: hand.offsetLeft - 0.5 * w, top: hand.offsetTop - 0.44 * hh, w, h: hh };
      // offsets relative to the same stage
      const cr = cell.getBoundingClientRect(), sr = hand.offsetParent!.getBoundingClientRect();
      const cx = cr.left - sr.left + cr.width / 2, cy = cr.top - sr.top + cr.height / 2;
      const ox = h.left + (SCREEN.left + SCREEN.width / 2) * h.w;
      const oy = h.top + (SCREEN.top + SCREEN.height / 2) * h.h;
      const s = Math.min(0.9, (cr.width * 1.04) / (SCREEN.width * h.w));
      geo.current = { dx: cx - ox, dy: cy - oy, s };
      force((n) => n + 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [mobile]);

  // Beat 1: the lift (with a 12px overshoot), then Beat 3: shrink into the grid cell
  const handX = useTransform(p, (v) => {
    const lift = easeOut(span(v, 0, 0.2));
    const toCell = mobile ? 0 : inOut(span(v, 0.55, 0.8));
    return (1 - lift) * 120 + toCell * geo.current.dx;
  });
  const handY = useTransform(p, (v) => {
    const a = span(v, 0, 0.17), b = span(v, 0.17, 0.2);
    const rise = a < 1 ? (1 - easeOut(a)) * 900 - 12 * easeOut(a) : -12 * (1 - easeOut(b));
    const toCell = mobile ? 0 : inOut(span(v, 0.55, 0.8));
    return rise + toCell * geo.current.dy;
  });
  const handRot = useTransform(p, (v) => 14 - 12 * easeOut(span(v, 0, 0.2)) - (mobile ? 0 : 2 * inOut(span(v, 0.55, 0.8))));
  const handScale = useTransform(p, (v) => (mobile ? 1 : 1 - (1 - geo.current.s) * inOut(span(v, 0.55, 0.8))));
  const ghost = useTransform(p, (v) => `${-v * 30}%`);

  useEffect(() => {
    // decode screens before the section shows up
    [...APP_HERO_SCREENS, ...GRID_APPS.map((a) => a.screens[0])].forEach((src) => {
      const i = new Image();
      i.src = src;
      i.decode().catch(() => undefined);
    });
  }, []);

  const head = (
    <div className={styles.head}>
      <p className={`label ${styles.label}`}>Apps</p>
      <h2 id="apps-title" className="h2">Apps people actually use.</h2>
      <p className={styles.sub}>Android and iOS apps, designed to be used, not just looked at.</p>
      <div className={styles.btns}>
        <Link href="/work/apps/" className="btn btn--light">See all app work ↗</Link>
        <Link href="/talk/" className="btn btn--outline-light">Get in touch</Link>
      </div>
    </div>
  );

  const hand = (
    <motion.div
      ref={handRef}
      className={styles.hand}
      style={reduced ? { transformOrigin: ORIGIN, x: geo.current.dx, y: geo.current.dy, scale: geo.current.s } : { transformOrigin: ORIGIN, x: handX, y: handY, rotate: handRot, scale: handScale }}
      aria-hidden="true"
    >
      <div className={reduced ? undefined : styles.breathe}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hand-phone.webp" alt="" className={styles.handImg} draggable={false} width={1024} height={1536} />
        <div
          className={styles.screenSlot}
          style={{ left: `${SCREEN.left * 100}%`, top: `${SCREEN.top * 100}%`, width: `${SCREEN.width * 100}%`, height: `${SCREEN.height * 100}%` }}
        >
          <HeroScreens p={p} />
        </div>
      </div>
    </motion.div>
  );

  if (mobile) {
    return (
      <section id="apps" className={styles.section} aria-labelledby="apps-title">
        <div ref={wrapRef as React.RefObject<HTMLDivElement>} className={styles.wrap} style={{ height: reduced ? "auto" : "250vh" }}>
          <div className={reduced ? styles.static : styles.sticky}>
            <div className={styles.glow} aria-hidden="true" />
            {head}
            <div className={styles.mobileStage}>{hand}</div>
          </div>
        </div>
        <div className={styles.swipe} role="list" aria-label="App work">
          {GRID_APPS.map((a, i) => (
            <Link role="listitem" key={a.slug} href={`/work/${a.slug}/`} className={styles.appCard}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.screens[0]} alt="" loading="lazy" />
              <span className="sr-only">{a.title.startsWith("[") ? `App ${i + 1}` : a.title} app case study</span>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="apps" className={styles.section} aria-labelledby="apps-title">
      <div ref={wrapRef as React.RefObject<HTMLDivElement>} className={styles.wrap} style={{ height: reduced ? "auto" : "400vh" }}>
        <div className={reduced ? styles.static : styles.sticky}>
          <div className={styles.glow} aria-hidden="true" />
          <motion.div className={styles.ghost} aria-hidden="true" style={{ x: ghost }}>
            Apps people actually use · Apps people actually use ·
          </motion.div>
          <div className={styles.layout}>
            {head}
            <div className={styles.stage}>
              <div className={styles.grid}>
                {CELLS.map((c) => (c === PHONE_CELL ? <div key="phone" ref={cellRef} className={styles.phoneCell} style={{ gridColumn: 3, gridRow: 2 }} /> : null))}
                {GRID_APPS.map((a, i) => (
                  <GridCard key={a.slug} app={a} index={i} p={p} phoneCol={2} phoneRow={1} reduced={reduced} />
                ))}
              </div>
              {hand}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
