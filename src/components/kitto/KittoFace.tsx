"use client";
/**
 * Kitto's face, drawn for small places (the floating button): the head with its violet ears, big eyes
 * whose pupils follow the pointer, a pink nose, whiskers. It blinks at uneven intervals, flicks an ear
 * now and then, and smiles (the eyes turn to happy arcs) when `happy` is set.
 * With reduced motion it keeps still and only the smile changes.
 */
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import styles from "./KittoFace.module.css";

export function KittoFace({ size = 56, happy = false }: { size?: number; happy?: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();

  // blinks and ear flicks
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));
    const blink = () =>
      later(() => {
        el.dataset.blink = "";
        later(() => delete el.dataset.blink, 120);
        if (Math.random() < 0.3) later(() => { el.dataset.blink = ""; later(() => delete el.dataset.blink, 110); }, 240);
        blink();
      }, 2200 + Math.random() * 3400);
    const flick = () =>
      later(() => {
        el.dataset.flick = Math.random() < 0.5 ? "l" : "r";
        later(() => delete el.dataset.flick, 300);
        flick();
      }, 3500 + Math.random() * 5000);
    blink();
    flick();
    return () => timers.forEach(clearTimeout);
  }, [reduced]);

  // pupils follow the pointer
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    let raf = 0, px = 0, py = 0;
    const apply = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const dx = Math.max(-1, Math.min(1, (px - (r.left + r.width / 2)) / 300));
      const dy = Math.max(-1, Math.min(1, (py - (r.top + r.height / 2)) / 300));
      el.style.setProperty("--lx", `${(dx * 3.2).toFixed(2)}px`);
      el.style.setProperty("--ly", `${(dy * 2.6).toFixed(2)}px`);
      el.style.setProperty("--tilt", `${(dx * 5).toFixed(2)}deg`);
    };
    const on = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => {
      window.removeEventListener("pointermove", on);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <svg
      ref={ref}
      className={styles.face}
      data-happy={happy || undefined}
      data-still={reduced || undefined}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
    >
      <g className={styles.head}>
        {/* ears */}
        <g className={styles.earL}>
          <path d="M17 44 L22 8 L44 30 Z" fill="#0B0B0F" />
          <path d="M23 36 L25.5 16 L37 29 Z" fill="#5B5590" />
        </g>
        <g className={styles.earR}>
          <path d="M83 44 L78 8 L56 30 Z" fill="#0B0B0F" />
          <path d="M77 36 L74.5 16 L63 29 Z" fill="#5B5590" />
        </g>
        {/* head */}
        <ellipse cx="50" cy="58" rx="37" ry="32" fill="#0B0B0F" />
        <ellipse cx="38" cy="44" rx="14" ry="7" fill="#262531" opacity=".7" />
        {/* whiskers */}
        <g className={styles.whiskers} stroke="#9A97B0" strokeWidth="1.3" strokeLinecap="round" fill="none">
          <path d="M22 64 L4 61 M22 68 L5 70" />
          <path d="M78 64 L96 61 M78 68 L95 70" />
        </g>
        {/* eyes: open */}
        <g className={styles.eyes}>
          <ellipse cx="37" cy="56" rx="9.5" ry="11" fill="#fff" />
          <ellipse cx="63" cy="56" rx="9.5" ry="11" fill="#fff" />
          <ellipse className={styles.pupil} cx="38" cy="57" rx="4" ry="6" fill="#0B0B0F" />
          <ellipse className={styles.pupil} cx="62" cy="57" rx="4" ry="6" fill="#0B0B0F" />
          <circle className={styles.pupil} cx="40" cy="53" r="1.6" fill="#fff" />
          <circle className={styles.pupil} cx="64" cy="53" r="1.6" fill="#fff" />
        </g>
        {/* eyes: happy */}
        <g className={styles.smileEyes} fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round">
          <path d="M29 58 Q37 49 45 58" />
          <path d="M55 58 Q63 49 71 58" />
        </g>
        {/* nose and mouth */}
        <path d="M47.5 68 Q50 66.5 52.5 68 Q52 71 50 72 Q48 71 47.5 68 Z" fill="#E5A0A7" />
        <path className={styles.mouth} d="M45 75 Q50 71.5 55 75" fill="none" stroke="#5B5590" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  );
}
