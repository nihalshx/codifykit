"use client";
/**
 * Homepage hero, rebuilt from the reference recording:
 *  1. Loader: plain page, big wordmark top-left, rolling % counter bottom-right. Cards are added to a
 *     tilted ring one by one as their covers load; the ring spins.
 *  2. Enter: at 100% the sky fades in, the ring levels out and the camera flies into its centre.
 *  3. Settle: the full-screen scene shrinks into the rounded hero frame; header + audience line come in.
 *  4. Live: you stand inside the ring; it turns slowly; drag / swipe / horizontal wheel turn it, flicks glide.
 * Three.js renders the ring, GSAP runs the timeline.
 */
import { useEffect, useRef, useState } from "react";
import type * as THREE_NS from "three";
import type { WheelCard } from "@/lib/content";
import { ICON_PATH } from "@/components/ui/Logo";
import styles from "./HeroRing.module.css";

type THREE = typeof THREE_NS;

const CARD_W = 1;
const CARD_H = 16 / 9;
const GAP = 0.16;

const TYPE_LABEL: Record<WheelCard["type"], string> = {
  reel: "Reel",
  app: "App",
  poster: "Poster",
  "ai-video": "AI video by Codifykit",
};

function roundedTexture(T3: THREE, img: HTMLImageElement | null, label: string) {
  // draw the cover into a canvas with rounded corners so the planes read as cards
  const w = 540, h = 960, r = 34;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, r);
  ctx.clip();
  if (img && img.width) {
    const s = Math.max(w / img.width, h / img.height);
    ctx.drawImage(img, (w - img.width * s) / 2, (h - img.height * s) / 2, img.width * s, img.height * s);
  } else {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#04052B");
    g.addColorStop(1, "#6A55C8");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  // small type tag, like the reference's reel chrome
  ctx.font = `600 22px "JetBrains Mono Variable", monospace`;
  const tw = ctx.measureText(label.toUpperCase()).width;
  ctx.fillStyle = "rgba(4,5,43,.55)";
  ctx.beginPath();
  ctx.roundRect(22, 22, tw + 28, 38, 19);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillText(label.toUpperCase(), 36, 48);
  const tex = new T3.CanvasTexture(c);
  tex.colorSpace = T3.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function backTexture(T3: THREE) {
  const w = 270, h = 480;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 18);
  ctx.clip();
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#04052B");
  g.addColorStop(0.6, "#1A1680");
  g.addColorStop(1, "#6A55C8");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.translate(w / 2 - 40, h / 2 - 40);
  ctx.scale(80 / 329, 80 / 329);
  ctx.translate(-68.48, -69.44);
  ctx.fillStyle = "rgba(255,255,255,.9)";
  ctx.fill(new Path2D(ICON_PATH));
  const tex = new T3.CanvasTexture(c);
  tex.colorSpace = T3.SRGBColorSpace;
  return tex;
}

export function HeroRing({
  cards,
  intro = true,
  onCardOpen,
  box = false,
  children,
}: {
  cards: WheelCard[];
  intro?: boolean;
  /** true: fill the parent box as a plain rounded frame (no header / headline space) */
  box?: boolean;
  onCardOpen?: (card: WheelCard) => void;
  children?: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const cloudRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const digitsRef = useRef<HTMLSpanElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const [phase, setPhase] = useState<"intro" | "live">(intro ? "intro" : "live");
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    const html = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const runIntro = intro && !reduced;
    if (runIntro) {
      html.dataset.intro = "running";
      html.style.overflow = "hidden";
    }

    (async () => {
      const [T3, { gsap }] = await Promise.all([import("three"), import("gsap")]);
      if (disposed) return;
      // follow real time even when frames are slow, so the intro never crawls on weak devices
      gsap.ticker.lagSmoothing(0);
      const mount = mountRef.current!;
      const frame = frameRef.current!;
      const mobile = window.matchMedia("(max-width: 767px)").matches;

      let renderer: THREE_NS.WebGLRenderer;
      try {
        renderer = new T3.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      } catch {
        html.style.overflow = "";
        delete html.dataset.intro;
        setPhase("live");
        return;
      }
      renderer.setPixelRatio(Math.min(1.75, window.devicePixelRatio));
      renderer.outputColorSpace = T3.SRGBColorSpace;
      mount.appendChild(renderer.domElement);

      const scene = new T3.Scene();
      const camera = new T3.PerspectiveCamera(30, 1, 0.05, 100);

      // ---- the ring
      const n = cards.length;
      const radius = (n * (CARD_W + GAP)) / (2 * Math.PI);
      const ring = new T3.Group(); // tilt
      const spinner = new T3.Group(); // turns around the ring axis
      ring.add(spinner);
      scene.add(ring);
      const geo = new T3.PlaneGeometry(CARD_W, CARD_H);
      const backTex = backTexture(T3);
      const placeholder = new T3.MeshBasicMaterial({ map: backTex, transparent: true });
      type Card = { group: THREE_NS.Group; inner: THREE_NS.Mesh; outer: THREE_NS.Mesh; shown: number; video?: HTMLVideoElement };
      const items: Card[] = cards.map((c, i) => {
        const a = (i / n) * Math.PI * 2;
        const group = new T3.Group();
        group.position.set(Math.sin(a) * radius, 0, Math.cos(a) * radius);
        group.rotation.y = a; // +z of the group points away from the centre
        // outer face (seen from outside, during the loader) and inner face (seen from inside)
        const outer = new T3.Mesh(geo, placeholder);
        const inner = new T3.Mesh(geo, placeholder);
        inner.rotation.y = Math.PI;
        group.add(outer, inner);
        group.scale.setScalar(runIntro ? 0.0001 : 1);
        group.userData.index = i;
        spinner.add(group);
        return { group, inner, outer, shown: runIntro ? 0 : 1 };
      });

      // ---- load covers; each one that arrives is dealt onto the ring
      await document.fonts.ready;
      let loaded = 0;
      const counter = { v: 0 };
      const setDigits = (v: number) => {
        const el = digitsRef.current;
        if (!el) return;
        const s = String(Math.round(v)).padStart(3, "0");
        if (el.textContent !== s) el.textContent = s;
      };
      const imgs = cards.map(
        (c) =>
          new Promise<HTMLImageElement | null>((resolve) => {
            const img = new Image();
            img.onload = () => img.decode().catch(() => undefined).then(() => resolve(img));
            img.onerror = () => resolve(null);
            img.src = c.cover;
          })
      );
      const queue: number[] = [];
      let dealt = 0;
      const deal = () => {
        const i = queue.shift();
        if (i === undefined) return;
        dealt++;
        gsap.to(items[i].group.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: "back.out(1.7)" });
        gsap.to(counter, { v: (dealt / n) * 100, duration: 0.25, ease: "none", onUpdate: () => setDigits(counter.v) });
      };
      const dealer = runIntro ? window.setInterval(deal, 70) : 0;
      imgs.forEach((p, i) =>
        p.then((img) => {
          if (disposed) return;
          const mat = new T3.MeshBasicMaterial({ map: roundedTexture(T3, img, TYPE_LABEL[cards[i].type]), transparent: true });
          items[i].outer.material = mat;
          items[i].inner.material = mat;
          loaded++;
          if (runIntro) queue.push(i);
          // muted looping previews for cards that have a video
          if (cards[i].video) {
            const v = document.createElement("video");
            v.src = cards[i].video!;
            v.muted = true;
            v.loop = true;
            v.playsInline = true;
            v.preload = "none";
            v.crossOrigin = "anonymous";
            items[i].video = v;
          }
        })
      );

      // ---- size
      const resize = () => {
        const w = mount.clientWidth, h = mount.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / Math.max(1, h);
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(mount);

      // ---- camera / ring poses
      // loader: outside the ring, ring tilted and spinning
      const OUT = { z: radius * (mobile ? 7.5 : 5.6), y: 0, fov: 30, tiltX: 1.05, tiltZ: -0.3, scale: 1 };
      // live: camera at the centre, looking at the far wall
      const IN = { z: 0, y: 0.05, fov: mobile ? 74 : 48, tiltX: 0, tiltZ: 0, scale: 1 };
      const state = { ...(runIntro ? OUT : IN), sky: runIntro ? 0 : 1, clouds: runIntro ? 0 : 1, inset: runIntro ? 0 : 1 };
      let spin = 0, spinTarget = 0, velocity = 0, autoSpeed = runIntro ? 0.9 : 0.06;
      let dragging = false;

      const applyFrame = () => {
        // full-bleed (0) -> rounded hero frame (1)
        const k = state.inset;
        const topPx = box ? 0 : k * (mobile ? 72 : 80);
        const sidePx = box ? 0 : k * 16;
        const bottom = box ? 0 : k * (mobile ? 30 : 24); // % of viewport reserved for the audience line
        frame.style.clipPath = `inset(${topPx}px ${sidePx}px ${bottom}% ${sidePx}px round ${k * 28}px)`;
        // the canvas follows the visible frame so the ring stays centred in it
        mount.style.inset = `${topPx}px ${sidePx}px ${bottom}% ${sidePx}px`;
        if (skyRef.current) skyRef.current.style.opacity = String(state.sky);
        if (cloudRef.current) {
          const visibleH = box ? frame.clientHeight : window.innerHeight * (1 - bottom / 100) - topPx;
          cloudRef.current.style.opacity = String(state.clouds);
          cloudRef.current.style.transform = `translateY(${(1 - state.clouds) * 60}%)`;
          cloudRef.current.style.bottom = `${bottom}%`;
          cloudRef.current.style.height = `${Math.max(120, visibleH * 0.3)}px`;
        }
      };
      applyFrame();

      // ---- the intro timeline
      let finished = !runIntro;
      function finish() {
        if (finished) return;
        finished = true;
        Object.assign(state, IN, { sky: 1, clouds: 1, inset: 1 });
        items.forEach((it) => it.group.scale.setScalar(1));
        autoSpeed = 0.06;
        applyFrame();
        html.style.overflow = "";
        delete html.dataset.intro;
        setPhase("live");
      }
      let tl: gsap.core.Timeline | null = null;
      // ---- interaction: drag, swipe, horizontal wheel; flicks glide
      const el = renderer.domElement;
      let lastX = 0, lastT = 0, downX = 0, moved = false, vel = 0;
      const pxToRad = () => (Math.PI * 1.1) / Math.max(320, mount.clientWidth);
      const onDown = (e: PointerEvent) => {
        if (!finished) return;
        dragging = true;
        moved = false;
        downX = lastX = e.clientX;
        lastT = performance.now();
        vel = 0;
        velocity = 0;
      };
      const onMove = (e: PointerEvent) => {
        hover(e);
        if (!dragging) return;
        const now = performance.now();
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        if (Math.abs(e.clientX - downX) > 6) moved = true;
        const d = -dx * pxToRad();
        spinTarget += d;
        vel = vel * 0.6 + (d / Math.max(1, now - lastT)) * 1000 * 0.4;
        lastT = now;
      };
      const onUp = () => {
        if (!dragging) return;
        dragging = false;
        velocity = performance.now() - lastT > 80 ? 0 : Math.max(-6, Math.min(6, vel));
      };
      const onWheel = (e: WheelEvent) => {
        if (!finished) return;
        const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
        if (!dx) return;
        e.preventDefault();
        spinTarget += dx * pxToRad() * 0.7;
      };
      // hover + click with a raycaster
      const ray = new T3.Raycaster();
      const ndc = new T3.Vector2();
      let hovered = -1;
      const hover = (e: PointerEvent) => {
        if (!finished) return;
        const r = el.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
          if (hovered !== -1) { hovered = -1; setHoverLabel(null); }
          return;
        }
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        ray.setFromCamera(ndc, camera);
        const hit = ray.intersectObjects(items.map((it) => it.inner), false)[0];
        const idx = hit ? (hit.object.parent!.userData.index as number) : -1;
        if (idx !== hovered) {
          hovered = idx;
          const c = idx >= 0 ? cards[idx] : null;
          setHoverLabel(c ? (c.label.startsWith("[") ? TYPE_LABEL[c.type] : c.label) : null);
          el.style.cursor = idx >= 0 ? "pointer" : "grab";
        }
      };
      const onClick = () => {
        if (moved || hovered < 0) return;
        const c = cards[hovered];
        if (onCardOpen) onCardOpen(c);
        else window.location.href = c.href;
      };
      const onKey = (e: KeyboardEvent) => {
        if (!finished && (e.key === "Escape" || e.key === "Tab")) skip();
      };
      const skip = () => {
        tl?.kill();
        finish();
      };
      skipRef.current?.addEventListener("click", skip);
      el.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
      el.addEventListener("wheel", onWheel, { passive: false });
      el.addEventListener("click", onClick);
      window.addEventListener("keydown", onKey);

      // ---- render loop (paused off-screen / hidden tab)
      let visible = true;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(frame);
      let raf = 0, last = performance.now();
      const tmp = new T3.Vector3();
      const tick = (now: number) => {
        raf = requestAnimationFrame(tick);
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (!visible || document.hidden) return;

        if (!reduced && !dragging) {
          spinTarget += autoSpeed * dt;
          if (Math.abs(velocity) > 0.001) {
            spinTarget += velocity * dt;
            velocity *= Math.exp(-dt * 3.2);
          }
        }
        spin += (spinTarget - spin) * (1 - Math.exp(-dt * 9));
        spinner.rotation.y = -spin;
        ring.rotation.set(state.tiltX, 0, state.tiltZ);

        camera.position.set(0, state.y, state.z);
        camera.fov = state.fov;
        camera.updateProjectionMatrix();
        if (state.z > 0.01) camera.lookAt(0, 0, 0);
        else camera.rotation.set(-0.06, 0, 0); // look slightly down so the cards sit high in the frame, rising out of the clouds

        // play the video of cards near the middle of the view
        if (finished) {
          items.forEach((it, i) => {
            if (!it.video) return;
            it.group.getWorldPosition(tmp);
            const facing = tmp.z < 0 && Math.abs(Math.atan2(tmp.x, -tmp.z)) < 0.5;
            if (facing && it.video.paused) {
              it.video.preload = "auto";
              it.video.play().then(() => {
                const vt = new T3.VideoTexture(it.video!);
                vt.colorSpace = T3.SRGBColorSpace;
                const m = new T3.MeshBasicMaterial({ map: vt });
                it.inner.material = m;
              }).catch(() => undefined);
            } else if (!facing && !it.video.paused) it.video.pause();
            void i;
          });
        }
        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(tick);
      const runTimeline = async () => {
        const waitForCards = new Promise<void>((resolve) => {
          const check = () => (dealt >= n || disposed ? resolve() : setTimeout(check, 100));
          check();
          setTimeout(resolve, 7000); // never hold the page hostage
        });
        await Promise.all([waitForCards, new Promise((r) => setTimeout(r, 1600))]);
        if (disposed || finished) return;
        clearInterval(dealer);
        while (queue.length) deal();
        gsap.to(counter, { v: 100, duration: 0.3, onUpdate: () => setDigits(counter.v) });
        tl = gsap.timeline({ delay: 0.5, onComplete: finish });
        tl.to(loaderRef.current, { opacity: 0, duration: 0.5, ease: "power1.out" }, 0)
          .to(state, { sky: 1, duration: 0.9, ease: "power1.inOut" }, 0.1)
          // level the ring and fly into it
          .to(state, { tiltX: 0, tiltZ: 0, duration: 1.6, ease: "power3.inOut" }, 0.1)
          .to(state, { z: 0, y: IN.y, fov: IN.fov, duration: 2.0, ease: "power3.inOut" }, 0.35)
          .to(state, { clouds: 1, duration: 1.2, ease: "power2.out" }, 1.1)
          // shrink the scene into the hero frame; header + headline follow
          .to(state, { inset: 1, duration: 1.1, ease: "power3.inOut", onUpdate: applyFrame }, 2.15)
          .call(() => {
            delete html.dataset.intro;
            html.style.overflow = "";
          }, [], 2.6);
        tl.eventCallback("onUpdate", applyFrame);
        const speed = { s: autoSpeed };
        gsap.to(speed, { s: 0.06, duration: 2.4, ease: "power2.out", delay: 0.5, onUpdate: () => (autoSpeed = speed.s) });
      };

      if (runIntro) runTimeline();

      cleanup = () => {
        cancelAnimationFrame(raf);
        clearInterval(dealer);
        tl?.kill();
        ro.disconnect();
        io.disconnect();
        skipRef.current?.removeEventListener("click", skip);
        el.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        el.removeEventListener("wheel", onWheel);
        el.removeEventListener("click", onClick);
        window.removeEventListener("keydown", onKey);
        scene.traverse((o) => {
          const m = o as THREE_NS.Mesh;
          if (!m.isMesh) return;
          const mat = m.material as THREE_NS.MeshBasicMaterial;
          mat.map?.dispose();
          mat.dispose();
        });
        geo.dispose();
        renderer.dispose();
        el.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
      html.style.overflow = "";
      delete html.dataset.intro;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, intro, box]);

  return (
    <div ref={rootRef} className={styles.root} data-phase={phase} data-intro={intro || undefined}>
      <div ref={frameRef} className={styles.frame}>
        <div ref={skyRef} className={styles.sky} aria-hidden="true">
          <span className={styles.sun} />
          <span className={styles.stars} />
        </div>
        <div ref={mountRef} className={styles.canvas} />
        <div ref={cloudRef} className={styles.clouds} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/hero-clouds.webp" alt="" draggable={false} />
        </div>
        <div className={styles.petals} aria-hidden="true">
          {Array.from({ length: 18 }, (_, i) => (
            <i key={i} style={{ "--x": `${(i * 53) % 100}%`, "--d": `${(i * 0.73) % 9}s`, "--t": `${9 + (i % 5) * 2}s`, "--s": `${0.6 + ((i * 7) % 5) / 6}` } as React.CSSProperties} />
          ))}
        </div>
        {hoverLabel && phase === "live" && <span className={styles.hoverTag}>{hoverLabel}</span>}
      </div>

      {intro && phase === "intro" && (
        <>
          <div ref={loaderRef} className={styles.loader}>
            <span className={styles.word}>Codifykit.</span>
            <span className={styles.loadLabel}>Loading work</span>
            <span className={styles.counter} aria-live="polite">
              <span ref={digitsRef}>000</span>
              <small>%</small>
            </span>
          </div>
          <button ref={skipRef} type="button" className={styles.skip}>Skip intro</button>
        </>
      )}
      {children}
    </div>
  );
}
