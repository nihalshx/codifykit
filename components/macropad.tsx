"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { Code2, Compass, CornerDownLeft, Megaphone, Palette, Share2 } from "lucide-react";
import { LogoMark } from "./logo";

type KeyId = "logo" | "web" | "social" | "ads" | "brand" | "strategy" | "grow";

type KeyDef = {
  id: KeyId;
  label: string;
  hotkey: string;
  /** physical KeyboardEvent.key values that press this key */
  match: string[];
  icon?: ReactNode;
  area: string;
  variant: "logo" | "accent" | "base";
};

const KEYS: KeyDef[] = [
  { id: "logo", label: "Codifykit", hotkey: "C", match: ["c", "k"], area: "1 / 1 / 3 / 3", variant: "logo" },
  { id: "web", label: "Web", hotkey: "W", match: ["w"], icon: <Code2 />, area: "1 / 3 / 2 / 4", variant: "base" },
  { id: "social", label: "Social", hotkey: "S", match: ["s"], icon: <Share2 />, area: "1 / 4 / 2 / 5", variant: "base" },
  { id: "ads", label: "Ads", hotkey: "A", match: ["a"], icon: <Megaphone />, area: "2 / 3 / 3 / 4", variant: "base" },
  { id: "brand", label: "Brand", hotkey: "B", match: ["b"], icon: <Palette />, area: "2 / 4 / 3 / 5", variant: "base" },
  { id: "strategy", label: "Strategy", hotkey: "T", match: ["t"], icon: <Compass />, area: "3 / 1 / 4 / 3", variant: "base" },
  { id: "grow", label: "Grow", hotkey: "↵", match: ["Enter"], icon: <CornerDownLeft />, area: "3 / 3 / 4 / 5", variant: "accent" },
];

const SKIRT: Record<KeyDef["variant"], string> = {
  logo: "linear-gradient(180deg,#2b2a8f 0%,#14136a 60%,#0b0b4a 100%)",
  accent: "linear-gradient(180deg,#9c90e6 0%,#6a5ad8 70%,#4b3fb5 100%)",
  base: "linear-gradient(180deg,#22244f 0%,#15163a 65%,#0e0f2b 100%)",
};
const TOP: Record<KeyDef["variant"], string> = {
  logo: "linear-gradient(140deg,#03031a 0%,#0b0b5c 45%,#3a3aa8 78%,#9ec9ec 120%)",
  accent: "linear-gradient(160deg,#d9d2ff 0%,#b8acef 45%,#8fc8ec 100%)",
  base: "linear-gradient(170deg,#2c2f63 0%,#1b1d48 55%,#16173c 100%)",
};
const DEPTH: Record<KeyDef["variant"], string> = {
  logo: "#07072e",
  accent: "#2e2588",
  base: "#08091f",
};

function Keycap({ def, pressed, onPress }: { def: KeyDef; pressed: boolean; onPress: (down: boolean) => void }) {
  const d = def.variant === "logo" ? 10 : 7;
  const style: CSSProperties = {
    gridArea: def.area,
    background: SKIRT[def.variant],
    transform: `translateY(${pressed ? d - 2 : 0}px)`,
    boxShadow: pressed
      ? `0 2px 0 0 ${DEPTH[def.variant]}, 0 4px 10px -4px rgb(0 0 0 / .7), inset 0 1px 0 rgb(255 255 255 / .12)`
      : `0 ${d}px 0 0 ${DEPTH[def.variant]}, 0 ${d + 10}px 26px -8px rgb(0 0 0 / .75), inset 0 1px 0 rgb(255 255 255 / .12)`,
  };

  return (
    <button
      type="button"
      tabIndex={-1}
      onPointerDown={() => onPress(true)}
      onPointerUp={() => onPress(false)}
      onPointerLeave={() => pressed && onPress(false)}
      style={style}
      className="relative cursor-pointer select-none rounded-[16px] border border-white/10 transition-[transform,box-shadow] duration-75 ease-out"
    >
      {/* dished top surface */}
      <span
        className="absolute inset-x-[7%] bottom-[14%] top-[5%] overflow-hidden rounded-[11px]"
        style={{
          background: TOP[def.variant],
          boxShadow: "inset 0 1px 0 rgb(255 255 255 / .22), inset 0 -6px 12px rgb(0 0 0 / .25)",
        }}
      >
        <span className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgb(255_255_255/.10),transparent_60%)]" />
        <span
          className={`absolute left-2 top-1.5 font-display text-[10px] font-semibold ${
            def.variant === "accent" ? "text-ink/60" : "text-white/45"
          }`}
        >
          {def.hotkey}
        </span>

        {def.variant === "logo" ? (
          <span className="absolute inset-0 grid place-items-center">
            <LogoMark
              className={`h-[46%] w-auto text-white transition-[filter] duration-150 ${
                pressed
                  ? "drop-shadow-[0_0_18px_rgb(184_172_239/1)]"
                  : "drop-shadow-[0_0_10px_rgb(184_172_239/.55)]"
              }`}
            />
            <span className="absolute bottom-2 right-2.5 font-display text-[9px] font-medium tracking-[0.18em] text-white/40">
              CODIFYKIT
            </span>
          </span>
        ) : (
          <span
            className={`absolute inset-0 flex flex-col items-center justify-center gap-1 ${
              def.variant === "accent" ? "text-ink" : "text-white/85"
            } [&_svg]:size-4`}
          >
            {def.icon}
            <span className="font-display text-[11px] font-medium tracking-wide sm:text-xs">{def.label}</span>
          </span>
        )}
      </span>
    </button>
  );
}

export function Macropad() {
  const [pressed, setPressed] = useState<Set<KeyId>>(new Set());
  const [ripples, setRipples] = useState<number[]>([]);
  const [hits, setHits] = useState(0);
  const lastUser = useRef(0);
  const ref = useRef<HTMLDivElement>(null);

  const rx = useSpring(useMotionValue(16), { stiffness: 120, damping: 18 });
  const ry = useSpring(useMotionValue(-10), { stiffness: 120, damping: 18 });

  const setKey = useCallback((id: KeyId, down: boolean) => {
    setPressed((prev) => {
      if (prev.has(id) === down) return prev;
      const next = new Set(prev);
      if (down) next.add(id);
      else next.delete(id);
      return next;
    });
    if (down) {
      setHits((h) => h + 1);
      if (id === "logo") {
        const r = Date.now() + Math.random();
        setRipples((rs) => [...rs, r]);
        setTimeout(() => setRipples((rs) => rs.filter((x) => x !== r)), 900);
      }
    }
  }, []);

  const tap = useCallback(
    (id: KeyId, ms = 150) => {
      setKey(id, true);
      setTimeout(() => setKey(id, false), ms);
    },
    [setKey],
  );

  // Physical keyboard: C presses the logo key, W/S/A/B/T/Enter press the rest.
  useEffect(() => {
    const find = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return null;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, button, a, [contenteditable]")) return null;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      return KEYS.find((x) => x.match.includes(k)) ?? null;
    };
    const down = (e: KeyboardEvent) => {
      const def = find(e);
      if (!def || e.repeat) return;
      lastUser.current = Date.now();
      setKey(def.id, true);
    };
    const up = (e: KeyboardEvent) => {
      const def = find(e);
      if (def) setKey(def.id, false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [setKey]);

  // Idle "demo typing" — pauses while the visitor plays with it.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let n = 0;
    const order: KeyId[] = ["web", "social", "ads", "brand", "strategy", "grow"];
    const t = setInterval(() => {
      if (Date.now() - lastUser.current < 5000) return;
      n++;
      if (n % 7 === 0) tap("logo", 220);
      else tap(order[Math.floor(Math.random() * order.length)]);
    }, 750);
    return () => clearInterval(t);
  }, [tap]);

  // Tilt toward the pointer.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
      const y = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
      rx.set(16 - y * 14);
      ry.set(-10 + x * 22);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [rx, ry]);

  const logoDown = pressed.has("logo");

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[440px] [perspective:1200px]">
      {/* RGB underglow */}
      <div
        aria-hidden
        className={`absolute inset-[6%] rounded-[40px] bg-[conic-gradient(from_180deg,#6a5ad8,#7cc4ea,#2b3fd6,#b8acef,#6a5ad8)] blur-3xl transition-opacity duration-200 ${
          logoDown ? "opacity-90" : "opacity-45"
        }`}
      />

      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="relative rounded-[30px] border border-white/10 bg-[linear-gradient(160deg,#141640_0%,#0a0b2a_60%,#070820_100%)] p-4 shadow-[0_40px_80px_-30px_rgb(0_0_0/.9),inset_0_1px_0_rgb(255_255_255/.08)] sm:p-5"
      >
        {/* plate header */}
        <div className="mb-4 flex items-center justify-between px-1">
          <span className="font-display text-[11px] font-medium tracking-[0.22em] text-mist/50">CK — MK01</span>
          <span className="flex items-center gap-2">
            <span className="font-mono text-[10px] tabular-nums text-mist/40">{String(hits).padStart(4, "0")}</span>
            <span
              className={`size-2 rounded-full transition-all duration-100 ${
                pressed.size ? "bg-sky shadow-[0_0_10px_2px_rgb(124_196_234/.9)]" : "bg-white/15"
              }`}
            />
          </span>
        </div>

        {/* switch plate */}
        <div className="relative rounded-[20px] bg-black/40 p-3 shadow-[inset_0_2px_10px_rgb(0_0_0/.6)]">
          <div className="grid grid-cols-4 grid-rows-[repeat(3,minmax(0,1fr))] gap-2.5 [aspect-ratio:4/3.15] sm:gap-3">
            {KEYS.map((def) => (
              <Keycap key={def.id} def={def} pressed={pressed.has(def.id)} onPress={(d) => {
                lastUser.current = Date.now();
                setKey(def.id, d);
              }} />
            ))}
          </div>

          {/* ripple from the logo key */}
          <div className="pointer-events-none absolute left-3 top-3 h-[calc((100%-1.5rem)*2/3)] w-[calc((100%-1.5rem)/2)]">
            <AnimatePresence>
              {ripples.map((r) => (
                <motion.span
                  key={r}
                  initial={{ opacity: 0.8, scale: 0.96 }}
                  animate={{ opacity: 0, scale: 1.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.85, ease: "easeOut" }}
                  className="absolute inset-0 rounded-[18px] border-2 border-lavender/80 shadow-[0_0_24px_rgb(184_172_239/.6)]"
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <p className="mx-auto mt-8 hidden w-fit items-center justify-center gap-2 rounded-full border border-white/10 bg-ink/70 px-3.5 py-1.5 text-xs text-mist/80 backdrop-blur sm:flex">
        Press
        <kbd className="rounded-md border border-white/15 bg-white/5 px-1.5 py-0.5 font-display text-[11px] text-white shadow-[0_2px_0_rgb(255_255_255/.08)]">
          C
        </kbd>
        on your keyboard
      </p>
    </div>
  );
}
