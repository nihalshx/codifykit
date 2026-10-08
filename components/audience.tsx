"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Rocket, Store, Camera, GraduationCap, Check } from "lucide-react";
import { Reveal, SectionLabel } from "./reveal";

const groups = [
  {
    id: "startups",
    icon: Rocket,
    label: "Startups",
    headline: "Trying to get your first 1,000 followers?",
    body: "We help new brands look established from day one — a sharp identity, a launch-ready site and a content engine that builds momentum.",
    points: ["Brand identity & launch kit", "Landing page that converts", "Social growth from zero"],
  },
  {
    id: "business",
    icon: Store,
    label: "Business owners",
    headline: "Need a website that actually converts?",
    body: "Your site should be your best salesperson. We build it, then bring people to it with marketing that turns visits into enquiries.",
    points: ["Conversion-focused website", "Local & paid visibility", "Lead generation that's tracked"],
  },
  {
    id: "creators",
    icon: Camera,
    label: "Creators",
    headline: "Want content that doesn't feel like a chore?",
    body: "We plan, write and design with you, so you can spend your energy creating — not staring at an empty calendar.",
    points: ["Monthly content calendars", "Captions, hooks & creatives", "Personal brand that feels like you"],
  },
  {
    id: "students",
    icon: GraduationCap,
    label: "Students",
    headline: "Need a solid portfolio project?",
    body: "We started by teaching people to code — we still love helping you build something real that shows what you can do.",
    points: ["Portfolio websites", "Guided project builds", "Code that's clean & explainable"],
  },
];

export function Audience() {
  const [active, setActive] = useState(groups[0].id);
  const g = groups.find((x) => x.id === active)!;

  return (
    <section id="who" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="max-w-2xl">
          <SectionLabel>Who we help</SectionLabel>
          <h2 className="mt-5 font-display text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.02] tracking-tight text-white">
            We&apos;ve probably got <span className="text-gradient">a way to help.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div role="tablist" aria-label="Who we help" className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            {groups.map((x) => {
              const on = x.id === active;
              return (
                <button
                  key={x.id}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActive(x.id)}
                  onMouseEnter={() => setActive(x.id)}
                  className={`relative flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition sm:px-5 ${
                    on ? "border-white/20 text-white" : "border-white/5 text-mist/60 hover:text-white"
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="audience-pill"
                      className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-indigo/50 to-violet/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <x.icon className={`size-5 shrink-0 ${on ? "text-lavender" : ""}`} />
                  <span className="font-display text-lg font-medium sm:text-xl">{x.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative min-h-[22rem] overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(140deg,#070824_0%,#0b0b5c_55%,#2a2a9e_85%,#7cc4ea_130%)] p-8 sm:p-10">
            <div aria-hidden className="absolute inset-0 bg-noise opacity-[0.08] mix-blend-overlay" />
            <div aria-hidden className="absolute -right-20 -top-20 size-72 rounded-full bg-lavender/20 blur-3xl" />
            <AnimatePresence mode="wait">
              <motion.div
                key={g.id}
                role="tabpanel"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="relative"
              >
                <g.icon className="size-10 text-white/90" strokeWidth={1.4} />
                <h3 className="mt-6 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">{g.headline}</h3>
                <p className="mt-4 max-w-lg leading-relaxed text-mist/80">{g.body}</p>
                <ul className="mt-7 space-y-3">
                  {g.points.map((p) => (
                    <li key={p} className="flex items-center gap-3 text-white">
                      <span className="grid size-6 place-items-center rounded-full bg-white/10">
                        <Check className="size-3.5 text-sky" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
