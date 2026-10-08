"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { site } from "@/lib/site";
import { Reveal, SectionLabel } from "./reveal";
import { LogoMark } from "./logo";
import { socialLinks } from "./socials";

const needs = ["Website", "Social media", "Digital marketing", "Branding", "Strategy", "Not sure yet"];

export function Contact() {
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (n: string) =>
    setPicked((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const message = String(data.get("message") ?? "");
    const subject = `New project enquiry from ${name || "the website"}`;
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Interested in: ${picked.join(", ") || "—"}`,
      "",
      message,
    ].join("\n");
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section id="contact" className="relative overflow-hidden py-28 sm:py-36">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -bottom-1/2 left-1/2 h-[60rem] w-[90rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(106_90_216/0.45),rgb(29_78_216/0.25)_50%,transparent_75%)] blur-2xl" />
        <div className="absolute inset-0 bg-grid [mask-image:linear-gradient(to_bottom,transparent,black_40%,transparent)]" />
      </div>

      <div className="mx-auto grid max-w-6xl gap-14 px-5 lg:grid-cols-2">
        <Reveal>
          <SectionLabel>Let&apos;s talk</SectionLabel>
          <h2 className="mt-5 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[0.98] tracking-tight text-white">
            Let&apos;s build something <span className="text-gradient">worth growing.</span>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-mist/80">
            Tell us where you are and where you want to be. We&apos;ll come back with honest ideas on how to get there.
          </p>

          <a
            href={`mailto:${site.email}`}
            className="mt-10 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white backdrop-blur transition hover:border-white/25"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-indigo to-violet">
              <Mail className="size-5" />
            </span>
            <span>
              <span className="block text-xs text-mist/60">Email us</span>
              <span className="font-medium">{site.email}</span>
            </span>
          </a>

          <div className="mt-6 flex gap-3">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Codifykit on ${label}`}
                className="grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-mist transition hover:-translate-y-0.5 hover:border-lavender/50 hover:text-white"
              >
                <Icon className="size-5" />
              </a>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <form
            onSubmit={onSubmit}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-night/80 p-6 shadow-[0_40px_120px_-40px_rgb(43_63_214/0.6)] backdrop-blur-xl sm:p-8"
          >
            <LogoMark className="pointer-events-none absolute -bottom-10 -right-6 h-56 w-auto text-white/[0.03]" />
            <div className="relative grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm text-mist/80">
                Your name
                <input
                  name="name"
                  required
                  autoComplete="name"
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-mist/30 focus:border-lavender/60 focus:bg-white/[0.06]"
                  placeholder="Alex Doe"
                />
              </label>
              <label className="grid gap-2 text-sm text-mist/80">
                Email
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-mist/30 focus:border-lavender/60 focus:bg-white/[0.06]"
                  placeholder="you@company.com"
                />
              </label>
            </div>

            <fieldset className="relative mt-6">
              <legend className="text-sm text-mist/80">What do you need?</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {needs.map((n) => {
                  const on = picked.includes(n);
                  return (
                    <button
                      key={n}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(n)}
                      className={`rounded-full border px-3.5 py-2 text-sm transition ${
                        on
                          ? "border-lavender/70 bg-lavender/15 text-white"
                          : "border-white/10 text-mist/70 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <label className="relative mt-6 grid gap-2 text-sm text-mist/80">
              Tell us a little more
              <textarea
                name="message"
                rows={4}
                className="resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-mist/30 focus:border-lavender/60 focus:bg-white/[0.06]"
                placeholder="Goals, timeline, links — anything that helps."
              />
            </label>

            <button
              type="submit"
              className="group relative mt-7 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-white px-6 py-4 font-medium text-ink transition hover:bg-lavender"
            >
              Send enquiry
              <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
