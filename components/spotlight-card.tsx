"use client";

import { useRef, type ReactNode } from "react";
import { PixelCanvas } from "./pixel-canvas";

export function SpotlightCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--x", `${e.clientX - r.left}px`);
        el.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-px ${className}`}
    >
      {/* glowing border that follows the cursor */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(400px circle at var(--x) var(--y), rgb(184 172 239 / 0.45), transparent 45%)",
        }}
      />
      <div className="relative h-full rounded-[calc(1.5rem-1px)] bg-night/95">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(500px circle at var(--x) var(--y), rgb(43 63 214 / 0.14), transparent 45%)",
          }}
        />
        <PixelCanvas
          aria-hidden
          gap={6}
          radius={110}
          className="pointer-events-none absolute! inset-0 rounded-[inherit] opacity-70"
        />
        <div className="relative h-full">{children}</div>
      </div>
    </div>
  );
}
