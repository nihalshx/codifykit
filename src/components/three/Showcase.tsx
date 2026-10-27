"use client";
/**
 * Floating-device showcase (Three.js), shared by /work/web (laptops) and /work/apps (phones).
 * Specs: prompts/floating-laptops-web-prompt.md and prompts/floating-phones-posters-prompt.md.
 *
 * The devices are modelled in code (no GLB needed). When licensed GLB models arrive, swap
 * buildLaptop / buildPhone for a loader; everything else (strip, controls, intro, loop) stays.
 */
import { useEffect, useRef, useState } from "react";
import type * as THREE_NS from "three";
import { T } from "@/components/ui/T";
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
  images: string[]; // site screenshot (laptop) or app screens (phone)
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
  setLid?: (openDeg: number) => void; // laptop hinge: 0 closed, 110 open
  screen: THREE_NS.Mesh;
  hit: THREE_NS.Mesh; // invisible box for hover/click
  size: THREE_NS.Vector3;
  bob: number;
};

/**
 * Laptop: public/models/laptop.glb, the Sketchfab "Apple MacBook Pro" by Andrey 3D, split by
 * scripts/split-macbook.mjs into a base, a hinged lid (node "screenflip", upright at rotation 0)
 * and a separate "screen" plane (UVs 0..1, top-left = 0,0) that shows the site.
 */
const MAC_W = 0.313; // model units (metres)
const LAPTOP_SCALE = 3.2 / MAC_W;
const LAPTOP = { screenW: 0.3005 * LAPTOP_SCALE, screenH: 0.1924 * LAPTOP_SCALE };
const hinge = (deg: number) => ((90 - deg) * Math.PI) / 180; // 0 closed, 90 upright, 110 open

// the phone GLB is scaled to this height; screen size measured from public/models/phone.glb
const PHONE = { w: 1.02, h: 2.12, t: 0.1, screenW: 0.947, screenH: 2.06 };

/** public/models/manifest.json lists which device models exist, e.g. { "laptop": "/models/laptop.glb", "phone": null } */
async function loadGLB(kind: "laptop" | "phone") {
  const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
    import("three/examples/jsm/loaders/GLTFLoader.js"),
    import("three/examples/jsm/libs/meshopt_decoder.module.js"),
  ]);
  try {
    const manifest = (await (await fetch("/models/manifest.json")).json()) as Record<string, string | null>;
    const url = manifest[kind];
    if (!url) return null;
    return (await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(url)).scene;
  } catch {
    return null;
  }
}

async function makeRounded() {
  const { RoundedBoxGeometry } = await import("three/examples/jsm/geometries/RoundedBoxGeometry.js");
  return (w: number, h: number, d: number, r: number) => new RoundedBoxGeometry(w, h, d, 4, r) as THREE_NS.BufferGeometry;
}

function findScreen(model: THREE_NS.Object3D) {
  let screen: THREE_NS.Mesh | null = null;
  model.traverse((o) => {
    const m = o as THREE_NS.Mesh;
    if (!screen && m.isMesh && /screen|display/i.test((m.material as THREE_NS.Material).name)) screen = m;
  });
  return screen as THREE_NS.Mesh | null;
}

function buildLaptop(T3: THREE, template: THREE_NS.Object3D): Device {
  const root = new T3.Group();
  const body = new T3.Group();
  root.add(body);
  const model = template.clone(true);
  model.scale.setScalar(LAPTOP_SCALE);
  // centre it: the base sits at y = 0 and the lid rises 0.21 m from the hinge
  model.position.set(0, -0.09 * LAPTOP_SCALE, 0);
  body.add(model);
  const flip = model.getObjectByName("screenflip")!;
  const screen = findScreen(model)!;
  screen.material = new T3.MeshBasicMaterial({ color: 0x0d0d14, toneMapped: false });
  const hit = new T3.Mesh(new T3.BoxGeometry(3.4, 2.6, 2.4), new T3.MeshBasicMaterial({ visible: false }));
  hit.position.y = 0.2;
  root.add(hit);
  return {
    root, body, screen, hit,
    setLid: (deg) => (flip.rotation.x = hinge(deg)),
    size: new T3.Vector3(3.2, 2.4, 2.2),
    bob: Math.random() * Math.PI * 2,
  };
}

/** Phone: public/models/phone.glb when it exists (any GLB whose screen material is named "screen"/"display"). */
function buildPhoneFromModel(T3: THREE, template: THREE_NS.Object3D): Device | null {
  const root = new T3.Group();
  const body = new T3.Group();
  root.add(body);
  const model = template.clone(true);
  const box = new T3.Box3().setFromObject(model);
  const size = box.getSize(new T3.Vector3());
  const k = PHONE.h / Math.max(size.y, 1e-6);
  model.scale.setScalar(k);
  model.position.copy(box.getCenter(new T3.Vector3()).multiplyScalar(-k));
  body.add(model);
  const screen = findScreen(model);
  if (!screen) return null;
  screen.material = new T3.MeshBasicMaterial({ color: 0x0d0d14, toneMapped: false });
  const hit = new T3.Mesh(new T3.BoxGeometry(PHONE.w * 1.1, PHONE.h * 1.05, 0.4), new T3.MeshBasicMaterial({ visible: false }));
  root.add(hit);
  return { root, body, screen, hit, size: new T3.Vector3(PHONE.w, PHONE.h, PHONE.t), bob: Math.random() * Math.PI * 2 };
}

/** Phone fallback, modelled in code, used until a phone GLB is supplied. */
function buildPhone(T3: THREE, rounded: (w: number, h: number, d: number, r: number) => THREE_NS.BufferGeometry, mats: Record<string, THREE_NS.Material>): Device {
  const root = new T3.Group();
  const body = new T3.Group();
  root.add(body);
  const shell = new T3.Mesh(rounded(PHONE.w, PHONE.h, PHONE.t, 0.13), mats.shell);
  body.add(shell);
  const bezel = new T3.Mesh(rounded(PHONE.w - 0.02, PHONE.h - 0.02, PHONE.t + 0.004, 0.12), mats.bezel);
  bezel.scale.z = 0.5;
  bezel.position.z = PHONE.t * 0.26;
  body.add(bezel);
  const screen = new T3.Mesh(new T3.PlaneGeometry(PHONE.screenW, PHONE.screenH), new T3.MeshBasicMaterial({ color: 0x0d0d14, toneMapped: false }));
  screen.position.z = PHONE.t / 2 + 0.004;
  body.add(screen);
  // camera plateau with three lenses
  const plate = new T3.Mesh(rounded(0.46, 0.46, 0.05, 0.1), mats.shell);
  plate.position.set(-0.22, 0.73, -PHONE.t / 2 - 0.02);
  body.add(plate);
  [[-0.32, 0.83], [-0.32, 0.63], [-0.13, 0.73]].forEach(([x, y]) => {
    const ring = new T3.Mesh(new T3.CylinderGeometry(0.075, 0.075, 0.05, 32), mats.lensRing);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(x, y, -PHONE.t / 2 - 0.06);
    const glass = new T3.Mesh(new T3.CircleGeometry(0.055, 32), mats.lens);
    glass.position.set(x, y, -PHONE.t / 2 - 0.086);
    glass.rotation.y = Math.PI;
    body.add(ring, glass);
  });
  // side buttons
  [[PHONE.w / 2 + 0.006, 0.42, 0.22], [-PHONE.w / 2 - 0.006, 0.5, 0.12], [-PHONE.w / 2 - 0.006, 0.3, 0.16]].forEach(([x, y, h]) => {
    const b = new T3.Mesh(rounded(0.02, h, 0.04, 0.008), mats.shell);
    b.position.set(x, y, 0);
    body.add(b);
  });
  const logo = new T3.Mesh(new T3.PlaneGeometry(0.24, 0.24), mats.logo);
  logo.position.set(0, -0.05, -PHONE.t / 2 - 0.002);
  logo.rotation.y = Math.PI;
  body.add(logo);
  const hit = new T3.Mesh(new T3.BoxGeometry(PHONE.w * 1.1, PHONE.h * 1.05, 0.4), new T3.MeshBasicMaterial({ visible: false }));
  root.add(hit);
  return { root, body, screen, hit, size: new T3.Vector3(PHONE.w, PHONE.h, PHONE.t), bob: Math.random() * Math.PI * 2 };
}

// ---------------------------------------------------------------- app screens (phone)
const SCREEN_PX = { w: 540, h: Math.round((540 * PHONE.screenH) / PHONE.screenW) };
type AppState = { slide: number; push: number; scroll: number; tap: number };
const APP_IDLE: AppState = { slide: 0, push: 0, scroll: 0, tap: 0 };

/** One app screen, full-bleed; tall screens scroll, sets slide like native navigation, plus a tap ripple. */
function drawApp(ctx: CanvasRenderingContext2D, imgs: HTMLImageElement[], st: AppState) {
  const { w, h } = SCREEN_PX;
  ctx.fillStyle = "#0d0d12";
  ctx.fillRect(0, 0, w, h);
  const draw = (img: HTMLImageElement | undefined, x: number, scroll: number) => {
    if (!img?.width) return;
    const dh = (img.height * w) / img.width; // fit the width, like a phone app
    const overflow = Math.max(0, dh - h);
    ctx.drawImage(img, x, -overflow * scroll, w, dh);
  };
  const n = imgs.length;
  const cur = imgs[st.slide % n];
  if (n > 1 && st.push > 0) {
    const next = imgs[(st.slide + 1) % n];
    draw(cur, -st.push * w * 0.3, st.scroll); // current slides out a little (native push)
    ctx.fillStyle = `rgba(0,0,0,${0.35 * st.push})`;
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.35)";
    ctx.shadowBlur = 30;
    draw(next, (1 - st.push) * w, 0);
    ctx.restore();
  } else draw(cur, 0, st.scroll);
  if (st.tap > 0 && st.tap < 1) {
    ctx.beginPath();
    ctx.arc(w * 0.66, h * 0.62, 26 + 30 * st.tap, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.55 * (1 - st.tap)})`;
    ctx.fill();
  }
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
  section,
  primaryLabel,
}: {
  kind: Kind;
  items: ShowcaseItem[];
  title: string; // intro title card
  section: string; // breadcrumb + intro label, e.g. "Websites"
  primaryLabel: string; // "Visit live site ↗" / "Open case study →"
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const loopRef = useRef<SVGPathElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const api = useRef<{ go: (i: number) => void; toggle: () => void; skip: () => void }>({ go: () => {}, toggle: () => {}, skip: () => {} });
  const [current, setCurrent] = useState(0);
  const [intro, setIntro] = useState(true);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
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
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
      renderer.outputColorSpace = T3.SRGBColorSpace;
      mount.appendChild(renderer.domElement);

      const scene = new T3.Scene();
      const camera = new T3.PerspectiveCamera(32, 1, 0.1, 200);
      const CAM_Z = (kind === "laptop" ? 10.5 : 7.4) * (mobile ? 0.85 : 1);
      camera.position.set(0, 0, CAM_Z);

      scene.add(new T3.HemisphereLight(0xdcd6ff, 0x1a1680, 1.4));
      const key = new T3.DirectionalLight(0xffffff, 2.2);
      key.position.set(-4, 6, 8);
      scene.add(key);
      const rim = new T3.DirectionalLight(0xb9a8e8, 1.6);
      rim.position.set(6, -2, -6);
      scene.add(rim);

      // studio lighting so metal reads as metal
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      const pmrem = new T3.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

      const rounded = await makeRounded();
      const logoCanvas = document.createElement("canvas");
      logoCanvas.width = logoCanvas.height = 256;
      drawIcon(logoCanvas.getContext("2d")!, 28, 28, 200, "rgba(255,255,255,.85)");
      const mats = {
        shell: new T3.MeshStandardMaterial({ color: 0xc9bfe8, metalness: 0.75, roughness: 0.28 }),
        bezel: new T3.MeshStandardMaterial({ color: 0x0b0b0f, metalness: 0.2, roughness: 0.4 }),
        lensRing: new T3.MeshStandardMaterial({ color: 0xd9d2f0, metalness: 0.9, roughness: 0.2 }),
        lens: new T3.MeshStandardMaterial({ color: 0x0a0a12, metalness: 0.4, roughness: 0.05 }),
        logo: new T3.MeshBasicMaterial({ map: new T3.CanvasTexture(logoCanvas), transparent: true }),
      };
      (mats.logo.map as THREE_NS.Texture).colorSpace = T3.SRGBColorSpace;
      const template = await loadGLB(kind);
      if (disposed) return;
      const maxAniso = renderer.capabilities.getMaxAnisotropy();
      template?.traverse((o) => {
        const m = (o as THREE_NS.Mesh).material as THREE_NS.MeshStandardMaterial | undefined;
        if (!m) return;
        [m.map, m.normalMap, m.roughnessMap, m.metalnessMap, m.aoMap, m.emissiveMap].forEach((t) => t && (t.anisotropy = maxAniso));
      });
      if (kind === "laptop" && !template) {
        setFailed(true);
        return;
      }
      // a GLB screen uses glTF UVs (textures not flipped); the coded phone uses a plain plane
      const gltfScreen = kind === "laptop" || !!(template && findScreen(template));
      const build = (): Device =>
        kind === "laptop"
          ? buildLaptop(T3, template!)
          : (template && buildPhoneFromModel(T3, template)) || buildPhone(T3, rounded, mats);

      // ---- devices
      const devices = items.map(() => {
        const d = build();
        scene.add(d.root);
        return d;
      });

      // ---- screen content
      await document.fonts.ready;
      const total = items.reduce((n, it) => n + (kind === "laptop" ? 1 : it.images.length), 0);
      let done = 0;
      const tracked = (src: string) => loadImg(src).then((img) => (setProgress(Math.round((++done / total) * 100)), img));
      const images = await Promise.all(items.map((it) => Promise.all((kind === "laptop" ? it.images.slice(0, 1) : it.images).map(tracked))));
      if (disposed) return;

      type Screen = { tex: THREE_NS.Texture; frac: number; canvas?: HTMLCanvasElement; ctx?: CanvasRenderingContext2D };
      const screens: Screen[] = items.map((it, i) => {
        if (kind === "laptop") {
          const img = images[i][0];
          const tex = new T3.Texture(img);
          tex.colorSpace = T3.SRGBColorSpace;
          tex.anisotropy = 8;
          tex.flipY = false; // glTF UVs: v = 0 is the top of the image
          tex.needsUpdate = true;
          const screenAspect = LAPTOP.screenH / LAPTOP.screenW;
          const imgAspect = img.height && img.width ? img.height / img.width : 3;
          const frac = Math.min(1, screenAspect / imgAspect); // like object-fit: cover across the width
          tex.repeat.set(1, frac);
          tex.offset.set(0, 0); // top of the site
          return { tex, frac };
        }
        const canvas = document.createElement("canvas");
        canvas.width = SCREEN_PX.w;
        canvas.height = SCREEN_PX.h;
        const ctx = canvas.getContext("2d")!;
        drawApp(ctx, images[i], APP_IDLE);
        const tex = new T3.CanvasTexture(canvas);
        tex.flipY = !gltfScreen;
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
      // phones turn sideways for the title card, so draw it landscape and rotate it onto the portrait screen
      const landCanvas = document.createElement("canvas");
      landCanvas.width = th;
      landCanvas.height = tw;
      const lctx = landCanvas.getContext("2d")!;
      const paintTitle = (t: number) => {
        if (kind === "laptop") return drawTitleCard(tctx, tw, th, title, t);
        drawTitleCard(lctx, th, tw, title, t);
        tctx.save();
        tctx.setTransform(1, 0, 0, 1, 0, 0);
        tctx.translate(0, th);
        tctx.rotate(-Math.PI / 2);
        tctx.drawImage(landCanvas, 0, 0);
        tctx.restore();
      };
      paintTitle(0);
      const titleTex = new T3.CanvasTexture(titleCanvas);
      titleTex.flipY = !gltfScreen;
      titleTex.colorSpace = T3.SRGBColorSpace;
      const hero = build();
      hero.screen.material = new T3.MeshBasicMaterial({ map: titleTex, toneMapped: false });
      scene.add(hero.root);
      if (overlayRef.current) {
        if (kind !== "laptop") paintTitle(1);
        const src = kind === "laptop" ? titleCanvas : landCanvas;
        if (kind === "laptop") drawTitleCard(tctx, tw, th, title, 1);
        overlayRef.current.style.backgroundImage = `url(${src.toDataURL("image/jpeg", 0.85)})`;
        paintTitle(0);
      }

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
      // the strip loops, so there are always devices ahead and behind
      const N = items.length;
      const mod = (v: number) => ((v % N) + N) % N;
      const wrapDist = (v: number) => v - N * Math.round(v / N);
      /** bring item i to the middle by the shortest way round */
      const go = (i: number) => {
        targetIdx += wrapDist(mod(i) - mod(Math.round(targetIdx)));
      };
      const step = (n: number) => {
        targetIdx = Math.round(targetIdx) + n;
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
          step(Math.sign(wheel));
          wheel = 0;
          locked = true;
        }
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape" && phase !== "done") endIntro();
        if (phase !== "done") return;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") step(1);
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") step(-1);
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
        targetIdx = Math.round(dragStart - dx / per);
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
        if (hovered !== mod(Math.round(pos))) return go(hovered);
        const it = items[hovered];
        if (!it.href) return;
        if (kind === "laptop") window.open(it.href, "_blank", "noopener");
        else window.location.href = it.href; // app case study
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
      let midState: AppState = { ...APP_IDLE };
      let midClock = 0, midIndex = -1, scrollClock = 0;
      const midScreenOffsets = screens.map(() => 0);

      const placeDevice = (d: Device, dist: number, i: number, now: number) => {
        // position along the diagonal; laptops more than a step behind shrink away from the credits
        const flyIn = phase === "done" ? 0 : (1 - easeOut(fly)) * (8 + Math.abs(dist) * 0.6);
        d.root.position.copy(STEP).multiplyScalar(dist + flyIn * 0.6);
        d.root.position.y += reduced ? 0 : Math.sin(now / 1000 + d.bob) * 0.06;
        const behind = Math.max(0, -dist - 1);
        // fade out at the far end of the loop so nothing pops at the seam
        const farEnd = clamp01((N / 2 - 0.4 - dist) / 0.8);
        const sc = Math.max(0.0001, (1 - clamp01(behind / 1.5)) * farEnd);
        d.root.scale.setScalar(sc);
        d.root.visible = sc > 0.01;
        // turn toward the viewer as it reaches the middle
        q.copy(tilted).slerp(facing, inOut(1 - Math.min(1, Math.abs(dist))));
        if (kind === "phone") {
          // phones two steps ahead show their backs and turn round as they arrive
          const back = clamp01(dist - 1);
          const flipNow = i === mod(Math.round(pos)) ? flipVal : 0;
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
        if (d.setLid) {
          const a = Math.abs(dist);
          let open = a < 1 ? lerp(110, 60, a) : a < 2 ? lerp(60, 15, a - 1) : 15;
          if (i === mod(Math.round(pos))) open = lerp(2, open, lidToggleVal);
          d.setLid(open);
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
        const mid = mod(Math.round(pos));
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
            hero.setLid!(open);
            hero.body.quaternion.setFromEuler(new T3.Euler(0.32 - 0.1 * clamp01(t / INTRO_OPEN), Math.sin(now / 900) * 0.08 * (1 - clamp01(t / INTRO_OPEN)), 0));
          } else {
            // start from the back; one half-turn to face you
            const turn = easeOut(clamp01((t - 300) / INTRO_OPEN));
            const land = inOut(clamp01((t - 300 - INTRO_OPEN * 0.85) / 650));
            hero.body.quaternion.setFromEuler(new T3.Euler(0, Math.PI * (1 - turn) + Math.sin(now / 900) * 0.06 * (1 - turn), -Math.PI / 2 * land));
          }
          paintTitle(clamp01((t - INTRO_OPEN * 0.6) / INTRO_TITLE));
          titleTex.needsUpdate = true;
          const zt = clamp01((t - INTRO_OPEN - INTRO_TITLE) / Math.max(1, INTRO_ZOOM));
          if (INTRO_ZOOM && zt > 0) {
            // fly at the middle of the screen, speeding up, until it covers the view
            hero.screen.getWorldPosition(v3);
            // the phone is landscape by now, so its screen is wide
            const sw = kind === "laptop" ? LAPTOP.screenW : PHONE.screenH;
            const sh = kind === "laptop" ? LAPTOP.screenH : PHONE.screenW;
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
          placeDevice(d, wrapDist(i - pos), i, now);
        });

        // ---- the middle device's screen
        if (phase !== "intro") {
          if (midIndex !== mid) {
            // reset the one we left
            if (midIndex >= 0) {
              if (kind === "laptop") screens[midIndex].tex.offset.y = midScreenOffsets[midIndex];
              else {
                drawApp(screens[midIndex].ctx!, images[midIndex], APP_IDLE);
                screens[midIndex].tex.needsUpdate = true;
              }
            }
            midIndex = mid;
            midClock = 0;
            scrollClock = 0;
            midState = { ...APP_IDLE };
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
              s.tex.offset.y = travel * k;
            } else {
              const imgs = images[mid];
              // each screen: scroll it, tap, then push to the next screen (4s per screen)
              const per = 4;
              const t = midClock % per;
              midState.scroll = inOut(clamp01((t - 0.6) / 2.2));
              midState.tap = clamp01((t - 2.9) / 0.5);
              midState.push = imgs.length > 1 ? easeOut(clamp01((t - 3.4) / 0.5)) : 0;
              if (midClock >= per) {
                midClock -= per;
                if (imgs.length > 1) midState.slide++;
                midState.push = 0;
              }
              drawApp(screens[mid].ctx!, imgs, midState);
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

  const year = new Date().getFullYear();
  const noun = kind === "laptop" ? "laptop" : "phone";

  return (
    <div className={styles.wrap} data-kind={kind} data-intro={intro || undefined}>
      <div className={styles.backdrop} aria-hidden="true" />
      <div ref={mountRef} className={styles.canvas} />

      <svg className={styles.loopSvg} aria-hidden="true">
        <path ref={loopRef} pathLength={1} />
      </svg>

      <p className={styles.crumbs}>Codifykit <span>/</span> Work <span>/</span> {section}</p>

      {/* credits, top-left */}
      <div className={styles.credits}>
        <p className={styles.count}>N° {String(current + 1).padStart(2, "0")} of {String(items.length).padStart(2, "0")}</p>
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

      <div className={styles.topRight}>
        <div className={styles.pager}>
          <button type="button" aria-label="Previous" onClick={() => api.current.go(current - 1)}>‹</button>
          <span>{String(current + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
          <button type="button" aria-label="Next" onClick={() => api.current.go(current + 1)}>›</button>
        </div>
        <button type="button" className={styles.turn} onClick={() => api.current.toggle()}>
          ↻ {kind === "laptop" ? "Open / close" : "Turn it around"}
        </button>
      </div>

      <div className={styles.big}>
        <span className={styles.bigLabel}>{bigLabel}</span>
        <span className={styles.bigNum} data-ph={isPlaceholder(big) || undefined}><T>{big}</T></span>
        <a href="/talk/" className={styles.small}>Start a project ↗</a>
      </div>

      <ul className={styles.facts}>
        {item?.facts.map((f, i) => <li key={i}><T>{f}</T></li>)}
      </ul>
      <p className={styles.hint}>Scroll, drag or click a {noun}</p>

      <div className={styles.bottomRight}>
        {item?.href ? (
          <a href={item.href} {...(kind === "laptop" ? { target: "_blank", rel: "noopener" } : {})} className={styles.small}>{primaryLabel}</a>
        ) : (
          <span className={styles.small} data-off>{primaryLabel.replace(" ↗", "")}: coming soon</span>
        )}
      </div>

      <div ref={overlayRef} className={styles.overlay} aria-hidden="true" />
      {intro && !failed && (
        <div className={styles.introUi} aria-hidden={!intro}>
          <span className={styles.introLeft}>Codifykit</span>
          <span className={styles.introRight}>{section}, {year}</span>
          <span className={styles.introLoad}><small>Loading</small>{String(progress).padStart(3, "0")}</span>
          <button type="button" className={styles.skip} onClick={() => api.current.skip()}>Skip intro</button>
        </div>
      )}
      {failed && <p className={styles.loading}>3D view isn&apos;t available on this device. The full list is below.</p>}

    </div>
  );
}
