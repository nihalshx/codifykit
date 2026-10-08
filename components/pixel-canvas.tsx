"use client";

import { useEffect, useRef, type HTMLAttributes } from "react";

interface PixelCanvasProps extends HTMLAttributes<HTMLDivElement> {
  /** Size of each pixel cell in px */
  gap?: number;
  /** Trail decay speed (higher = faster fade) */
  speed?: number;
  /** Colours the pixels shimmer through */
  colors?: string[];
  /** Cursor influence radius in px */
  radius?: number;
}

type Pixel = { x: number; y: number; intensity: number; target: number; phase: number };

function hexToRgb(hex: string) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [255, 255, 255];
}

/**
 * Glowing pixel grid that lights up around the cursor and leaves a fading trail.
 * Tracks the pointer on the window, so it works even when content sits on top of it.
 */
export function PixelCanvas({
  className = "",
  gap = 6,
  speed = 0.03,
  colors = ["#b8acef", "#6a5ad8", "#2b3fd6", "#7cc4ea"],
  radius = 120,
  ...props
}: PixelCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rgb = colors.map(hexToRgb);
    const size = Math.max(gap, 4);
    let cols = 0;
    let rows = 0;
    let width = 0;
    let height = 0;
    let pixels: Pixel[] = [];
    const active = new Set<number>();
    const mouse = { x: -1e4, y: -1e4 };
    let raf = 0;
    let running = false;
    let visible = true;

    const colorAt = (t: number) => {
      if (rgb.length === 1) return rgb[0];
      const f = t * (rgb.length - 1);
      const i = Math.min(Math.floor(f), rgb.length - 2);
      const k = f - i;
      const a = rgb[i];
      const b = rgb[i + 1];
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
    };

    const init = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / size);
      rows = Math.ceil(height / size);
      pixels = new Array(cols * rows);
      for (let i = 0; i < cols; i++)
        for (let j = 0; j < rows; j++)
          pixels[i * rows + j] = { x: i * size, y: j * size, intensity: 0, target: 0, phase: Math.random() };
      active.clear();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Wake the pixels under the cursor.
      if (mouse.x > -radius && mouse.y > -radius && mouse.x < width + radius && mouse.y < height + radius) {
        const i0 = Math.max(0, Math.floor((mouse.x - radius) / size));
        const i1 = Math.min(cols - 1, Math.ceil((mouse.x + radius) / size));
        const j0 = Math.max(0, Math.floor((mouse.y - radius) / size));
        const j1 = Math.min(rows - 1, Math.ceil((mouse.y + radius) / size));
        for (let i = i0; i <= i1; i++)
          for (let j = j0; j <= j1; j++) active.add(i * rows + j);
      }

      const inner = size - 1;
      for (const idx of active) {
        const p = pixels[idx];
        const dx = mouse.x - (p.x + inner / 2);
        const dy = mouse.y - (p.y + inner / 2);
        const d = Math.sqrt(dx * dx + dy * dy);
        p.target = d < radius ? Math.pow(1 - d / radius, 1.5) : 0;
        p.intensity += (p.target - p.intensity) * (p.target > p.intensity ? 0.3 : speed);
        p.phase = (p.phase + 0.002) % 1;

        if (p.intensity < 0.01 && p.target === 0) {
          p.intensity = 0;
          active.delete(idx);
          continue;
        }

        const [r, g, b] = colorAt((p.phase + p.intensity) % 1);
        ctx.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`;

        // Glow: two soft, larger passes behind the pixel.
        if (p.intensity > 0.2) {
          for (let k = 2; k > 0; k--) {
            const gs = inner + k * 4;
            const off = (gs - inner) / 2;
            ctx.globalAlpha = (p.intensity * 0.15) / k;
            ctx.fillRect(p.x - off, p.y - off, gs, gs);
          }
        }
        ctx.globalAlpha = p.intensity * 0.9;
        ctx.fillRect(p.x, p.y, inner, inner);
      }
      ctx.globalAlpha = 1;

      if (active.size > 0 && visible) raf = requestAnimationFrame(draw);
      else running = false;
    };

    const kick = () => {
      if (!running && visible) {
        running = true;
        raf = requestAnimationFrame(draw);
      }
    };

    const setPointer = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = clientX - rect.left;
      mouse.y = clientY - rect.top;
      kick();
    };
    const onMove = (e: PointerEvent) => setPointer(e.clientX, e.clientY);
    const onLeave = () => {
      mouse.x = mouse.y = -1e4;
      kick();
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
    });
    const ro = new ResizeObserver(init);

    init();
    io.observe(container);
    ro.observe(container);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [gap, speed, radius, colors]);

  return (
    <div ref={containerRef} className={`relative h-full w-full overflow-hidden ${className}`} {...props}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
