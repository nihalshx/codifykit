"use client";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import styles from "./Kitto.module.css";

export type Mood =
  | "curious" | "happy" | "focused" | "sleepy" | "excited" | "surprised" | "thinking"
  | "grumpy" | "sad" | "look_left" | "look_right" | "wink" | "blink";

/** Rive emotion numbers, for when public/kitto/kitto.riv exists (see docs). */
export const MOOD_TO_EMOTION: Record<Mood, number> = {
  curious: 0, happy: 1, focused: 2, sleepy: 3, excited: 4, surprised: 5, thinking: 6,
  grumpy: 7, sad: 8, look_left: 9, look_right: 10, wink: 11, blink: 12,
};

const src = (mood: Mood) => `/kitto/emotions/kitto_${mood}.svg`;
const WAVE = "/kitto/poses/kitto_paw_wave.svg";
const HOP = "/kitto/poses/kitto_hop.svg";

/**
 * Kitto, SVG fallback version. Same API the Rive version will use:
 * <Kitto mood="thinking" size={360} wave={n} hop={n} />
 * Bump `wave` or `hop` (a counter) to trigger the one-off pose.
 */
export function Kitto({
  mood = "curious",
  size = 240,
  wave = 0,
  hop = 0,
  blink = true,
  className = "",
  label = "Kitto, the Codifykit cat",
}: {
  mood?: Mood;
  size?: number;
  wave?: number;
  hop?: number;
  blink?: boolean;
  className?: string;
  label?: string;
}) {
  const reduced = useReducedMotion();
  const [pose, setPose] = useState<string | null>(null);
  const [blinking, setBlinking] = useState(false);
  const [layers, setLayers] = useState<{ a: string; b: string | null }>({ a: src(mood), b: null });
  const first = useRef(true);

  // cross-fade between moods
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setLayers((l) => ({ a: src(mood), b: l.a }));
    const t = setTimeout(() => setLayers((l) => ({ ...l, b: null })), 140);
    return () => clearTimeout(t);
  }, [mood]);

  useEffect(() => {
    if (!wave) return;
    setPose(WAVE);
    const t = setTimeout(() => setPose(null), 1200);
    return () => clearTimeout(t);
  }, [wave]);

  useEffect(() => {
    if (!hop) return;
    setPose(HOP);
    const t = setTimeout(() => setPose(null), 420);
    return () => clearTimeout(t);
  }, [hop]);

  // occasional blink while curious / focused
  useEffect(() => {
    if (!blink || reduced || !(mood === "curious" || mood === "focused" || mood === "happy")) return;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        setBlinking(true);
        setTimeout(() => setBlinking(false), 140);
        loop();
      }, 2800 + Math.random() * 3200);
    };
    loop();
    return () => clearTimeout(t);
  }, [mood, blink, reduced]);

  const shown = pose ?? (blinking ? src("blink") : layers.a);

  return (
    <div
      className={`${styles.kitto} ${reduced ? "" : styles.bob} ${pose === HOP ? styles.hop : ""} ${className}`}
      style={{ width: size, height: size * 1.6 }}
      role="img"
      aria-label={label}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={shown} alt="" draggable={false} className={styles.layer} />
      {layers.b && !reduced && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={layers.b} alt="" draggable={false} className={`${styles.layer} ${styles.out}`} />
      )}
    </div>
  );
}
