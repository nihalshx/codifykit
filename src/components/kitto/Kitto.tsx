"use client";
/**
 * Kitto, alive. The mood drawings (public/kitto/emotions/*.svg) have named parts (tail, body, head,
 * ears, eyes, whiskers), so instead of showing a flat picture we put the drawing into the page and
 * move the parts: the tail sways, the body breathes, the eyes blink, an ear twitches now and then,
 * the eyes and head follow the pointer, a hover cheers Kitto up and a click makes it hop.
 * One-off poses (wave, hop) are whole drawings and still show as pictures for a moment.
 * With reduced motion Kitto sits still and only the mood changes.
 * Same API as before: <Kitto mood="thinking" size={360} wave={n} hop={n} />
 */
import { useEffect, useId, useRef, useState } from "react";
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

// each drawing is fetched once and shared
const cache = new Map<string, Promise<string>>();
const load = (url: string) => {
  if (!cache.has(url)) cache.set(url, fetch(url).then((r) => (r.ok ? r.text() : "")).catch(() => ""));
  return cache.get(url)!;
};

/** Makes a drawing safe to inline more than once: ids get a suffix, parts get data-part, pupils are marked. */
function prepare(svg: string, uid: string) {
  if (!svg) return "";
  let s = svg
    .replace(/<svg([^>]*?)\swidth="[^"]*"\s+height="[^"]*"/, '<svg$1 width="100%" height="100%"')
    .replace(/\sid="([^"]+)"/g, (_, id) => ` id="${id}-${uid}" data-part="${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${id}-${uid})`);
  // the pupils: the dark ellipses inside the eyes group
  const i = s.indexOf('data-part="eyes"');
  if (i >= 0) {
    const end = s.indexOf("</g>", i);
    const eyes = s.slice(i, end).replace(/<ellipse([^>]*fill="#0B0B0F"[^>]*)\/>/g, '<ellipse$1 data-part="pupil"/>');
    s = s.slice(0, i) + eyes + s.slice(end);
  }
  return s.replace("<svg", '<svg aria-hidden="true" focusable="false"');
}

export function Kitto({
  mood = "curious",
  size = 240,
  wave = 0,
  hop = 0,
  blink = true,
  follow = true,
  className = "",
  label = "Kitto, the Codifykit cat",
}: {
  mood?: Mood;
  size?: number;
  wave?: number;
  hop?: number;
  blink?: boolean;
  /** eyes and head follow the pointer */
  follow?: boolean;
  className?: string;
  label?: string;
}) {
  const reduced = useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const [pose, setPose] = useState<string | null>(null);
  const [hover, setHover] = useState(false);
  const [hops, setHops] = useState(0);
  const [html, setHtml] = useState("");
  const [squish, setSquish] = useState(0);

  // a hover cheers Kitto up, unless it is busy thinking or asleep
  const shown: Mood = hover && (mood === "curious" || mood === "focused") ? "happy" : mood;

  // load the drawing for the mood; a little squish marks the change
  useEffect(() => {
    let live = true;
    load(src(shown)).then((t) => {
      if (!live) return;
      setHtml(prepare(t, uid));
      setSquish((n) => n + 1);
    });
    return () => {
      live = false;
    };
  }, [shown, uid]);

  // one-off poses
  useEffect(() => {
    if (!wave || reduced) return;
    setPose(WAVE);
    const t = setTimeout(() => setPose(null), 1300);
    return () => clearTimeout(t);
  }, [wave, reduced]);
  useEffect(() => {
    if (!(hop + hops) || reduced) return;
    setPose(HOP);
    const t = setTimeout(() => setPose(null), 460);
    return () => clearTimeout(t);
  }, [hop, hops, reduced]);

  // blinks and ear twitches, at natural, uneven intervals
  useEffect(() => {
    const el = rootRef.current;
    if (!el || reduced) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));
    const blinkLoop = () =>
      later(() => {
        if (blink) {
          el.dataset.blink = "";
          later(() => delete el.dataset.blink, 130);
          // sometimes a double blink
          if (Math.random() < 0.25) later(() => { el.dataset.blink = ""; later(() => delete el.dataset.blink, 120); }, 260);
        }
        blinkLoop();
      }, 2400 + Math.random() * 3600);
    const twitchLoop = () =>
      later(() => {
        el.dataset.twitch = Math.random() < 0.5 ? "l" : "r";
        later(() => delete el.dataset.twitch, 320);
        twitchLoop();
      }, 4000 + Math.random() * 6000);
    blinkLoop();
    twitchLoop();
    return () => timers.forEach(clearTimeout);
  }, [blink, reduced]);

  // eyes and head follow the pointer
  useEffect(() => {
    const el = rootRef.current;
    if (!el || reduced || !follow) return;
    let raf = 0;
    let px = 0, py = 0;
    const apply = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const cx = r.left + r.width / 2, cy = r.top + r.height * 0.3;
      const dx = Math.max(-1, Math.min(1, (px - cx) / 420));
      const dy = Math.max(-1, Math.min(1, (py - cy) / 420));
      el.style.setProperty("--lx", `${(dx * 7).toFixed(2)}px`);
      el.style.setProperty("--ly", `${(dy * 6).toFixed(2)}px`);
      el.style.setProperty("--tilt", `${(dx * 6).toFixed(2)}deg`);
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
  }, [reduced, follow]);

  return (
    <div
      ref={rootRef}
      className={`${styles.kitto} ${reduced ? styles.still : ""} ${className}`}
      data-mood={shown}
      style={{ width: size, height: size * 1.6 }}
      role="img"
      aria-label={label}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={() => setHover(false)}
      onClick={() => setHops((n) => n + 1)}
    >
      <div
        key={squish}
        className={`${styles.drawing} ${pose ? styles.hidden : ""} ${reduced ? "" : styles.squish}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {pose && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={pose} alt="" draggable={false} className={`${styles.pose} ${pose === HOP ? styles.hop : ""}`} />
      )}
    </div>
  );
}
