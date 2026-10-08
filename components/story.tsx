"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { SectionLabel } from "./reveal";

const text =
  "We started out helping people learn to code. Along the way, we realized what most businesses, creators and startups actually need isn't just a website or a logo — it's someone who can help them show up online in a way that actually works.";

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.25em] inline-block">
      {children}
    </motion.span>
  );
}

export function Story() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");

  return (
    <section id="story" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-5xl px-5">
        <SectionLabel>Our story</SectionLabel>
        <p
          ref={ref}
          className="mt-8 font-display text-[clamp(1.75rem,4vw,3.25rem)] font-medium leading-[1.15] tracking-tight text-white"
        >
          {words.map((w, i) => (
            <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
              {w}
            </Word>
          ))}
        </p>
        <div className="mt-14 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
          <span className="font-display text-xl font-medium text-gradient">So that&apos;s what we do now.</span>
          <span className="hidden h-px bg-gradient-to-r from-white/20 to-transparent sm:block" />
        </div>
      </div>
    </section>
  );
}
