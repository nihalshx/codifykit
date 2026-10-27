"use client";
/**
 * Floating-device showcase (Three.js), shared by /work/web (laptops) and /work/posters (phones).
 * Specs: prompts/floating-laptops-web-prompt.md and prompts/floating-phones-posters-prompt.md.
 *
 * The devices are modelled in code (no GLB needed). When licensed GLB models arrive, swap
 * buildLaptop / buildPhone for a loader; everything else (strip, controls, intro, loop) stays.
 */
import { useEffect, useRef, useState } from "react";
import type * as THREE_NS from "three";
import { T } from "@/components/ui/T";
import { Lightbox } from "@/components/ui/Lightbox";
import { ICON_PATH } from "@/components/ui/Logo";
import { isPlaceholder } from "@/lib/content";
import styles from "./Showcase.module.css";

type THREE = typeof THREE_NS;

export type ShowcaseItem = {
  slug: string;
  title: string;
  rows: [string, string | null | undefined][];
  facts: string[];
  bigNumber?: string | null;
  bigLabel?: string | null;
  fallbackBig: string; // the year/date when there's no real number
  href?: string | null; // live site / instagram
  images: string[]; // screenshot (laptop) or poster set (phone)
  format?: string; // poster ratio, e.g. "4:5"
  account?: string;
  caption?: string;
};

type Kind = "laptop" | "phone";

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
const inOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ---------------------------------------------------------------- canvas helpers
const loadImg = (src: string) =>
  new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img);
    img.src = src;
  });

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function brandGradient(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#04052B");
  g.addColorStop(0.55, "#1A1680");
  g.addColorStop(0.85, "#6A55C8");
  g.addColorStop(1, "#B9A8E8");
  return g;
}

function drawIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color = "#fff") {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 329, size / 329);
  ctx.translate(-68.48, -69.44);
  ctx.fillStyle = color;
  ctx.fill(new Path2D(ICON_PATH));
  ctx.restore();
}

/** "Websites we built" / "Posters & creatives" title card, drawn with the site's real fonts. */
function drawTitleCard(ctx: CanvasRenderingContext2D, w: number, h: number, title: string, t: number) {
  ctx.fillStyle = brandGradient(ctx, w, h);
  ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w * 0.1, h, 0, w * 0.1, h, w * 0.6);
  glow.addColorStop(0, "rgba(58,99,184,.6)");
  glow.addColorStop(1, "rgba(58,99,184,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  const fade = (k: number) => clamp01((t - k * 0.25) / 0.5);
  const s = Math.min(w, h * 1.6);
  ctx.textAlign = "center";
  ctx.fillStyle = `rgba(255,255,255,${0.75 * fade(0)})`;
  ctx.font = `500 ${s * 0.028}px "JetBrains Mono Variable", monospace`;
  ctx.fillText("CODIFYKIT PRESENTS", w / 2, h * 0.36 + (1 - fade(0)) * 10);
  ctx.fillStyle = `rgba(255,255,255,${fade(1)})`;
  ctx.font = `600 ${s * 0.1}px "Plus Jakarta Sans Variable", sans-serif`;
  ctx.fillText(title, w / 2, h * 0.53 + (1 - fade(1)) * 14);
  ctx.globalAlpha = fade(2);
  drawIcon(ctx, w / 2 - s * 0.035, h * 0.63, s * 0.07);
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- models
type Device = {
  root: THREE_NS.Group; // positioned on the strip
  body: THREE_NS.Group; // rotated (tilt / facing / turn)
  lid?: THREE_NS.Group; // laptop hinge
  screen: THREE_NS.Mesh;
  hit: THREE_NS.Mesh; // invisible box for hover/click
  size: THREE_NS.Vector3;
  bob: number;
};

const LAPTOP = { w: 3.2, d: 2.2, baseH: 0.11, lidH: 2.1, lidT: 0.07, screenW: 2.98, screenH: 1.86 };
const PHONE = { w: 1.02, h: 2.12, t: 0.1, screenW: 0.94, screenH: 2.03 };

async function makeRounded(T3: THREE) {
  const { RoundedBoxGeometry } = await import("three/examples/jsm/geometries/RoundedBoxGeometry.js");
  return (w: number, h: number, d: number, r: number) => new RoundedBoxGeometry(w, h, d, 4, r) as THREE_NS.BufferGeometry;
}

function buildLaptop(T3: THREE, rounded: (w: number, h: number, d: number, r: number) => THREE_NS.BufferGeometry, mats: Record<string, THREE_NS.Material>): Device {
  const root = new T3.Group();
  const body = new T3.Group();
  root.add(body);
  const base = new T3.Mesh(rounded(LAPTOP.w, LAPTOP.baseH, LAPTOP.d, 0.05), mats.shell);
  body.add(base);
  const deck = new T3.Mesh(new T3.PlaneGeometry(LAPTOP.w * 0.86, LAPTOP.d * 0.5), mats.deck);
  deck.rotation.x = -Math.PI / 2;
  deck.position.set(0, LAPTOP.baseH / 2 + 0.002, -0.2);
  body.add(deck);
  const pad = new T3.Mesh(new T3.PlaneGeometry(LAPTOP.w * 0.3, LAPTOP.d * 0.26), mats.deck);
  pad.rotation.x = -Math.PI / 2;
  pad.position.set(0, LAPTOP.baseH / 2 + 0.002, 0.7);
  body.add(pad);
  const lid = new T3.Group();
  lid.position.set(0, LAPTOP.baseH / 2, -LAPTOP.d / 2 + 0.04);
  body.add(lid);
  const lidMesh = new T3.Mesh(rounded(LAPTOP.w, LAPTOP.lidH, LAPTOP.lidT, 0.05), mats.shell);
  lidMesh.position.set(0, LAPTOP.lidH / 2, 0);
  lid.add(lidMesh);
  const screen = new T3.Mesh(new T3.PlaneGeometry(LAPTOP.screenW, LAPTOP.screenH), new T3.MeshBasicMaterial({ color: 0x0d0d14, toneMapped: false }));
  screen.position.set(0, LAPTOP.lidH / 2 + 0.03, LAPTOP.lidT / 2 + 0.002);
  lid.add(screen);
  // centre the whole laptop on its own middle
  body.position.set(0, -0.6, 0);
  const hit = new T3.Mesh(new T3.BoxGeometry(LAPTOP.w * 1.05, 2.6, LAPTOP.d), new T3.MeshBasicMaterial({ visible: false }));
  hit.position.y = 0.3;
  root.add(hit);
  return { root, body, lid, screen, hit, size: new T3.Vector3(LAPTOP.w, 2.4, LAPTOP.d), bob: Math.random() * Math.PI * 2 };
}

function buildPhone(T3: THREE, rounded: (w: number, h: number, d: number, r: number) => THREE_NS.BufferGeometry, mats: Record<string, THREE_NS.Material>): Device {
  const root = new T3.Group();
  const body = new T3.Group();
  root.add(body);
  const shell = new T3.Mesh(rounded(PHONE.w, PHONE.h, PHONE.t, 0.12), mats.shell);
  body.add(shell);
  const screen = new T3.Mesh(new T3.PlaneGeometry(PHONE.screenW, PHONE.screenH), new T3.MeshBasicMaterial({ color: 0x0d0d14, toneMapped: false }));
  screen.position.z = PHONE.t / 2 + 0.002;
  body.add(screen);
  const cam = new T3.Mesh(rounded(0.36, 0.36, 0.06, 0.08), mats.deck);
  cam.position.set(-0.24, 0.76, -PHONE.t / 2 - 0.02);
  body.add(cam);
  const logo = new T3.Mesh(new T3.PlaneGeometry(0.26, 0.26), mats.logo);
  logo.position.set(0, 0, -PHONE.t / 2 - 0.002);
  logo.rotation.y = Math.PI;
  body.add(logo);
  const hit = new T3.Mesh(new T3.BoxGeometry(PHONE.w * 1.1, PHONE.h * 1.05, 0.4), new T3.MeshBasicMaterial({ visible: false }));
  root.add(hit);
  return { root, body, screen, hit, size: new T3.Vector3(PHONE.w, PHONE.h, PHONE.t), bob: Math.random() * Math.PI * 2 };
}

// ---------------------------------------------------------------- social post (phone screens)
const SCREEN_PX = { w: 540, h: Math.round((540 * PHONE.screenH) / PHONE.screenW) };

function drawPost(
  ctx: CanvasRenderingContext2D,
  item: ShowcaseItem,
  imgs: HTMLImageElement[],
  state: { slide: number; push: number; heart: number; story: number }
) {
  const { w, h } = SCREEN_PX;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  const story = item.format === "9:16";
  if (story) {
    const img = imgs[state.slide % imgs.length];
    if (img?.width) ctx.drawImage(img, 0, 0, w, h);
    // progress bars
    imgs.forEach((_, k) => {
      const bw = (w - 24 - (imgs.length - 1) * 6) / imgs.length;
      const x = 12 + k * (bw + 6);
      ctx.fillStyle = "rgba(255,255,255,.4)";
      roundRect(ctx, x, 16, bw, 5, 3);
      ctx.fill();
      const f = k < state.slide % imgs.length ? 1 : k === state.slide % imgs.length ? state.story : 0;
      ctx.fillStyle = "#fff";
      roundRect(ctx, x, 16, bw * f, 5, 3);
      ctx.fill();
    });
    drawAvatarRow(ctx, item, 36, true);
    return;
  }
  drawAvatarRow(ctx, item, 70, false);
  const [rw, rh] = (item.format ?? "4:5").split(":").map(Number);
  const ph = (w * rh) / rw;
  const top = 132;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, top, w, ph);
  ctx.clip();
  const cur = imgs[state.slide % imgs.length];
  const next = imgs[(state.slide + 1) % imgs.length];
  const z = 1 + 0.04 * state.push;
  const shift = -state.push * w * (imgs.length > 1 ? 1 : 0);
  if (cur?.width) {
    if (imgs.length > 1) ctx.drawImage(cur, shift, top, w, ph);
    else ctx.drawImage(cur, (w - w * z) / 2, top + (ph - ph * z) / 2, w * z, ph * z);
  }
  if (imgs.length > 1 && next?.width && state.push > 0) ctx.drawImage(next, shift + w, top, w, ph);
  if (state.heart > 0 && state.heart < 1) {
    const k = state.heart;
    const s = k < 0.4 ? (k / 0.4) * 1.2 : k < 0.6 ? 1.2 - ((k - 0.4) / 0.2) * 0.2 : 1;
    ctx.globalAlpha = k > 0.75 ? 1 - (k - 0.75) / 0.25 : 1;
    drawHeart(ctx, w / 2, top + ph / 2, 90 * s, "#fff", true);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  // action row
  const ay = top + ph + 40;
  drawHeart(ctx, 40, ay, 30, "#111", false);
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(100, ay, 15, 0.25 * Math.PI, 2.2 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(140, ay - 14);
  ctx.lineTo(170, ay);
  ctx.lineTo(140, ay + 14);
  ctx.lineTo(146, ay);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w - 50, ay - 16);
  ctx.lineTo(w - 26, ay - 16);
  ctx.lineTo(w - 26, ay + 16);
  ctx.lineTo(w - 38, ay + 6);
  ctx.lineTo(w - 50, ay + 16);
  ctx.closePath();
  ctx.stroke();
  if (imgs.length > 1) {
    imgs.forEach((_, k) => {
      ctx.fillStyle = k === state.slide % imgs.length ? "#6A55C8" : "#C9C9C5";
      ctx.beginPath();
      ctx.arc(w / 2 - (imgs.length - 1) * 9 + k * 18, ay, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  ctx.fillStyle = "#1A1A1A";
  ctx.font = `600 22px "Inter Variable", sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText(item.account ?? "", 24, ay + 56);
  ctx.font = `400 22px "Inter Variable", sans-serif`;
  const cap = item.caption ?? "";
  ctx.fillStyle = "#4A4A55";
  ctx.fillText(cap.length > 40 ? cap.slice(0, 40) + "…" : cap, 24, ay + 88);
}

function drawAvatarRow(ctx: CanvasRenderingContext2D, item: ShowcaseItem, y: number, onImage: boolean) {
  const { w } = SCREEN_PX;
  ctx.fillStyle = brandGradient(ctx, 56, 56);
  ctx.beginPath();
  ctx.arc(46, y, 24, 0, Math.PI * 2);
  ctx.fill();
  drawIcon(ctx, 33, y - 13, 26);
  ctx.fillStyle = onImage ? "#fff" : "#1A1A1A";
  ctx.font = `600 22px "Inter Variable", sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText(item.account ?? "codifykit", 82, y + 8);
  ctx.fillStyle = onImage ? "#fff" : "#1A1A1A";
  for (let k = 0; k < 3; k++) {
    ctx.beginPath();
    ctx.arc(w - 52 + k * 12, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string, fill: boolean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 32, s / 32);
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.bezierCurveTo(-16, -2, -14, -16, -6, -16);
  ctx.bezierCurveTo(-2, -16, 0, -12, 0, -10);
  ctx.bezierCurveTo(0, -12, 2, -16, 6, -16);
  ctx.bezierCurveTo(14, -16, 16, -2, 0, 10);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = color;
    ctx.shadowColor = "rgba(0,0,0,.3)";
    ctx.shadowBlur = 12;
    ctx.fill();
  } else {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.6;
    ctx.stroke();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- marker loop (hover)
function markerPath(cx: number, cy: number, ax: number, ay: number, seed: number, start: number) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const passes = 2 + (rnd() > 0.5 ? 1 : 0);
  const pts: string[] = [];
  const steps = 28;
  for (let p = 0; p < passes; p++) {
    const jx = 1 + (rnd() - 0.5) * 0.12, jy = 1 + (rnd() - 0.5) * 0.12;
    for (let i = 0; i <= steps; i++) {
      const a = start + (i / steps) * Math.PI * 2 + p * 0.3;
      const wob = 1 + (rnd() - 0.5) * 0.06;
      const x = cx + Math.cos(a) * ax * jx * wob;
      const y = cy + Math.sin(a) * ay * jy * wob;
      pts.push(`${pts.length ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`);
    }
  }
  return pts.join(" ");
}

// ---------------------------------------------------------------- component
export function Showcase({
  kind,
  items,
  title,
  primaryLabel,
}: {
  kind: Kind;
  items: ShowcaseItem[];
  title: string; // intro title card
  primaryLabel: string; // "Visit live site ↗" / "View on Instagram ↗"
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const loopRef = useRef<SVGPathElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const api = useRef<{ go: (i: number) => void; toggle: () => void; skip: () => void }>({ go: () => {}, toggle: () => {}, skip: () => {} });
  const [current, setCurrent] = useState(0);
  const [intro, setIntro] = useState(true);
  const [ready, setReady] = useState(false);
  const [box, setBox] = useState<number | null>(null);
  const [boxIdx, setBoxIdx] = useState(0);
  const [failed, setFailed] = useState(false);
  const item = items[current];

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    (async () => {
      let T3: THREE;
      try {
        T3 = await import("three");
      } catch {
        setFailed(true);
        return;
      }
      if (disposed) return;
      const mount = mountRef.current!;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const mobile = window.matchMedia("(max-width: 767px)").matches;

      let renderer: THREE_NS.WebGLRenderer;
      try {
        renderer = new T3.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      } catch {
        setFailed(true);
        return;
      }
      renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio));
      renderer.outputColorSpace = T3.SRGBColorSpace;
      mount.appendChild(renderer.domElement);

      const scene = new T3.Scene();
      const camera = new T3.PerspectiveCamera(32, 1, 0.1, 200);
      const CAM_Z = (kind === "laptop" ? 12.5 : 8.2) * (mobile ? 0.8 : 1);
      camera.position.set(0, 0, CAM_Z);

      scene.add(new T3.HemisphereLight(0xdcd6ff, 0x1a1680, 1.4));
      const key = new T3.DirectionalLight(0xffffff, 2.2);
      key.position.set(-4, 6, 8);
      scene.add(key);
      const rim = new T3.DirectionalLight(0xb9a8e8, 1.6);
      rim.position.set(6, -2, -6);
      scene.add(rim);

      const rounded = await makeRounded(T3);
      const logoCanvas = document.createElement("canvas");
      logoCanvas.width = logoCanvas.height = 256;
      drawIcon(logoCanvas.getContext("2d")!, 28, 28, 200, "rgba(255,255,255,.85)");
      const mats = {
        shell: new T3.MeshStandardMaterial({ color: kind === "laptop" ? 0x26243a : 0xb9a8e8, metalness: 0.55, roughness: 0.38 }),
        deck: new T3.MeshStandardMaterial({ color: kind === "laptop" ? 0x17162a : 0x8f7fd0, metalness: 0.4, roughness: 0.5 }),
        logo: new T3.MeshBasicMaterial({ map: new T3.CanvasTexture(logoCanvas), transparent: true }),
      };
      (mats.logo.map as THREE_NS.Texture).colorSpace = T3.SRGBColorSpace;
      const build = kind === "laptop" ? buildLaptop : buildPhone;

      // ---- devices
      const devices = items.map(() => {
        const d = build(T3, rounded, mats);
        scene.add(d.root);
        return d;
      });

      // ---- screen content
      await document.fonts.ready;
      const images = await Promise.all(items.map((it) => Promise.all((kind === "laptop" ? it.images.slice(0, 1) : it.images).map(loadImg))));
      if (disposed) return;

      type Screen = { tex: THREE_NS.Texture; frac: number; canvas?: HTMLCanvasElement; ctx?: CanvasRenderingContext2D };
      const screens: Screen[] = items.map((it, i) => {
        if (kind === "laptop") {
          const img = images[i][0];
          const tex = new T3.Texture(img);
          tex.colorSpace = T3.SRGBColorSpace;
          tex.anisotropy = 4;
          tex.needsUpdate = true;
          const screenAspect = LAPTOP.screenH / LAPTOP.screenW;
          const imgAspect = img.height && img.width ? img.height / img.width : 3;
          const frac = Math.min(1, screenAspect / imgAspect); // like object-fit: cover across the width
          tex.repeat.set(1, frac);
          tex.offset.set(0, 1 - frac); // top of the site
          return { tex, frac };
        }
        const canvas = document.createElement("canvas");
        canvas.width = SCREEN_PX.w;
        canvas.height = SCREEN_PX.h;
        const ctx = canvas.getContext("2d")!;
        drawPost(ctx, it, images[i], { slide: 0, push: 0, heart: 0, story: 0 });
        const tex = new T3.CanvasTexture(canvas);
        tex.colorSpace = T3.SRGBColorSpace;
        return { tex, frac: 1, canvas, ctx };
      });
      devices.forEach((d, i) => {
        (d.screen.material as THREE_NS.MeshBasicMaterial).dispose();
        d.screen.material = new T3.MeshBasicMaterial({ map: screens[i].tex, toneMapped: false });
      });

      // ---- intro device with the title card
      const titleCanvas = document.createElement("canvas");
      const tw = kind === "laptop" ? 1024 : 540;
      const th = kind === "laptop" ? Math.round((1024 * LAPTOP.screenH) / LAPTOP.screenW) : SCREEN_PX.h;
      titleCanvas.width = tw;
      titleCanvas.height = th;
      const tctx = titleCanvas.getContext("2d")!;
      drawTitleCard(tctx, tw, th, title, 0);
      const titleTex = new T3.CanvasTexture(titleCanvas);
      titleTex.colorSpace = T3.SRGBColorSpace;
      const hero = build(T3, rounded, mats);
      hero.screen.material = new T3.MeshBasicMaterial({ map: titleTex, toneMapped: false });
      scene.add(hero.root);
      if (overlayRef.current) overlayRef.current.style.backgroundImage = `url(${titleCanvas.toDataURL("image/jpeg", 0.85)})`;

      // ---- layout
      const STEP = kind === "laptop" ? new T3.Vector3(4.1, 1.1, 0.8) : new T3.Vector3(1.75, 0.7, 0.55);
      if (mobile) STEP.set(kind === "laptop" ? 6 : 3.2, 0.2, 0.4);
      const tilted = new T3.Quaternion().setFromEuler(new T3.Euler(kind === "laptop" ? 0.2 : 0.08, kind === "laptop" ? -0.75 : -0.6, kind === "laptop" ? 0.05 : 0.12));
      const facing = new T3.Quaternion().setFromEuler(new T3.Euler(kind === "laptop" ? 0.32 : 0, kind === "laptop" ? -0.12 : -0.1, 0));
      const turned = new T3.Quaternion().setFromAxisAngle(new T3.Vector3(0, 1, 0), Math.PI);
      const q = new T3.Quaternion();
      const tmpQ = new T3.Quaternion();

      let pos = 0; // animated index
      let targetIdx = 0;
      let lastReported = -1;
      let lidToggle = 1; // 1 open, 0 closed (Open / close button)
      let lidToggleVal = 1;
      let flip = 0; // "Turn it around"
      let flipVal = 0;

      // ---- intro clock
      let phase: "intro" | "fly" | "done" = reduced ? "done" : "intro";
      let phaseStart = performance.now();
      let fly = reduced ? 1 : 0;
      const INTRO_OPEN = mobile ? 900 : 1300;
      const INTRO_TITLE = 900;
      const INTRO_ZOOM = mobile ? 0 : 1100;
      const FLY = 1100;
      setReady(true);

      const endIntro = () => {
        if (phase === "done") return;
        phase = "done";
        fly = 1;
        hero.root.visible = false;
        camera.position.set(0, 0, CAM_Z);
        if (overlayRef.current) overlayRef.current.style.opacity = "0";
        setIntro(false);
      };
      if (reduced) endIntro();

      // ---- controls
      const go = (i: number) => {
        targetIdx = Math.max(0, Math.min(items.length - 1, i));
      };
      api.current = {
        go,
        toggle: () => {
          if (kind === "laptop") lidToggle = lidToggle ? 0 : 1;
          else flip = flip ? 0 : 1;
        },
        skip: endIntro,
      };

      let wheel = 0, wheelAt = 0, locked = false, lastDelta = 0;
      const onWheel = (e: WheelEvent) => {
        if (phase !== "done") return;
        e.preventDefault();
        const now = performance.now();
        const amount = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        if (now - wheelAt > 160) { wheel = 0; locked = false; }
        if (locked && Math.abs(amount) > lastDelta * 2 + 8) locked = false;
        wheelAt = now;
        lastDelta = Math.abs(amount);
        if (locked) return;
        wheel += amount;
        if (Math.abs(wheel) > 30) {
          go(targetIdx + Math.sign(wheel));
          wheel = 0;
          locked = true;
        }
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape" && phase !== "done") endIntro();
        if (phase !== "done") return;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") go(targetIdx + 1);
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") go(targetIdx - 1);
      };
      let dragX: number | null = null, dragStart = 0, dragged = false;
      const onDown = (e: PointerEvent) => {
        dragX = e.clientX;
        dragStart = targetIdx;
        dragged = false;
      };
      const onMove = (e: PointerEvent) => {
        updateHover(e);
        if (dragX === null || phase !== "done") return;
        const dx = e.clientX - dragX;
        if (Math.abs(dx) > 8) dragged = true;
        const per = mobile ? window.innerWidth * 0.5 : 220;
        go(Math.round(dragStart - dx / per));
      };
      const onUp = () => (dragX = null);

      // ---- hover + click via invisible boxes
      const ray = new T3.Raycaster();
      const ndc = new T3.Vector2();
      let hovered = -1;
      const hits = devices.map((d) => d.hit);
      const updateHover = (e: PointerEvent) => {
        const r = renderer.domElement.getBoundingClientRect();
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        ray.setFromCamera(ndc, camera);
        const hit = phase === "done" ? ray.intersectObjects(hits, false)[0] : undefined;
        hovered = hit ? hits.indexOf(hit.object as THREE_NS.Mesh) : -1;
        renderer.domElement.style.cursor = hovered >= 0 ? "pointer" : dragX !== null ? "grabbing" : "grab";
      };
      const onClick = () => {
        if (dragged || hovered < 0) return;
        if (hovered !== Math.round(pos)) return go(hovered);
        const it = items[hovered];
        if (kind === "laptop") {
          if (it.href) window.open(it.href, "_blank", "noopener");
        } else {
          setBoxIdx(0);
          setBox(hovered);
        }
      };
      const el = renderer.domElement;
      el.addEventListener("wheel", onWheel, { passive: false });
      el.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      el.addEventListener("click", onClick);
      window.addEventListener("keydown", onKey);

      // ---- size
      const resize = () => {
        const w = mount.clientWidth, h = mount.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // keep the strip framed on narrow screens
        camera.fov = w / h < 1 ? 46 : 32;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(mount);

      // ---- loop
      let raf = 0, last = performance.now(), running = true;
      const v3 = new T3.Vector3();
      const v3b = new T3.Vector3();
      let midState = { slide: 0, push: 0, heart: 0, story: 0 };
      let midClock = 0, midIndex = -1, scrollClock = 0;
      const midScreenOffsets = screens.map((s) => 1 - s.frac);

      const placeDevice = (d: Device, dist: number, i: number, now: number) => {
        // position along the diagonal; laptops more than a step behind shrink away from the credits
        const flyIn = phase === "done" ? 0 : (1 - easeOut(fly)) * (8 + Math.abs(dist) * 0.6);
        d.root.position.copy(STEP).multiplyScalar(dist + flyIn * 0.6);
        d.root.position.y += reduced ? 0 : Math.sin(now / 1000 + d.bob) * 0.06;
        const behind = Math.max(0, -dist - 1);
        const sc = Math.max(0.0001, 1 - clamp01(behind / 1.5));
        d.root.scale.setScalar(sc);
        d.root.visible = sc > 0.01 && dist < 7;
        // turn toward the viewer as it reaches the middle
        q.copy(tilted).slerp(facing, inOut(1 - Math.min(1, Math.abs(dist))));
        if (kind === "phone") {
          // phones two steps ahead show their backs and turn round as they arrive
          const back = clamp01(dist - 1);
          const flipNow = i === Math.round(pos) ? flipVal : 0;
          const turn = Math.max(back, flipNow);
          if (turn > 0) {
            tmpQ.copy(q).multiply(turned);
            q.slerp(tmpQ, inOut(turn));
          }
          if (phase !== "done" && fly < 1) {
            tmpQ.copy(q).multiply(turned);
            q.slerp(tmpQ, 1 - easeOut(fly));
          }
        }
        d.body.quaternion.copy(q);
        if (d.lid) {
          const a = Math.abs(dist);
          let open = a < 1 ? lerp(110, 60, a) : a < 2 ? lerp(60, 15, a - 1) : 15;
          if (i === Math.round(pos)) open = lerp(8, open, lidToggleVal);
          d.lid.rotation.x = T3.MathUtils.degToRad(90 - open);
        }
      };

      const tick = (now: number) => {
        raf = requestAnimationFrame(tick);
        if (!running) return;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;

        pos += (targetIdx - pos) * (1 - Math.exp(-dt * 7));
        lidToggleVal += (lidToggle - lidToggleVal) * (1 - Math.exp(-dt * 5));
        flipVal += (flip - flipVal) * (1 - Math.exp(-dt * 5));
        const mid = Math.round(pos);
        if (mid !== lastReported) {
          lastReported = mid;
          setCurrent(mid);
        }

        // ---- intro
        if (phase === "intro") {
          const t = now - phaseStart;
          hero.root.visible = true;
          hero.root.position.set(0, Math.sin(now / 600) * 0.08, 0);
          if (kind === "laptop") {
            const open = easeOut(clamp01((t - 300) / INTRO_OPEN)) * 110;
            hero.lid!.rotation.x = T3.MathUtils.degToRad(90 - open);
            hero.body.quaternion.setFromEuler(new T3.Euler(0.32 - 0.1 * clamp01(t / INTRO_OPEN), Math.sin(now / 900) * 0.08 * (1 - clamp01(t / INTRO_OPEN)), 0));
          } else {
            // start from the back; one half-turn to face you
            const turn = easeOut(clamp01((t - 300) / INTRO_OPEN));
            hero.body.quaternion.setFromEuler(new T3.Euler(0, Math.PI * (1 - turn) + Math.sin(now / 900) * 0.06 * (1 - turn), 0));
          }
          drawTitleCard(tctx, tw, th, title, clamp01((t - INTRO_OPEN * 0.6) / INTRO_TITLE));
          titleTex.needsUpdate = true;
          const zt = clamp01((t - INTRO_OPEN - INTRO_TITLE) / Math.max(1, INTRO_ZOOM));
          if (INTRO_ZOOM && zt > 0) {
            // fly at the middle of the screen, speeding up, until it covers the view
            hero.screen.getWorldPosition(v3);
            const sw = kind === "laptop" ? LAPTOP.screenW : PHONE.screenW;
            const sh = kind === "laptop" ? LAPTOP.screenH : PHONE.screenH;
            const fov = T3.MathUtils.degToRad(camera.fov);
            const near = Math.min(sh, sw / camera.aspect) / (2 * Math.tan(fov / 2));
            const k = zt * zt;
            camera.position.set(lerp(0, v3.x, k), lerp(0, v3.y, k), lerp(CAM_Z, v3.z + near, k));
            camera.lookAt(lerp(0, v3.x, k), lerp(0, v3.y, k), v3.z);
          }
          if (t > INTRO_OPEN + INTRO_TITLE + INTRO_ZOOM) {
            phase = "fly";
            phaseStart = now;
            hero.root.visible = false;
            camera.position.set(0, 0, CAM_Z);
            camera.lookAt(0, 0, 0);
            // swap to a full-screen title card that keeps zooming as it fades
            const ov = overlayRef.current;
            if (ov) {
              ov.style.transition = "none";
              ov.style.opacity = "1";
              ov.style.transform = "scale(1)";
              requestAnimationFrame(() => {
                ov.style.transition = "opacity .9s ease, transform 1.2s ease";
                ov.style.opacity = "0";
                ov.style.transform = "scale(1.25)";
              });
            }
          }
        } else if (phase === "fly") {
          fly = clamp01((now - phaseStart) / FLY);
          if (fly >= 1) endIntro();
        }

        // ---- strip
        devices.forEach((d, i) => {
          d.root.visible = phase !== "intro";
          if (phase === "intro") return;
          placeDevice(d, i - pos, i, now);
        });

        // ---- the middle device's screen
        if (phase !== "intro") {
          if (midIndex !== mid) {
            // reset the one we left
            if (midIndex >= 0) {
              if (kind === "laptop") screens[midIndex].tex.offset.y = midScreenOffsets[midIndex];
              else {
                drawPost(screens[midIndex].ctx!, items[midIndex], images[midIndex], { slide: 0, push: 0, heart: 0, story: 0 });
                screens[midIndex].tex.needsUpdate = true;
              }
            }
            midIndex = mid;
            midClock = 0;
            scrollClock = 0;
            midState = { slide: 0, push: 0, heart: 0, story: 0 };
          }
          if (!reduced) {
            midClock += dt;
            if (kind === "laptop") {
              // scroll the site: ~220 screen px/s, ease in/out, 1.2s pause top and bottom
              const s = screens[mid];
              const travel = 1 - s.frac;
              const img = images[mid][0];
              // distance in site pixels (1440 wide), shown at roughly 0.42x on screen
              const sitePx = travel * (img?.height || 1) * (1440 / (img?.width || 1440));
              const dur = Math.max(2, (sitePx * 0.42) / 220);
              const cycle = 1.2 + dur + 1.2 + dur;
              scrollClock = (scrollClock + dt) % cycle;
              let k: number;
              if (scrollClock < 1.2) k = 0;
              else if (scrollClock < 1.2 + dur) k = inOut((scrollClock - 1.2) / dur);
              else if (scrollClock < 2.4 + dur) k = 1;
              else k = 1 - inOut((scrollClock - 2.4 - dur) / dur);
              s.tex.offset.y = travel * (1 - k);
            } else {
              const it = items[mid];
              const imgs = images[mid];
              if (it.format === "9:16") {
                midState.story = clamp01(midClock / 5);
                if (midClock > 5) { midClock = 0; midState.slide++; midState.story = 0; }
              } else if (imgs.length > 1) {
                const t = midClock % 2.5;
                midState.push = t > 2.05 ? easeOut(clamp01((t - 2.05) / 0.45)) : 0;
                if (midClock >= 2.5) { midClock -= 2.5; midState.slide++; midState.push = 0; }
              } else {
                midState.push = Math.min(1, midClock / 6);
                midState.heart = clamp01((midClock - 1.4) / 1.1);
                if (midClock > 7) midClock = 0;
              }
              drawPost(screens[mid].ctx!, it, imgs, midState);
              screens[mid].tex.needsUpdate = true;
            }
          }
        }

        // ---- marker loop around the hovered device
        const path = loopRef.current;
        if (path) {
          if (hovered >= 0 && phase === "done") {
            const d = devices[hovered];
            d.root.getWorldPosition(v3);
            const r = renderer.domElement.getBoundingClientRect();
            const project = (p: THREE_NS.Vector3) => {
              v3b.copy(p).project(camera);
              return [((v3b.x + 1) / 2) * r.width, ((1 - v3b.y) / 2) * r.height];
            };
            const [cx, cy] = project(v3);
            const half = d.size.clone().multiplyScalar(0.5 * d.root.scale.x);
            const [rx] = project(v3.clone().add(new T3.Vector3(half.x * 1.25, 0, 0)));
            const [, ry] = project(v3.clone().add(new T3.Vector3(0, half.y * 1.2, 0)));
            const boil = Math.floor(now / 85);
            path.setAttribute("d", markerPath(cx, cy, Math.abs(rx - cx), Math.abs(ry - cy), boil * 7919 + 13, now / 4000));
            path.style.opacity = "1";
          } else path.style.opacity = "0";
        }

        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(tick);

      // pause when hidden
      const onVis = () => {
        running = !document.hidden;
        last = performance.now();
      };
      document.addEventListener("visibilitychange", onVis);
      const io = new IntersectionObserver(([e]) => {
        running = e.isIntersecting && !document.hidden;
        last = performance.now();
      });
      io.observe(mount);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        el.removeEventListener("wheel", onWheel);
        el.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        el.removeEventListener("click", onClick);
        window.removeEventListener("keydown", onKey);
        scene.traverse((o) => {
          const m = o as THREE_NS.Mesh;
          m.geometry?.dispose();
          const mat = m.material as THREE_NS.Material | THREE_NS.Material[] | undefined;
          (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => {
            (x as THREE_NS.MeshBasicMaterial).map?.dispose();
            x.dispose();
          });
        });
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();
    return () => {
      disposed = true;
      cleanup();
    };
  }, [items, kind, title]);

  const big = item?.bigNumber && !isPlaceholder(item.bigNumber) ? item.bigNumber : item?.fallbackBig;
  const bigLabel = item?.bigNumber && !isPlaceholder(item.bigNumber) ? item.bigLabel : kind === "laptop" ? "Year" : "Date";

  return (
    <div className={styles.wrap} data-kind={kind}>
      <div className={styles.backdrop} aria-hidden="true" />
      <div ref={mountRef} className={styles.canvas} />

      <svg className={styles.loopSvg} aria-hidden="true">
        <path ref={loopRef} pathLength={1} />
      </svg>

      {/* credits, top-left */}
      <div className={styles.credits}>
        <p className={styles.count}>
          {String(current + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </p>
        <h1 className={styles.title}><T>{item?.title}</T></h1>
        <dl className={styles.table}>
          {item?.rows.filter(([, v]) => v).map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd><T>{v}</T></dd></div>
          ))}
        </dl>
        <ol className={styles.list}>
          {items.map((it, i) => (
            <li key={it.slug}>
              <button type="button" aria-current={i === current || undefined} onClick={() => api.current.go(i)}>
                <span>{String(i + 1).padStart(2, "0")}</span> <T>{it.title}</T>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.big}>
        <span className={styles.bigLabel}>{bigLabel}</span>
        <span className={styles.bigNum} data-ph={isPlaceholder(big) || undefined}><T>{big}</T></span>
      </div>

      <ul className={styles.facts}>
        {item?.facts.map((f, i) => <li key={i}><T>{f}</T></li>)}
      </ul>

      <div className={styles.topRight}>
        <button type="button" className="btn btn--sm btn--outline-light" onClick={() => api.current.toggle()}>
          {kind === "laptop" ? "Open / close" : "Turn it around"}
        </button>
        {item?.href ? (
          <a href={item.href} target="_blank" rel="noopener" className="btn btn--sm btn--light">{primaryLabel}</a>
        ) : (
          <span className={styles.disabled}>{primaryLabel.replace(" ↗", "")}: coming soon</span>
        )}
      </div>

      <div className={styles.bottomRight}>
        <div className={styles.arrows}>
          <button type="button" aria-label="Previous" onClick={() => api.current.go(current - 1)} disabled={current === 0}>←</button>
          <button type="button" aria-label="Next" onClick={() => api.current.go(current + 1)} disabled={current === items.length - 1}>→</button>
        </div>
        <a href="/talk/" className="btn btn--sm btn--light">Start a project ↗</a>
      </div>

      <div ref={overlayRef} className={styles.overlay} aria-hidden="true" />
      {intro && !failed && (
        <button type="button" className={styles.skip} onClick={() => api.current.skip()}>Skip intro</button>
      )}
      {!ready && !failed && <p className={styles.loading}>Loading…</p>}
      {failed && <p className={styles.loading}>3D view isn&apos;t available on this device. The full list is below.</p>}

      {box !== null && (
        <Lightbox
          items={items[box].images.map((src, k) => ({ src, alt: `Poster ${k + 1}`, caption: <T>{items[box].title}</T> }))}
          index={boxIdx}
          onIndex={setBoxIdx}
          onClose={() => setBox(null)}
        />
      )}
    </div>
  );
}
