import { Logo } from "./logo";
import { nav, site } from "@/lib/site";
import { socialLinks } from "./socials";

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-ink">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-mist/60">
              A digital growth and creative studio. Websites, social, marketing, branding and strategy — working together.
            </p>
          </div>
          <div className="flex gap-16">
            <ul className="space-y-2.5 text-sm">
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="text-mist/70 transition hover:text-white">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
            <ul className="space-y-2.5 text-sm">
              {socialLinks.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-mist/70 transition hover:text-white">
                    {s.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={`mailto:${site.email}`} className="text-mist/70 transition hover:text-white">
                  Email
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div aria-hidden className="select-none overflow-hidden">
        <p className="text-shine -mb-[0.08em] pb-[0.12em] text-center font-display text-[22vw] font-semibold leading-[1.05] tracking-[-0.06em] opacity-20">
          Codifykit
        </p>
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-mist/50 sm:flex-row sm:justify-between">
          <span>© {site.name}. All rights reserved.</span>
          <span>Let&apos;s build something worth growing.</span>
        </div>
      </div>
    </footer>
  );
}
