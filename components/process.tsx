"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Reveal, SectionLabel } from "./reveal";

const steps = [
  { n: "01", title: "Listen", body: "We get to know you, your audience and what “working” actually means for you." },
  { n: "02", title: "Strategise", body: "We map how your site, socials, marketing and brand fit together — one plan, not five." },
  { n: "03", title: "Build", body: "We design and ship with intention: every page, post and campaign has a job to do." },
  { n: "04", title: "Grow", body: "We measure, learn and refine, so your presence keeps getting stronger over time." },
];

export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.6"] });
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="process" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="max-w-2xl">
          <SectionLabel>How we work</SectionLabel>
          <h2 className="mt-5 font-display text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.02] tracking-tight text-white">
            Built with intention, <span className="text-gradient">not checked off a list.</span>
          </h2>
        </Reveal>

        <div ref={ref} className="relative mt-16">
          <div className="absolute left-0 right-0 top-[1.4rem] hidden h-px bg-white/10 lg:block" />
          <motion.div
            style={{ scaleX }}
            className="absolute left-0 right-0 top-[1.4rem] hidden h-px origin-left bg-gradient-to-r from-violet via-lavender to-sky lg:block"
          />
          <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {steps.map((s, i) => (
              <motion.li
                key={s.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                  <span className="relative z-10 grid size-11 place-items-center rounded-full border border-white/15 bg-night font-display text-sm font-semibold text-lavender shadow-[0_0_30px_-6px_rgb(106_90_216/0.8)]">
                    {s.n}
                  </span>
                  <h3 className="mt-6 font-display text-2xl font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-mist/70">{s.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
