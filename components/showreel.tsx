"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Pause, Play, Volume2, VolumeX } from "lucide-react";

/** Brand promo in a full-bleed rounded frame, followed by a giant tagline marquee. */
export function Showreel() {
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const reduce = useReducedMotion();

  // Frame eases up to full size as it scrolls into view.
  const { scrollYProgress } = useScroll({ target: frame, offset: ["start end", "start 0.15"] });
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [0.9, 1]);

  // Only play while on screen.
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const toggleSound = () => {
    const el = video.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
    if (el.paused) el.play().catch(() => {});
  };

  const togglePlay = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  const line = ["Let's build something worth growing.", "Think Codifykit."];

  return (
    <section aria-label="Codifykit showreel" className="relative bg-ink pt-3">
      <div className="px-2 sm:px-3">
        <motion.div
          ref={frame}
          style={{ scale }}
          className="relative mx-auto aspect-video w-full overflow-hidden rounded-[22px] border border-white/10 bg-black shadow-[0_40px_120px_-40px_rgb(43_63_214/0.55)] will-change-transform sm:aspect-auto sm:h-[calc(100svh-1.5rem)] sm:rounded-[40px]"
        >
          <video
            ref={video}
            className="absolute inset-0 h-full w-full object-cover"
            poster="/video/codifykit-promo-poster.jpg"
            muted
            loop
            playsInline
            preload="metadata"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            aria-label="Codifykit brand promo video"
          >
            <source src="/video/codifykit-promo.webm" type="video/webm" />
            <source src="/video/codifykit-promo.mp4" type="video/mp4" />
          </video>

          <a
            href="#contact"
            className="group absolute bottom-8 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-gradient-to-r from-white to-lavender px-9 py-4 font-semibold text-ink shadow-[0_0_40px_-6px_rgb(184_172_239/0.9)] transition hover:shadow-[0_0_60px_-4px_rgb(184_172_239/1)] sm:inline-flex"
          >
            Start a project
            <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </a>

          <div className="absolute bottom-3 right-3 flex gap-2 sm:bottom-8 sm:right-8">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause video" : "Play video"}
              className="grid size-9 place-items-center rounded-full border border-white/15 bg-ink/60 text-white backdrop-blur-md transition hover:bg-ink/80 sm:size-11"
            >
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
            <button
              type="button"
              onClick={toggleSound}
              aria-label={muted ? "Turn sound on" : "Turn sound off"}
              className="grid size-9 place-items-center rounded-full border border-white/15 bg-ink/60 text-white backdrop-blur-md transition hover:bg-ink/80 sm:size-11"
            >
              {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
          </div>
        </motion.div>
        <a
          href="#contact"
          className="group mt-4 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-white to-lavender px-6 py-3.5 font-semibold text-ink shadow-[0_0_40px_-8px_rgb(184_172_239/0.9)] sm:hidden"
        >
          Start a project
          <ArrowRight className="size-4 transition group-hover:translate-x-1" />
        </a>
      </div>

      {/* Giant tagline marquee */}
      <div className="overflow-hidden py-10 sm:py-14 [--gap:4rem]" aria-hidden>
        <div className="flex w-max animate-marquee gap-[var(--gap)] [--duration:38s]">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center gap-[var(--gap)]">
              {line.map((t, i) => (
                <span key={i} className="flex items-center gap-[var(--gap)] whitespace-nowrap font-display text-[clamp(3.5rem,11vw,10rem)] font-medium leading-none tracking-[-0.04em] text-white">
                  <span className={i === 1 ? "text-gradient" : undefined}>{t}</span>
                  <span className="text-[0.4em] text-lavender/60">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="mx-auto max-w-6xl px-5 pb-6 text-lg text-mist sm:text-xl">
        Digital growth &amp; creative studio — websites, social, marketing, branding and strategy.
      </p>
    </section>
  );
}
