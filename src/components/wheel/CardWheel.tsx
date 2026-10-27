"use client";
/**
 * The card wheel (homepage hero + /work/videos).
 * Spec: prompts/hero-wheel-prompt.md. Numbers are the spec's; comments name the concept.
 *
 * Two values drive everything: `deal` (0..1, the loader) and `lift` (0..1, the reveal).
 * One requestAnimationFrame loop writes inline styles, skipping writes that didn't change.
 */
import { useEffect, useRef, useState } from "react";
import type { WheelCard } from "@/lib/content";
import { Icon } from "@/components/ui/Logo";
import styles from "./CardWheel.module.css";

const DEAL_MS = 2600;
const LIFT_MS = 1900;
const HEADER_AT = 1000 / LIFT_MS; // header + headline come in ~1s into the lift

const outCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
const span = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
const wrap = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;

// cubic-bezier(.5, 0, .15, 1) for the lift
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= (sx(t) - x) / d;
    }
    return sy(clamp01(t));
  };
}
const strongEase = bezier(0.5, 0, 0.15, 1);

const TYPE_LABEL: Record<WheelCard["type"], string> = {
  reel: "Reel",
  app: "App",
  poster: "Poster",
  "ai-video": "AI video by Codifykit",
};

export function CardWheel({
  cards,
  intro = true,
  onIntroEnd,
  onCardOpen,
  children,
  className = "",
}: {
  cards: WheelCard[];
  /** true: run the deal + lift entrance (homepage). false: start in the final pose. */
  intro?: boolean;
  onIntroEnd?: () => void;
  /** If given, card clicks call this instead of following the link. */
  onCardOpen?: (card: WheelCard) => void;
  children?: React.ReactNode;
  className?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const skyRef = useRef<HTMLDivElement>(null);
  const cloudRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const dragMoved = useRef(false);
  const [phase, setPhase] = useState<"intro" | "done">(intro ? "intro" : "done");

  useEffect(() => {
    const frame = frameRef.current!;
    const stage = stageRef.current!;
    const n = cards.length;
    const step = 360 / n;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---- state ----
    let deal = intro && !reduced ? 0 : 1;
    let lift = intro && !reduced ? 0 : 1;
    let dealStart = -1;
    let liftStart = -1;
    const skipIntro = !intro || reduced;
    let assetsReady = skipIntro;
    let headerShown = skipIntro;
    let finished = skipIntro;
    let spin = 0; // visible angle
    let target = 0; // where drag/wheel wants the wheel
    let velocity = 0; // deg/s after a flick
    let dragging = false;
    let lastPointerX = 0;
    let lastMoveAt = 0;
    let dragVel = 0;
    let sceneScale = 1;
    let last = performance.now();
    let raf = 0;
    let visibleOnScreen = true;

    if (intro && !reduced) document.documentElement.dataset.intro = "running";

    // ---- assets: decode every cover before the deal starts, count real progress ----
    let loaded = 0;
    const setCounter = () => {
      const pct = Math.round((loaded / n) * 100);
      if (counterRef.current) counterRef.current.textContent = String(pct);
    };
    const decodes = cards.map((c) => {
      const img = new Image();
      img.src = c.cover;
      return img
        .decode()
        .catch(() => undefined)
        .then(() => {
          loaded++;
          setCounter();
        });
    });
    // never let a slow asset hold the page hostage
    const timeout = new Promise((r) => setTimeout(r, 6000));
    Promise.race([Promise.all(decodes), timeout]).then(() => {
      assetsReady = true;
      loaded = n;
      setCounter();
    });

    // ---- style cache: write only what changed ----
    const cache = new Map<string, string>();
    const set = (el: HTMLElement, key: string, prop: string, value: string) => {
      const k = key + prop;
      if (cache.get(k) === value) return;
      cache.set(k, value);
      el.style.setProperty(prop, value);
    };

    const measure = () => {
      const r = frame.getBoundingClientRect();
      // designed for a 640px-tall, 1000px+ wide frame; size to the frame, not the window
      sceneScale = Math.max(0.62, Math.min(r.height / 640, r.width / 700, 1.25));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(frame);

    const io = new IntersectionObserver(([e]) => (visibleOnScreen = e.isIntersecting), { threshold: 0 });
    io.observe(frame);

    const endIntro = () => {
      if (finished) return;
      finished = true;
      deal = 1;
      lift = 1;
      if (!headerShown) showHeader();
      setPhase("done");
      onIntroEnd?.();
    };
    const showHeader = () => {
      headerShown = true;
      delete document.documentElement.dataset.intro;
      frame.dataset.headline = "in";
    };
    if (skipIntro) {
      frame.dataset.headline = "in";
      if (reduced && intro) {
        setPhase("done");
        onIntroEnd?.();
      }
    }

    // ---- the frame loop ----
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // entrance clocks
      if (!finished) {
        if (dealStart < 0 && loaded > 0) dealStart = now; // start once the first cover is decoded
        if (dealStart >= 0) deal = Math.min(1, (now - dealStart) / DEAL_MS);
        if (deal >= 1 && assetsReady && liftStart < 0) liftStart = now;
        if (liftStart >= 0) {
          const t = Math.min(1, (now - liftStart) / LIFT_MS);
          lift = strongEase(t);
          if (!headerShown && t >= HEADER_AT) showHeader();
          if (t >= 1) endIntro();
        }
      }

      if (!visibleOnScreen && finished) return;

      // drift + follow
      if (!reduced && !dragging) {
        target += 7 * lift * dt; // slow drift, same direction as the opening turn
        if (Math.abs(velocity) > 0.01) {
          target += velocity * dt;
          velocity *= Math.exp(-dt * 3.2);
        }
      }
      spin += (target - spin) * (1 - Math.exp(-dt * 9));

      // wheel geometry (bigger cards need a bigger wheel and a lower pivot)
      const radius = 580 + 430 * lift;
      const pivot = 500 + 314 * lift;
      const grow = 1 + 0.35 * lift;
      const kick = -28 * lift; // opening turn, to the left like the drift

      set(
        stage,
        "s",
        "transform",
        `translateY(${(60 - 10 * lift).toFixed(2)}px) rotateX(${(12 * lift).toFixed(2)}deg) scale(${(sceneScale * (1 + 0.14 * lift)).toFixed(4)})`
      );
      if (skyRef.current) set(skyRef.current, "sky", "opacity", lift.toFixed(3));
      if (cloudRef.current)
        set(cloudRef.current, "cl", "transform", `translateY(${((1 - lift) * 105).toFixed(1)}%)`);
      if (loaderRef.current) set(loaderRef.current, "ld", "opacity", (1 - Math.min(1, lift * 2)).toFixed(3));

      for (let i = 0; i < n; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const home = wrap(i * step - spin + kick);
        const away = Math.abs(home);
        // deal from the top outwards: each card gets its own slice of the deal
        const order = Math.min(away, 100) / 100;
        const p = outCubic(span(deal, order * 0.6, order * 0.6 + 0.4));
        const visible = p > 0 && away < 105;
        set(el, "v" + i, "visibility", visible ? "visible" : "hidden");
        if (!visible) continue;
        set(
          el,
          "t" + i,
          "transform",
          `translate3d(0, ${pivot.toFixed(1)}px, ${(-away * 0.5).toFixed(1)}px)` +
            ` rotateZ(${(home + (1 - p) * 70).toFixed(2)}deg)` +
            ` translate3d(0, ${(-radius * p + (1 - p) * 140).toFixed(1)}px, 0)` +
            ` rotateY(${((1 - p) * 180).toFixed(1)}deg)` +
            ` scale(${((0.7 + 0.3 * p) * grow).toFixed(4)})`
        );

        // video: only near the top, only after the lift is mostly done
        const v = videoRefs.current[i];
        if (v) {
          const shouldPlay = !reduced && lift > 0.6 && away < 40 && visibleOnScreen;
          if (shouldPlay && v.paused) {
            if (v.preload !== "auto") v.preload = "auto";
            v.play().catch(() => undefined);
          } else if (!shouldPlay && !v.paused) {
            v.pause();
          }
        }
      }
    };
    raf = requestAnimationFrame(tick);

    // ---- escapes ----
    const onKey = (e: KeyboardEvent) => {
      if (finished) return;
      if (e.key === "Escape" || e.key === "Tab") endIntro();
    };
    window.addEventListener("keydown", onKey);
    const skip = skipRef.current;
    const onSkip = () => endIntro();
    skip?.addEventListener("click", onSkip);

    // ---- gestures: drag, horizontal wheel, swipe ----
    const pxToDeg = (px: number) => (px / ((580 + 430 * lift) * sceneScale * (1 + 0.14 * lift))) * (180 / Math.PI);
    let downX = 0;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      dragMoved.current = false;
      downX = lastPointerX = e.clientX;
      lastMoveAt = performance.now();
      dragVel = 0;
      velocity = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastPointerX;
      lastPointerX = e.clientX;
      if (Math.abs(e.clientX - downX) > 6 && !dragMoved.current) {
        dragMoved.current = true;
        frame.setPointerCapture?.(e.pointerId);
      }
      const d = -pxToDeg(dx);
      target += d;
      const dtm = Math.max(1, now - lastMoveAt) / 1000;
      dragVel = dragVel * 0.6 + (d / dtm) * 0.4;
      lastMoveAt = now;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      // a pause before letting go cancels the flick
      velocity = performance.now() - lastMoveAt > 80 ? 0 : Math.max(-400, Math.min(400, dragVel));
    };
    const onWheel = (e: WheelEvent) => {
      // horizontal wheel / trackpad swipe turns the wheel; vertical scroll stays with the page
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (!dx) return;
      e.preventDefault();
      target += pxToDeg(dx) * 0.8;
    };
    frame.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    frame.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("keydown", onKey);
      skip?.removeEventListener("click", onSkip);
      frame.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      frame.removeEventListener("wheel", onWheel);
      delete document.documentElement.dataset.intro;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, intro]);

  const onCardClick = (e: React.MouseEvent, card: WheelCard) => {
    // a drag must never trigger a card's link
    if (dragMoved.current) {
      e.preventDefault();
      return;
    }
    if (onCardOpen) {
      e.preventDefault();
      onCardOpen(card);
    }
  };

  return (
    <div ref={frameRef} className={`${styles.frame} ${className}`} data-phase={phase}>
      <div ref={skyRef} className={styles.sky} aria-hidden="true" style={{ opacity: intro ? 0 : 1 }}>
        <span className={styles.glowA} />
        <span className={styles.glowB} />
        <span className={styles.stars} />
      </div>

      <div className={styles.viewport}>
        <div ref={stageRef} className={styles.stage}>
          {cards.map((c, i) => (
            <a
              key={c.id + i}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              href={c.href}
              className={styles.card}
              style={{ visibility: "hidden" }}
              onClick={(e) => onCardClick(e, c)}
              draggable={false}
              aria-label={`${c.label.startsWith("[") ? TYPE_LABEL[c.type] : c.label} — ${TYPE_LABEL[c.type]}`}
            >
              <span className={styles.front}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.cover} alt="" draggable={false} decoding="async" />
                {c.video && (
                  <video
                    ref={(el) => {
                      videoRefs.current[i] = el;
                    }}
                    className={styles.preview}
                    src={c.video}
                    muted
                    loop
                    playsInline
                    preload="none"
                    onPlaying={(e) => e.currentTarget.setAttribute("data-playing", "")}
                    onPause={(e) => e.currentTarget.removeAttribute("data-playing")}
                  />
                )}
                <span className={styles.tag}>{TYPE_LABEL[c.type]}</span>
              </span>
              <span className={styles.back} aria-hidden="true">
                <Icon size={44} />
              </span>
            </a>
          ))}
        </div>
      </div>

      <div ref={cloudRef} className={styles.clouds} aria-hidden="true" style={intro ? undefined : { transform: "none" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hero-clouds.webp" alt="" draggable={false} />
        <span />
      </div>

      {intro && phase === "intro" && (
        <>
          <div ref={loaderRef} className={styles.loader} aria-live="polite">
            <span className={styles.word}>Codifykit.</span>
            <span className={styles.counter}>
              <span ref={counterRef}>0</span>
              <small>%</small>
            </span>
          </div>
          <button ref={skipRef} type="button" className={styles.skip}>
            Skip intro
          </button>
        </>
      )}
      {children}
    </div>
  );
}
