"use client";
/**
 * Homepage hero: the loader and the hero are the same 3D scene (plain CSS 3D, Motion).
 *
 *  formation (0..1, 2.6s linear)  the loader: cards are dealt from a stack at the front around the ring
 *  expansion (0..1, 1.9s strong)  the reveal: small tilted ring seen from outside -> camera inside a big ring
 *
 * Nothing else is animated by hand: every pose comes from reelPose(angle, formation, sceneAt(expansion)).
 * 16 DOM cards show any number of reels by recycling when they pass behind the camera.
 * Backdrop: crumpled graph paper with purple clouds in front of (and behind) the wall.
 */
import { useEffect, useRef, useState } from "react";
import { animate, useAnimationFrame, useMotionValue, useSpring } from "motion/react";
import type { WheelCard } from "@/lib/content";
import { CARD_H, CARD_W, SLOTS, clamp01, reelForSlot, reelPose, sceneAt, slotAngle, wrapDeg } from "./reelPose";
import styles from "./HeroReels.module.css";

const TYPE_LABEL: Record<WheelCard["type"], string> = {
  reel: "Reel",
  app: "App",
  poster: "Poster",
  "ai-video": "AI video by Codifykit",
};
const FORMATION_S = 2.6;
const EXPANSION_S = 1.9;
const STRONG = [0.5, 0, 0.15, 1] as const;
const DESIGN = { w: 1440, h: 820 }; // the scene's numbers are tuned for a frame this size
const labelFor = (c: WheelCard) => (c.label.startsWith("[") ? TYPE_LABEL[c.type] : c.label);

// ---------------------------------------------------------------- loader bits
function RollingCounter({ value }: { value: number }) {
  const digits = String(Math.round(value)).padStart(3, "0").split("");
  return (
    <span className={styles.counter} aria-label={`${Math.round(value)} percent loaded`}>
      {digits.map((d, i) => (
        <span key={i} className={styles.digit} aria-hidden="true">
          <span className={styles.strip} style={{ transform: `translateY(${-Number(d) * 10}%)` }}>
            {"0123456789".split("").map((n) => (
              <span key={n}>{n}</span>
            ))}
          </span>
        </span>
      ))}
      <small aria-hidden="true">%</small>
    </span>
  );
}

function Scramble({ text }: { text: string }) {
  const [out, setOut] = useState(text);
  useEffect(() => {
    const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#*+";
    let frame = 0;
    let raf = 0;
    const run = () => {
      frame++;
      const settled = Math.floor(frame / 2);
      setOut(text.split("").map((c, i) => (c === " " || i < settled ? c : glyphs[(Math.random() * glyphs.length) | 0])).join(""));
      if (settled < text.length) raf = requestAnimationFrame(run);
    };
    run();
    const again = setInterval(() => {
      frame = 0;
      run();
    }, 2600);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(again);
    };
  }, [text]);
  return <span className={styles.caption}>{out}</span>;
}

// ---------------------------------------------------------------- the scene
export function HeroReels({
  cards,
  intro = true,
  box = false,
  onCardOpen,
  children,
}: {
  cards: WheelCard[];
  intro?: boolean;
  /** fill the parent as a plain rounded frame (no header / headline space), e.g. /work/videos */
  box?: boolean;
  onCardOpen?: (card: WheelCard) => void;
  children?: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const scalerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const cloudsBackRef = useRef<HTMLDivElement>(null);
  const cloudsFrontRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const slotRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const tagRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // ---- the two values that drive everything, plus the ring's spin
  const formation = useMotionValue(intro ? 0 : 1);
  const expansion = useMotionValue(intro ? 0 : 1);
  const spinTarget = useMotionValue(0);
  const spin = useSpring(spinTarget, { stiffness: 70, damping: 22, mass: 1 });

  const [phase, setPhase] = useState<"intro" | "live">(intro ? "intro" : "live");
  const [progress, setProgress] = useState(0);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);

  // per-frame state kept outside React
  const live = useRef({
    reduced: false,
    finished: !intro,
    dragging: false,
    dragMoved: false,
    lastX: 0,
    lastT: 0,
    vel: 0, // deg/s after a flick
    pointer: null as null | { x: number; y: number },
    frameNo: 0,
    hovered: -1,
    fit: 1,
    cache: new Map<string, string>(),
    slotReel: Array.from({ length: SLOTS }, (_, s) => s % Math.max(1, cards.length)),
  });

  const write = (el: HTMLElement | null, key: string, prop: string, value: string) => {
    if (!el) return;
    const c = live.current.cache;
    if (c.get(key + prop) === value) return;
    c.set(key + prop, value);
    el.style.setProperty(prop, value);
  };

  // ---- end the entrance (skip, Escape, Tab, or the expansion finishing)
  const finish = () => {
    const L = live.current;
    if (L.finished) return;
    L.finished = true;
    formation.stop();
    expansion.stop();
    formation.set(1);
    expansion.set(1);
    document.documentElement.style.overflow = "";
    delete document.documentElement.dataset.intro;
    setPhase("live");
  };

  // ---- entrance: formation first; expansion once formation is done AND the assets are ready
  useEffect(() => {
    const html = document.documentElement;
    const L = live.current;
    L.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!intro || L.reduced) {
      formation.set(1);
      expansion.set(1);
      L.finished = true;
      if (intro) {
        delete html.dataset.intro;
        setPhase("live");
      }
      return;
    }
    html.dataset.intro = "running";
    html.style.overflow = "hidden";
    // scroll does nothing while the entrance plays
    const block = (e: Event) => !L.finished && e.preventDefault();
    window.addEventListener("wheel", block, { passive: false });
    window.addEventListener("touchmove", block, { passive: false });

    // real progress: covers (and video previews) of the cards that face the camera when the wall opens
    const facing = Array.from({ length: SLOTS }, (_, s) => s).filter((s) => Math.abs(wrapDeg(slotAngle(s))) <= 100);
    const urls = facing.flatMap((s) => {
      const c = cards[s % cards.length];
      return c.video ? [c.cover, c.video] : [c.cover];
    });
    let done = 0;
    const tick = () => setProgress((++done / urls.length) * 100);
    const loads = urls.map(
      (u) =>
        new Promise<void>((resolve) => {
          if (/\.(mp4|webm|mov)$/i.test(u)) {
            const v = document.createElement("video");
            v.preload = "metadata";
            v.muted = true;
            v.onloadeddata = v.onerror = () => resolve();
            v.src = u;
          } else {
            const img = new Image();
            img.onload = () => img.decode().catch(() => undefined).then(() => resolve());
            img.onerror = () => resolve();
            img.src = u;
          }
        }).then(tick)
    );
    // warm the rest of the reels in the background
    cards.forEach((c) => (new Image().src = c.cover));
    const assets = Promise.race([Promise.all(loads), new Promise((r) => setTimeout(r, 8000))]);

    const formAnim = animate(formation, 1, { duration: FORMATION_S, ease: "linear" });
    let cancelled = false;
    Promise.all([formAnim.finished, assets]).then(() => {
      if (cancelled || L.finished) return;
      setProgress(100);
      flyWord();
      animate(expansion, 1, { duration: EXPANSION_S, ease: STRONG }).finished.then(() => !cancelled && finish());
    });

    const onKey = (e: KeyboardEvent) => {
      if (!L.finished && (e.key === "Escape" || e.key === "Tab")) finish();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelled = true;
      formAnim.stop();
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", block);
      window.removeEventListener("touchmove", block);
      html.style.overflow = "";
      delete html.dataset.intro;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // the brand word flies into the header wordmark's exact position and size
  const flyWord = () => {
    const word = wordRef.current;
    const logo = document.querySelector<SVGElement>('header a[aria-label="Codifykit home"] svg');
    if (!word || !logo) return;
    const from = word.getBoundingClientRect();
    const to = logo.getBoundingClientRect();
    // the wordmark is the part of the logo right of the icon (x 104..410 of a 23..410 viewBox)
    const wordLeft = to.left + to.width * ((104 - 23) / 387.5);
    const wordWidth = to.width * ((410 - 104) / 387.5);
    const s = wordWidth / from.width;
    animate(word, { x: wordLeft - from.left, y: to.top + to.height / 2 - (from.top + from.height / 2), scale: s }, { duration: 1.05, ease: STRONG });
    animate(word, { opacity: 0 }, { duration: 0.3, delay: 1.0 });
  };

  // ---- frame size -> scene fit
  useEffect(() => {
    const stage = stageRef.current!;
    const ro = new ResizeObserver(() => {
      const r = stage.getBoundingClientRect();
      live.current.fit = Math.max(0.42, Math.min(r.width / DESIGN.w, r.height / DESIGN.h, 1.3));
    });
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  // ---- one loop for everything
  useAnimationFrame((_, delta) => {
    const L = live.current;
    const dt = Math.min(0.05, delta / 1000);
    L.frameNo++;
    const f = formation.get();
    const e = expansion.get();

    // drift + flick glide (the visible angle follows spinTarget through the spring)
    if (!L.reduced && !L.dragging) {
      const drift = L.finished ? 5 : 14 * (1 - e) + 5 * e;
      spinTarget.set(spinTarget.get() + (drift + L.vel) * dt);
      L.vel *= Math.exp(-dt * 2.6);
    }
    const a0 = spin.get();
    const scene = sceneAt(e);

    // shared ring values as CSS variables on the ring element
    const ring = ringRef.current;
    write(stageRef.current, "st", "perspective", `${scene.perspective.toFixed(1)}px`);
    write(ring, "ring", "--R", scene.radius.toFixed(1));
    write(ring, "ring", "--s", scene.scale.toFixed(4));
    // ring centre on the z = 0 plane; the CSS camera sits `perspective` px in front of it
    write(ring, "ring", "transform", `rotateZ(${scene.roll.toFixed(2)}deg) rotateX(${scene.tilt.toFixed(2)}deg)`);
    write(scalerRef.current, "sc", "transform", `scale(${L.fit.toFixed(4)})`);

    // the handoff: overlapped, never queued
    if (!box) {
      const k = clamp01((e - 0.42) / 0.58);
      const kk = k * k * (3 - 2 * k);
      const mobile = window.innerWidth < 768;
      const top = kk * (mobile ? 72 : 80), side = kk * 16, bottom = kk * (mobile ? 30 : 24);
      write(frameRef.current, "fr", "clip-path", `inset(${top.toFixed(1)}px ${side.toFixed(1)}px ${bottom.toFixed(2)}% ${side.toFixed(1)}px round ${(kk * 28).toFixed(1)}px)`);
      write(stageRef.current, "st", "inset", `${top.toFixed(1)}px ${side.toFixed(1)}px ${bottom.toFixed(2)}% ${side.toFixed(1)}px`);
      write(backdropRef.current, "bd", "opacity", (1 - clamp01((e - 0.04) / 0.5)).toFixed(3));
      write(loaderRef.current, "ld", "opacity", (1 - clamp01(e / 0.25)).toFixed(3));
      write(skipRef.current, "sk", "opacity", (1 - clamp01(e / 0.3)).toFixed(3));
      write(skipRef.current, "sk", "visibility", e < 0.3 ? "visible" : "hidden");
      if (e > 0.62 && document.documentElement.dataset.intro) delete document.documentElement.dataset.intro;
    }
    const c = clamp01((e - 0.2) / 0.6);
    const cc = 1 - Math.pow(1 - c, 3);
    const drift = (a0 * 3) % 400;
    write(cloudsFrontRef.current, "cf", "transform", `translate3d(${(-drift * 0.5).toFixed(1)}px, ${((1 - cc) * 70).toFixed(1)}%, 0)`);
    write(cloudsFrontRef.current, "cf", "opacity", cc.toFixed(3));
    write(cloudsBackRef.current, "cb", "transform", `translate3d(${(-drift * 0.25).toFixed(1)}px, ${((1 - cc) * 40).toFixed(1)}%, 0)`);
    write(cloudsBackRef.current, "cb", "opacity", (cc * 0.85).toFixed(3));

    // the cards
    for (let s = 0; s < SLOTS; s++) {
      const el = slotRefs.current[s];
      if (!el) continue;
      const angle = slotAngle(s) + a0;
      const pose = reelPose(angle, f, scene);
      const hidden = pose.behindCamera || pose.appear <= 0;
      write(el, `c${s}`, "visibility", hidden ? "hidden" : "visible");
      if (hidden) {
        // recycle while it can't be seen
        const reel = reelForSlot(s, a0, cards.length);
        if (reel !== L.slotReel[s]) {
          L.slotReel[s] = reel;
          const card = cards[reel];
          const img = imgRefs.current[s];
          if (img) img.src = card.cover;
          const tag = tagRefs.current[s];
          if (tag) tag.textContent = TYPE_LABEL[card.type];
          el.href = card.href;
          el.setAttribute("aria-label", `${labelFor(card)}, ${TYPE_LABEL[card.type]}`);
          const v = videoRefs.current[s];
          if (v) {
            v.pause();
            v.removeAttribute("data-playing");
            if (card.video) v.src = card.video;
            else v.removeAttribute("src");
          }
        }
        continue;
      }
      write(el, `c${s}`, "--yaw", pose.yaw.toFixed(2));
      write(el, `c${s}`, "opacity", pose.appear.toFixed(3));
      // only the cards facing the camera play video
      const v = videoRefs.current[s];
      if (v && v.getAttribute("src")) {
        const facing = !L.reduced && e > 0.6 && Math.abs(wrapDeg(angle)) < 24;
        if (facing && v.paused) v.play().catch(() => undefined);
        else if (!facing && !v.paused) v.pause();
      }
    }

    // hover hit-testing every third frame
    if (L.finished && L.frameNo % 3 === 0) {
      let idx = -1;
      if (L.pointer && !L.dragging) {
        const hit = document.elementFromPoint(L.pointer.x, L.pointer.y)?.closest<HTMLElement>("[data-slot]");
        if (hit && rootRef.current?.contains(hit)) idx = Number(hit.dataset.slot);
      }
      if (idx !== L.hovered) {
        if (L.hovered >= 0) slotRefs.current[L.hovered]?.removeAttribute("data-hover");
        if (idx >= 0) slotRefs.current[idx]?.setAttribute("data-hover", "");
        L.hovered = idx;
        setHoverLabel(idx >= 0 ? labelFor(cards[L.slotReel[idx]]) : null);
      }
    }
  });

  // ---- drag / swipe / horizontal wheel
  useEffect(() => {
    const stage = stageRef.current!;
    const L = live.current;
    const degPerPx = () => 0.09 / Math.max(0.4, L.fit);
    let downX = 0;
    const onDown = (e: PointerEvent) => {
      if (!L.finished || e.button !== 0) return;
      L.dragging = true;
      L.dragMoved = false;
      downX = L.lastX = e.clientX;
      L.lastT = performance.now();
      L.vel = 0;
    };
    const onMove = (e: PointerEvent) => {
      L.pointer = { x: e.clientX, y: e.clientY };
      if (!L.dragging) return;
      const now = performance.now();
      const dx = e.clientX - L.lastX;
      L.lastX = e.clientX;
      if (Math.abs(e.clientX - downX) > 6) L.dragMoved = true;
      const d = -dx * degPerPx();
      spinTarget.set(spinTarget.get() + d);
      L.vel = L.vel * 0.5 + (d / Math.max(1, now - L.lastT)) * 1000 * 0.5;
      L.lastT = now;
    };
    const onUp = () => {
      if (!L.dragging) return;
      L.dragging = false;
      if (performance.now() - L.lastT > 80) L.vel = 0; // a pause before letting go cancels the flick
      L.vel = Math.max(-240, Math.min(240, L.vel));
    };
    const onWheel = (e: WheelEvent) => {
      if (!L.finished) return;
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (!dx) return; // vertical scrolling stays with the page
      e.preventDefault();
      spinTarget.set(spinTarget.get() + dx * degPerPx());
    };
    const onLeave = () => (L.pointer = null);
    stage.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    stage.addEventListener("pointerleave", onLeave);
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      stage.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      stage.removeEventListener("pointerleave", onLeave);
      stage.removeEventListener("wheel", onWheel);
    };
  }, [spinTarget]);

  const onCardClick = (e: React.MouseEvent, s: number) => {
    if (live.current.dragMoved || !live.current.finished) {
      e.preventDefault();
      return;
    }
    if (onCardOpen) {
      e.preventDefault();
      onCardOpen(cards[live.current.slotReel[s]]);
    }
  };

  return (
    <div ref={rootRef} className={styles.root} data-phase={phase} data-box={box || undefined} data-intro={intro || undefined}>
      <div ref={frameRef} className={styles.frame}>
        <div className={styles.paper} aria-hidden="true" />
        {/* the loader's white page: under the cards, over the paper, fades while the cards keep moving */}
        {!box && <div ref={backdropRef} className={styles.backdrop} aria-hidden="true" />}
        <div ref={cloudsBackRef} className={`${styles.clouds} ${styles.cloudsBack}`} aria-hidden="true" />
        <div ref={stageRef} className={styles.stage}>
          <div ref={scalerRef} className={styles.scaler}>
            <div ref={ringRef} className={styles.ring}>
              {Array.from({ length: SLOTS }, (_, s) => {
                const card = cards[s % cards.length];
                return (
                  <a
                    key={s}
                    ref={(el) => {
                      slotRefs.current[s] = el;
                    }}
                    data-slot={s}
                    href={card.href}
                    className={styles.card}
                    style={{ width: CARD_W, height: CARD_H, visibility: "hidden" }}
                    aria-label={`${labelFor(card)}, ${TYPE_LABEL[card.type]}`}
                    draggable={false}
                    onClick={(e) => onCardClick(e, s)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={(el) => {
                        imgRefs.current[s] = el;
                      }}
                      src={card.cover}
                      alt=""
                      draggable={false}
                      decoding="async"
                    />
                    <video
                      ref={(el) => {
                        videoRefs.current[s] = el;
                      }}
                      className={styles.preview}
                      src={card.video ?? undefined}
                      muted
                      loop
                      playsInline
                      preload="none"
                      onPlaying={(e) => e.currentTarget.setAttribute("data-playing", "")}
                      onPause={(e) => e.currentTarget.removeAttribute("data-playing")}
                    />
                    <span
                      ref={(el) => {
                        tagRefs.current[s] = el;
                      }}
                      className={styles.tag}
                    >
                      {TYPE_LABEL[card.type]}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
        <div ref={cloudsFrontRef} className={`${styles.clouds} ${styles.cloudsFront}`} aria-hidden="true" />
        {hoverLabel && phase === "live" && <span className={styles.hoverTag}>{hoverLabel}</span>}
      </div>

      {intro && phase === "intro" && (
        <>
          <div ref={loaderRef} className={styles.loader}>
            <span className={styles.label}>
              <Scramble text="Loading reels" />
            </span>
            <RollingCounter value={progress} />
          </div>
          <span ref={wordRef} className={styles.word} aria-hidden="true">
            Codifykit
          </span>
          <button ref={skipRef} type="button" className={styles.skip} onClick={finish}>
            Skip intro
          </button>
        </>
      )}
      {children}
    </div>
  );
}
