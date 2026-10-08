"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue } from "motion/react";
import { ArrowRight, Code2, Megaphone, Palette, Sparkles, Compass, Share2 } from "lucide-react";
import { LogoMark } from "./logo";

const audiences = ["startups", "business owners", "creators", "students"];

const orbit = [
  { label: "Web", icon: Code2, angle: 0 },
  { label: "Social", icon: Share2, angle: 72 },
  { label: "Marketing", icon: Megaphone, angle: 144 },
  { label: "Branding", icon: Palette, angle: 216 },
  { label: "Strategy", icon: Compass, angle: 288 },
];

export function Hero() {
  const [i, setI] = useState(0);
  const mx = useMotionValue(-1000);
  const my = useMotionValue(-1000);
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${mx}px ${my}px, rgb(124 196 234 / 0.10), transparent 70%)`;

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % audiences.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      id="top"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden pb-20 pt-32"
    >
      {/* Brand aurora: deep navy → indigo → lavender/sky glow, echoing the logo artwork */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#020208_0%,#06073a_45%,#12127a_75%,#2a2a9e_100%)]" />
        <div className="absolute -bottom-1/3 -right-1/4 h-[80vmax] w-[80vmax] animate-aurora rounded-full bg-[radial-gradient(closest-side,rgb(184_172_239/0.55),rgb(106_90_216/0.25)_45%,transparent_70%)] blur-2xl" />
        <div className="absolute -bottom-1/2 left-[-10%] h-[70vmax] w-[70vmax] animate-aurora rounded-full bg-[radial-gradient(closest-side,rgb(29_78_216/0.5),rgb(124_196_234/0.12)_50%,transparent_70%)] blur-2xl [animation-delay:-9s]" />
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]" />
        <div className="absolute inset-0 bg-noise opacity-[0.07] mix-blend-overlay" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink" />
      </div>
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: spotlight }} />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-16 px-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-mist backdrop-blur"
          >
            <Sparkles className="size-3.5 text-lavender" />
            Digital growth &amp; creative studio
          </motion.div>

          <h1 className="mt-6 font-display text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-white">
            {["Let's", "build", "something"].map((w, idx) => (
              <motion.span
                key={w}
                initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.7, delay: 0.1 + idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="mr-[0.22em] inline-block"
              >
                {w}
              </motion.span>
            ))}
            <br />
            <motion.span
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="text-gradient inline-block pb-2"
            >
              worth growing.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-mist/85"
          >
            Websites, social media, digital marketing, branding and the strategy behind it all —
            designed to work together, so your presence online feels like <em className="not-italic text-white">you</em>,
            not a checklist.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <a
              href="#contact"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-6 py-3.5 font-medium text-ink shadow-[0_0_40px_-8px_rgb(184_172_239/0.8)] transition hover:shadow-[0_0_60px_-6px_rgb(184_172_239/0.95)]"
            >
              Start a project
              <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </a>
            <a
              href="#services"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 font-medium text-white backdrop-blur transition hover:border-white/30 hover:bg-white/10"
            >
              Explore services
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.85 }}
            className="mt-10 flex items-center gap-2 text-sm text-mist/70"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-sky opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-sky" />
            </span>
            Built for
            <span className="relative inline-flex h-6 min-w-[9.5rem] overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={audiences[i]}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-0 font-medium text-white"
                >
                  {audiences[i]}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto hidden aspect-square w-full max-w-[460px] sm:block"
          aria-hidden
        >
          {/* rings */}
          <div className="absolute inset-0 rounded-full border border-white/10" />
          <div className="absolute inset-[16%] rounded-full border border-dashed border-white/10" />
          <div className="absolute inset-[32%] rounded-full bg-[radial-gradient(circle,rgb(106_90_216/0.35),transparent_70%)] blur-xl" />

          {/* orbiting services */}
          <div className="absolute inset-0 animate-spin-slow">
            {orbit.map(({ label, icon: Icon, angle }) => {
              const rad = (angle * Math.PI) / 180;
              return (
                <div
                  key={label}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${50 + 50 * Math.sin(rad)}%`, top: `${50 - 50 * Math.cos(rad)}%` }}
                >
                  <div className="flex animate-spin-slow items-center gap-2 rounded-full border border-white/15 bg-night/80 px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-indigo/30 backdrop-blur [animation-direction:reverse]">
                    <Icon className="size-3.5 text-lavender" />
                    {label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* center tile — mirrors the brand square */}
          <div className="absolute left-1/2 top-1/2 grid size-[42%] -translate-x-1/2 -translate-y-1/2 place-items-center overflow-hidden rounded-[2rem] border border-white/15 bg-[linear-gradient(135deg,#02020a_0%,#0a0a5a_50%,#3a3aa8_80%,#9ec9ec_115%)] shadow-[0_30px_80px_-20px_rgb(43_63_214/0.7)]">
            <div className="absolute inset-0 bg-noise opacity-10 mix-blend-overlay" />
            <LogoMark className="relative h-[52%] w-auto text-white drop-shadow-[0_0_24px_rgb(184_172_239/0.6)]" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
