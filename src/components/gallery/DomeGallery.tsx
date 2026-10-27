"use client";
/**
 * Dome gallery (after React Bits' DomeGallery): tiles on the inside of a sphere that you drag to
 * turn, with inertia. Clicking a tile (or Enter / Space on it) lifts it out of the dome into a
 * centred viewer; the scrim or Escape puts it back. Ported to TypeScript, scoped under
 * .sphere-root, with keyboard access, and with vertical page scroll left alone on touch screens.
 */
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useGesture } from "@use-gesture/react";
import "./DomeGallery.css";

export type DomeImage = { src: string; alt?: string };

type Item = { x: number; y: number; sizeX: number; sizeY: number; src: string; alt: string };

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const normalizeAngle = (d: number) => ((d % 360) + 360) % 360;
const wrapAngleSigned = (deg: number) => ((((deg + 180) % 360) + 360) % 360) - 180;
const getDataNumber = (el: HTMLElement, name: string, fallback: number) => {
  const attr = el.dataset[name];
  const n = attr == null ? NaN : parseFloat(attr);
  return Number.isFinite(n) ? n : fallback;
};

function buildItems(pool: DomeImage[], seg: number): Item[] {
  const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs = [-3, -1, 1, 3, 5];
  const coords = xCols.flatMap((x, c) => (c % 2 === 0 ? evenYs : oddYs).map((y) => ({ x, y, sizeX: 2, sizeY: 2 })));
  if (!pool.length) return coords.map((c) => ({ ...c, src: "", alt: "" }));
  const used = Array.from({ length: coords.length }, (_, i) => pool[i % pool.length]);
  // no two neighbours share a picture
  for (let i = 1; i < used.length; i++) {
    if (used[i].src !== used[i - 1].src) continue;
    for (let j = i + 1; j < used.length; j++) {
      if (used[j].src !== used[i].src) {
        [used[i], used[j]] = [used[j], used[i]];
        break;
      }
    }
  }
  return coords.map((c, i) => ({ ...c, src: used[i].src, alt: used[i].alt ?? "" }));
}

function computeItemBaseRotation(offsetX: number, offsetY: number, sizeX: number, sizeY: number, segments: number) {
  const unit = 360 / segments / 2;
  return { rotateX: unit * (offsetY - (sizeY - 1) / 2), rotateY: unit * (offsetX + (sizeX - 1) / 2) };
}

type Props = {
  images: DomeImage[];
  fit?: number;
  minRadius?: number;
  maxRadius?: number;
  padFactor?: number;
  overlayBlurColor?: string;
  maxVerticalRotationDeg?: number;
  dragSensitivity?: number;
  enlargeTransitionMs?: number;
  segments?: number;
  dragDampening?: number;
  openedImageWidth?: string;
  openedImageHeight?: string;
  imageBorderRadius?: string;
  openedImageBorderRadius?: string;
  grayscale?: boolean;
  /** slow turn on its own, in degrees per second (0 = off); pauses while dragging, gliding or open */
  autoRotateSpeed?: number;
};

export function DomeGallery({
  images,
  fit = 0.5,
  minRadius = 600,
  maxRadius = Infinity,
  padFactor = 0.25,
  overlayBlurColor = "#120F17",
  maxVerticalRotationDeg = 5,
  dragSensitivity = 20,
  enlargeTransitionMs = 300,
  segments = 35,
  dragDampening = 2,
  openedImageWidth = "400px",
  openedImageHeight = "400px",
  imageBorderRadius = "30px",
  openedImageBorderRadius = "30px",
  grayscale = true,
  autoRotateSpeed = 0,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const focusedElRef = useRef<HTMLElement | null>(null);
  const originalTilePositionRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);

  const rotationRef = useRef({ x: 0, y: 0 });
  const startRotRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const inertiaRAF = useRef<number | null>(null);
  const openingRef = useRef(false);
  const openStartedAtRef = useRef(0);
  const scrollLockedRef = useRef(false);

  const lockScroll = useCallback(() => {
    if (scrollLockedRef.current) return;
    scrollLockedRef.current = true;
    document.body.classList.add("dg-scroll-lock");
  }, []);
  const unlockScroll = useCallback(() => {
    if (!scrollLockedRef.current) return;
    if (rootRef.current?.getAttribute("data-enlarging") === "true") return;
    scrollLockedRef.current = false;
    document.body.classList.remove("dg-scroll-lock");
  }, []);

  const items = useMemo(() => buildItems(images, segments), [images, segments]);
  // one keyboard stop per picture: its first tile on the middle rows
  const focusable = useMemo(() => {
    const seen = new Set<string>();
    return items.map((it) => {
      if ((it.y !== 0 && it.y !== 1) || seen.has(it.src)) return false;
      seen.add(it.src);
      return true;
    });
  }, [items]);

  const applyTransform = (xDeg: number, yDeg: number) => {
    const el = sphereRef.current;
    if (el) el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
  };

  // size the dome to its box
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      const w = Math.max(1, cr.width);
      const h = Math.max(1, cr.height);
      const minDim = Math.min(w, h);
      const basis = w / h >= 1.3 ? w : minDim;
      const radius = Math.round(clamp(Math.min(basis * fit, h * 1.35), minRadius, maxRadius));
      root.style.setProperty("--radius", `${radius}px`);
      root.style.setProperty("--viewer-pad", `${Math.max(8, Math.round(minDim * padFactor))}px`);
      applyTransform(rotationRef.current.x, rotationRef.current.y);
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [fit, minRadius, maxRadius, padFactor]);

  const stopInertia = useCallback(() => {
    if (inertiaRAF.current) cancelAnimationFrame(inertiaRAF.current);
    inertiaRAF.current = null;
  }, []);

  const startInertia = useCallback(
    (vx: number, vy: number) => {
      const MAX_V = 1.4;
      let vX = clamp(vx, -MAX_V, MAX_V) * 80;
      let vY = clamp(vy, -MAX_V, MAX_V) * 80;
      let frames = 0;
      const d = clamp(dragDampening, 0, 1);
      const frictionMul = 0.94 + 0.055 * d;
      const stopThreshold = 0.015 - 0.01 * d;
      const maxFrames = Math.round(90 + 270 * d);
      const step = () => {
        vX *= frictionMul;
        vY *= frictionMul;
        if ((Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) || ++frames > maxFrames) {
          inertiaRAF.current = null;
          return;
        }
        const nextX = clamp(rotationRef.current.x - vY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg);
        const nextY = wrapAngleSigned(rotationRef.current.y + vX / 200);
        rotationRef.current = { x: nextX, y: nextY };
        applyTransform(nextX, nextY);
        inertiaRAF.current = requestAnimationFrame(step);
      };
      stopInertia();
      inertiaRAF.current = requestAnimationFrame(step);
    },
    [dragDampening, maxVerticalRotationDeg, stopInertia]
  );

  useGesture(
    {
      onDragStart: ({ event }) => {
        if (focusedElRef.current) return;
        stopInertia();
        const evt = event as PointerEvent;
        draggingRef.current = true;
        movedRef.current = false;
        startRotRef.current = { ...rotationRef.current };
        startPosRef.current = { x: evt.clientX, y: evt.clientY };
      },
      onDrag: ({ event, last, velocity = [0, 0], direction = [0, 0], movement }) => {
        if (focusedElRef.current || !draggingRef.current || !startPosRef.current) return;
        const evt = event as PointerEvent;
        const dxTotal = evt.clientX - startPosRef.current.x;
        const dyTotal = evt.clientY - startPosRef.current.y;
        if (!movedRef.current && dxTotal * dxTotal + dyTotal * dyTotal > 16) movedRef.current = true;
        const nextX = clamp(startRotRef.current.x - dyTotal / dragSensitivity, -maxVerticalRotationDeg, maxVerticalRotationDeg);
        const nextY = wrapAngleSigned(startRotRef.current.y + dxTotal / dragSensitivity);
        if (rotationRef.current.x !== nextX || rotationRef.current.y !== nextY) {
          rotationRef.current = { x: nextX, y: nextY };
          applyTransform(nextX, nextY);
        }
        if (last) {
          draggingRef.current = false;
          let vx = velocity[0] * direction[0];
          let vy = velocity[1] * direction[1];
          if (Math.abs(vx) < 0.001 && Math.abs(vy) < 0.001 && movement) {
            vx = clamp((movement[0] / dragSensitivity) * 0.02, -1.2, 1.2);
            vy = clamp((movement[1] / dragSensitivity) * 0.02, -1.2, 1.2);
          }
          if (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005) startInertia(vx, vy);
          movedRef.current = false;
        }
      },
    },
    { target: mainRef, eventOptions: { passive: true } }
  );

  // close the lifted tile: scrim click or Escape
  useEffect(() => {
    const scrim = scrimRef.current;
    if (!scrim) return;
    const close = () => {
      if (performance.now() - openStartedAtRef.current < 250) return;
      const el = focusedElRef.current;
      if (!el) return;
      const parent = el.parentElement as HTMLElement;
      const overlay = viewerRef.current?.querySelector<HTMLElement>(".enlarge");
      if (!overlay) return;
      const refDiv = parent.querySelector(".item__image--reference");
      const originalPos = originalTilePositionRef.current;
      const finish = () => {
        el.style.visibility = "";
        el.style.zIndex = "0";
        el.removeAttribute("data-focused");
        focusedElRef.current = null;
        rootRef.current?.removeAttribute("data-enlarging");
      };
      if (!originalPos) {
        overlay.remove();
        refDiv?.remove();
        parent.style.setProperty("--rot-y-delta", "0deg");
        parent.style.setProperty("--rot-x-delta", "0deg");
        finish();
        openingRef.current = false;
        unlockScroll();
        return;
      }
      const currentRect = overlay.getBoundingClientRect();
      const rootRect = rootRef.current!.getBoundingClientRect();
      const animating = document.createElement("div");
      animating.className = "enlarge-closing";
      animating.style.cssText = `position:absolute;left:${currentRect.left - rootRect.left}px;top:${currentRect.top - rootRect.top}px;width:${currentRect.width}px;height:${currentRect.height}px;z-index:9999;border-radius:var(--enlarge-radius, 32px);overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:all ${enlargeTransitionMs}ms ease-out;pointer-events:none;margin:0;transform:none;`;
      const originalImg = overlay.querySelector("img");
      if (originalImg) {
        const img = originalImg.cloneNode() as HTMLImageElement;
        img.style.cssText = "width:100%;height:100%;object-fit:cover;";
        animating.appendChild(img);
      }
      overlay.remove();
      rootRef.current!.appendChild(animating);
      void animating.getBoundingClientRect();
      requestAnimationFrame(() => {
        animating.style.left = `${originalPos.left - rootRect.left}px`;
        animating.style.top = `${originalPos.top - rootRect.top}px`;
        animating.style.width = `${originalPos.width}px`;
        animating.style.height = `${originalPos.height}px`;
        animating.style.opacity = "0";
      });
      const cleanup = () => {
        animating.remove();
        originalTilePositionRef.current = null;
        refDiv?.remove();
        parent.style.transition = "none";
        el.style.transition = "none";
        parent.style.setProperty("--rot-y-delta", "0deg");
        parent.style.setProperty("--rot-x-delta", "0deg");
        requestAnimationFrame(() => {
          el.style.opacity = "0";
          finish();
          requestAnimationFrame(() => {
            parent.style.transition = "";
            el.style.transition = "opacity 300ms ease-out";
            requestAnimationFrame(() => {
              el.style.opacity = "1";
              setTimeout(() => {
                el.style.transition = "";
                el.style.opacity = "";
                openingRef.current = false;
                scrollLockedRef.current = false;
                document.body.classList.remove("dg-scroll-lock");
                el.focus({ preventScroll: true });
              }, 300);
            });
          });
        });
      };
      animating.addEventListener("transitionend", cleanup, { once: true });
    };
    scrim.addEventListener("click", close);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      scrim.removeEventListener("click", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [enlargeTransitionMs, unlockScroll]);

  const openItemFromElement = useCallback(
    (el: HTMLElement) => {
      if (openingRef.current) return;
      openingRef.current = true;
      openStartedAtRef.current = performance.now();
      lockScroll();
      const parent = el.parentElement as HTMLElement;
      focusedElRef.current = el;
      el.setAttribute("data-focused", "true");
      const parentRot = computeItemBaseRotation(
        getDataNumber(parent, "offsetX", 0),
        getDataNumber(parent, "offsetY", 0),
        getDataNumber(parent, "sizeX", 2),
        getDataNumber(parent, "sizeY", 2),
        segments
      );
      let rotY = -(normalizeAngle(parentRot.rotateY) + normalizeAngle(rotationRef.current.y)) % 360;
      if (rotY < -180) rotY += 360;
      const rotX = -parentRot.rotateX - rotationRef.current.x;
      parent.style.setProperty("--rot-y-delta", `${rotY}deg`);
      parent.style.setProperty("--rot-x-delta", `${rotX}deg`);
      const refDiv = document.createElement("div");
      refDiv.className = "item__image item__image--reference";
      refDiv.style.opacity = "0";
      refDiv.style.transform = `rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg)`;
      parent.appendChild(refDiv);
      void refDiv.offsetHeight;

      const tileR = refDiv.getBoundingClientRect();
      const mainR = mainRef.current?.getBoundingClientRect();
      const frameR = frameRef.current?.getBoundingClientRect();
      if (!mainR || !frameR || tileR.width <= 0 || tileR.height <= 0) {
        openingRef.current = false;
        focusedElRef.current = null;
        parent.removeChild(refDiv);
        unlockScroll();
        return;
      }
      originalTilePositionRef.current = { left: tileR.left, top: tileR.top, width: tileR.width, height: tileR.height };
      el.style.visibility = "hidden";
      el.style.zIndex = "0";
      const overlay = document.createElement("div");
      overlay.className = "enlarge";
      Object.assign(overlay.style, {
        position: "absolute",
        left: `${frameR.left - mainR.left}px`,
        top: `${frameR.top - mainR.top}px`,
        width: `${frameR.width}px`,
        height: `${frameR.height}px`,
        opacity: "0",
        zIndex: "30",
        willChange: "transform, opacity",
        transformOrigin: "top left",
        transition: `transform ${enlargeTransitionMs}ms ease, opacity ${enlargeTransitionMs}ms ease`,
      });
      const img = document.createElement("img");
      img.src = parent.dataset.src || el.querySelector("img")?.src || "";
      img.alt = el.getAttribute("aria-label")?.replace(/^Open /, "") ?? "";
      overlay.appendChild(img);
      viewerRef.current!.appendChild(overlay);
      const sx0 = tileR.width / frameR.width;
      const sy0 = tileR.height / frameR.height;
      overlay.style.transform = `translate(${tileR.left - frameR.left}px, ${tileR.top - frameR.top}px) scale(${isFinite(sx0) && sx0 > 0 ? sx0 : 1}, ${isFinite(sy0) && sy0 > 0 ? sy0 : 1})`;
      setTimeout(() => {
        if (!overlay.parentElement) return;
        overlay.style.opacity = "1";
        overlay.style.transform = "translate(0px, 0px) scale(1, 1)";
        rootRef.current?.setAttribute("data-enlarging", "true");
      }, 16);

      // then settle at the opened size, centred in the frame
      const onFirstEnd = (ev: TransitionEvent) => {
        if (ev.propertyName !== "transform") return;
        overlay.removeEventListener("transitionend", onFirstEnd);
        const prevTransition = overlay.style.transition;
        overlay.style.transition = "none";
        overlay.style.width = openedImageWidth;
        overlay.style.height = openedImageHeight;
        const newRect = overlay.getBoundingClientRect();
        overlay.style.width = `${frameR.width}px`;
        overlay.style.height = `${frameR.height}px`;
        void overlay.offsetWidth;
        overlay.style.transition = `left ${enlargeTransitionMs}ms ease, top ${enlargeTransitionMs}ms ease, width ${enlargeTransitionMs}ms ease, height ${enlargeTransitionMs}ms ease`;
        requestAnimationFrame(() => {
          overlay.style.left = `${frameR.left - mainR.left + (frameR.width - newRect.width) / 2}px`;
          overlay.style.top = `${frameR.top - mainR.top + (frameR.height - newRect.height) / 2}px`;
          overlay.style.width = openedImageWidth;
          overlay.style.height = openedImageHeight;
        });
        overlay.addEventListener("transitionend", () => (overlay.style.transition = prevTransition), { once: true });
      };
      overlay.addEventListener("transitionend", onFirstEnd);
    },
    [enlargeTransitionMs, lockScroll, openedImageHeight, openedImageWidth, segments, unlockScroll]
  );

  // a click opens only when the pointer barely moved since it went down (a drag never opens)
  const downAtRef = useRef<{ x: number; y: number } | null>(null);
  const canOpen = (e: React.MouseEvent | React.PointerEvent) => {
    const d = downAtRef.current;
    const still = !d || Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6;
    return still && !openingRef.current;
  };

  useEffect(() => () => document.body.classList.remove("dg-scroll-lock"), []);

  // a press that never became a drag must not leave the dome thinking it is still being dragged
  useEffect(() => {
    const release = () => setTimeout(() => (draggingRef.current = false), 0);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, []);

  // the slow turn: only while the dome is on screen and nobody is dragging, gliding or looking at a poster
  useEffect(() => {
    if (!autoRotateSpeed || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = rootRef.current;
    if (!root) return;
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.1 });
    io.observe(root);
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      if (visible && !draggingRef.current && !inertiaRAF.current && !focusedElRef.current && !openingRef.current) {
        const y = wrapAngleSigned(rotationRef.current.y + autoRotateSpeed * dt);
        rotationRef.current = { ...rotationRef.current, y };
        applyTransform(rotationRef.current.x, y);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [autoRotateSpeed]);

  return (
    <div
      ref={rootRef}
      className="sphere-root"
      style={
        {
          "--segments-x": segments,
          "--segments-y": segments,
          "--overlay-blur-color": overlayBlurColor,
          "--tile-radius": imageBorderRadius,
          "--enlarge-radius": openedImageBorderRadius,
          "--image-filter": grayscale ? "grayscale(1)" : "none",
        } as React.CSSProperties
      }
    >
      <main
        ref={mainRef}
        className="sphere-main"
        onPointerDown={(e) => (downAtRef.current = { x: e.clientX, y: e.clientY })}
        onClick={(e) => {
          // the drag can capture the pointer, so the click lands here: find the poster under it
          if (!canOpen(e)) return;
          // after a turn the hit can land on the tile's frame (.item) rather than its picture
          const tileOf = (el: Element | null) =>
            el?.closest<HTMLElement>(".item__image") ?? el?.closest(".item")?.querySelector<HTMLElement>(".item__image") ?? null;
          const tile =
            tileOf(e.target as Element) ??
            document.elementsFromPoint(e.clientX, e.clientY).map(tileOf).find((el): el is HTMLElement => !!el);
          if (tile && !tile.classList.contains("item__image--reference")) openItemFromElement(tile);
        }}
      >
        <div className="stage">
          <div ref={sphereRef} className="sphere">
            {items.map((it, i) => (
              <div
                key={`${it.x},${it.y},${i}`}
                className="item"
                data-src={it.src}
                data-offset-x={it.x}
                data-offset-y={it.y}
                data-size-x={it.sizeX}
                data-size-y={it.sizeY}
                style={
                  {
                    "--offset-x": it.x,
                    "--offset-y": it.y,
                    "--item-size-x": it.sizeX,
                    "--item-size-y": it.sizeY,
                  } as React.CSSProperties
                }
              >
                <div
                  className="item__image"
                  role="button"
                  tabIndex={focusable[i] ? 0 : -1}
                  aria-label={`Open ${it.alt || "poster"}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (!openingRef.current) openItemFromElement(e.currentTarget);
                    }
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.src} draggable={false} alt="" loading="lazy" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overlay" />
        <div className="overlay overlay--blur" />
        <div className="edge-fade edge-fade--top" />
        <div className="edge-fade edge-fade--bottom" />

        <div className="viewer" ref={viewerRef}>
          <div ref={scrimRef} className="scrim" />
          <div ref={frameRef} className="frame" />
        </div>
      </main>
    </div>
  );
}
