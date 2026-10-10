"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Macropad } from "./macropad";

const MicroSlats = dynamic(() => import("./micro-slats"), { ssr: false });

const audiences = ["startups", "business owners", "creators", "students"];

export function Hero() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % audiences.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      id="top"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden pb-20 pt-32"
    >
      {/* Animated slat field in brand colours (dark base shows if WebGL2 is unavailable) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-ink">
        <MicroSlats
          className="absolute! inset-0"
          preset="swell"
          color="#3b3fd8"
          glintColor="#b8acef"
          backgroundColor="#04040f"
          slatWidth={8}
          slatHeight={22}
          gap={3}
          cursorSize={60}
          cursorStrength={1.2}
          trail={1.6}
        />
        {/* keep the headline side calm and blend into the page below */}
        <div className="absolute inset-0 bg-ink/40 lg:bg-transparent lg:bg-[linear-gradient(90deg,rgb(4_4_15/0.85)_0%,rgb(4_4_15/0.55)_40%,transparent_75%)]" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink" />
      </div>

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
          initial={{ opacity: 0, y: 30, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        >
          <Macropad />
        </motion.div>
      </div>
    </section>
  );
}
