import { Code2, Share2, Megaphone, Palette, Compass, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { SpotlightCard } from "./spotlight-card";
import { Reveal, SectionLabel } from "./reveal";

type Service = {
  icon: LucideIcon;
  title: string;
  short: string;
  body: string;
  tags: string[];
  visual: ReactNode;
  span: string;
};

function BrowserVisual() {
  return (
    <div className="relative mt-8 overflow-hidden rounded-xl border border-white/10 bg-ink/80 shadow-2xl shadow-indigo/20">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2.5">
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="ml-3 h-5 flex-1 rounded-md bg-white/5 px-2 text-[10px] leading-5 text-mist/60">yourbrand.com</span>
      </div>
      <div className="grid grid-cols-5 gap-3 p-4">
        <div className="col-span-3 space-y-2.5">
          <div className="h-3 w-3/4 rounded-full bg-gradient-to-r from-lavender/70 to-sky/50 transition-all duration-700 group-hover:w-full" />
          <div className="h-2 w-full rounded-full bg-white/10" />
          <div className="h-2 w-5/6 rounded-full bg-white/10" />
          <div className="flex gap-2 pt-2">
            <div className="h-6 w-20 rounded-full bg-white/90" />
            <div className="h-6 w-16 rounded-full border border-white/20" />
          </div>
        </div>
        <div className="col-span-2 rounded-lg bg-[linear-gradient(135deg,#0a0a5a,#6a5ad8_70%,#7cc4ea)] transition-transform duration-700 group-hover:scale-[1.04]" />
        <div className="col-span-5 grid grid-cols-3 gap-3 pt-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 rounded-lg border border-white/5 bg-white/[0.04]" />
          ))}
        </div>
      </div>
    </div>
  );
}

function GrowthVisual() {
  const bars = [28, 36, 32, 48, 44, 62, 70, 88];
  return (
    <div className="mt-8">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-3xl font-semibold text-white">1,000+</span>
        <span className="text-xs text-sky">followers goal ↗</span>
      </div>
      <div className="mt-4 flex h-24 items-end gap-1.5">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 origin-bottom rounded-t-md bg-gradient-to-t from-indigo to-lavender transition-transform duration-500 group-hover:scale-y-110"
            style={{ height: `${h}%`, transitionDelay: `${i * 40}ms`, opacity: 0.45 + i * 0.07 }}
          />
        ))}
      </div>
    </div>
  );
}

function FunnelVisual() {
  const rows = [
    { label: "Reach", w: "100%" },
    { label: "Visits", w: "72%" },
    { label: "Leads", w: "44%" },
    { label: "Customers", w: "24%" },
  ];
  return (
    <div className="mt-8 space-y-2">
      {rows.map((r, i) => (
        <div key={r.label} className="flex items-center gap-3">
          <span className="w-20 text-xs text-mist/60">{r.label}</span>
          <div className="h-2.5 flex-1 rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-royal to-sky transition-all duration-700 group-hover:brightness-125"
              style={{ width: r.w, transitionDelay: `${i * 60}ms` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function BrandVisual() {
  return (
    <div className="mt-8 flex items-end gap-4">
      <span className="font-display text-6xl font-semibold leading-none text-gradient">Aa</span>
      <div className="flex -space-x-2">
        {["#04040f", "#1a17a8", "#6a5ad8", "#b8acef", "#7cc4ea"].map((c, i) => (
          <span
            key={c}
            className="size-9 rounded-full border-2 border-night transition-transform duration-500 group-hover:-translate-y-1"
            style={{ background: c, transitionDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function StrategyVisual() {
  return (
    <svg viewBox="0 0 240 90" className="mt-8 w-full" aria-hidden>
      <defs>
        <linearGradient id="sg" x1="0" x2="1">
          <stop offset="0" stopColor="#6a5ad8" />
          <stop offset="1" stopColor="#7cc4ea" />
        </linearGradient>
      </defs>
      <path d="M20 45 C 70 45, 70 15, 120 15 S 170 45, 220 45 M20 45 C 70 45, 70 75, 120 75 S 170 45, 220 45" stroke="url(#sg)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" className="transition-all duration-700 group-hover:[stroke-dasharray:200_0]" />
      {[
        [20, 45],
        [120, 15],
        [120, 75],
        [220, 45],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 0 || i === 3 ? 7 : 5} fill={i === 3 ? "#fff" : "#0b0b5c"} stroke="#b8acef" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

const services: Service[] = [
  {
    icon: Code2,
    title: "Web & Digital Development",
    short: "Websites, portfolios, landing pages.",
    body: "Fast, beautiful sites built to convert — from a single landing page to a full business website or a portfolio that gets you noticed.",
    tags: ["Business sites", "Landing pages", "Portfolios", "Student projects"],
    visual: <BrowserVisual />,
    span: "md:col-span-2 lg:col-span-4",
  },
  {
    icon: Share2,
    title: "Social Media & Content",
    short: "Planning, writing, managing, growing.",
    body: "Content that doesn't feel like a chore to plan — calendars, captions, creatives and community, handled.",
    tags: ["Content calendars", "Management", "Growth"],
    visual: <GrowthVisual />,
    span: "lg:col-span-2",
  },
  {
    icon: Megaphone,
    title: "Digital Marketing",
    short: "Strategy, ads, leads, visibility.",
    body: "Campaigns that put you in front of the right people — and turn attention into enquiries.",
    tags: ["Paid ads", "Lead gen", "Visibility"],
    visual: <FunnelVisual />,
    span: "lg:col-span-2",
  },
  {
    icon: Palette,
    title: "Branding & Creative",
    short: "Logos, creatives, guidelines, campaigns.",
    body: "An identity that looks like you on every screen — consistent, memorable and ready to scale.",
    tags: ["Logos", "Guidelines", "Campaigns"],
    visual: <BrandVisual />,
    span: "lg:col-span-2",
  },
  {
    icon: Compass,
    title: "Strategy & Projects",
    short: "The thinking behind it all.",
    body: "We connect the dots so your website, socials and marketing pull in the same direction.",
    tags: ["Roadmaps", "Audits", "Planning"],
    visual: <StrategyVisual />,
    span: "lg:col-span-2",
  },
];

export function Services() {
  return (
    <section id="services" className="relative overflow-hidden py-28 sm:py-36">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-40 -z-10 h-[40rem] w-[60rem] -translate-x-1/2 rounded-full bg-indigo/20 blur-[140px]" />
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <SectionLabel>What we do</SectionLabel>
            <h2 className="mt-5 font-display text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.02] tracking-tight text-white">
              Five crafts. <span className="text-gradient">One connected presence.</span>
            </h2>
          </div>
          <p className="max-w-sm text-mist/75">
            Everything works together instead of feeling scattered — pick one service or let us run the whole thing.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06} className={s.span}>
              <SpotlightCard className="h-full">
                <div className="flex h-full flex-col p-7">
                  <div className="flex items-start justify-between">
                    <span className="grid size-11 place-items-center rounded-xl border border-white/10 bg-gradient-to-br from-indigo/60 to-violet/30 text-white">
                      <s.icon className="size-5" />
                    </span>
                    <ArrowUpRight className="size-5 text-mist/40 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight text-white">{s.title}</h3>
                  <p className="mt-1 text-sm font-medium text-lavender">{s.short}</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-mist/70">{s.body}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {s.tags.map((t) => (
                      <li key={t} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-mist/80">
                        {t}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">{s.visual}</div>
                </div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
