import { LogoMark } from "./logo";
import { Reveal } from "./reveal";

const principles = [
  { title: "Connected, not scattered", body: "Your website, socials, ads and brand should tell one story." },
  { title: "Feels like you", body: "We build presence with personality — never a generic template." },
  { title: "Small team, real attention", body: "Not the biggest agency. The one you actually want to call." },
];

export function Manifesto() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-night p-8 sm:p-14">
            <div aria-hidden className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
            <LogoMark className="pointer-events-none absolute -right-16 -top-10 h-[130%] w-auto text-white/[0.035]" />
            <p className="relative max-w-3xl font-display text-[clamp(1.75rem,3.6vw,2.75rem)] font-medium leading-[1.15] tracking-tight text-white">
              &ldquo;We&apos;re not trying to be the biggest agency out there. We&apos;re trying to be{" "}
              <span className="text-gradient">the team you call</span> when you want your digital presence to actually feel like you.&rdquo;
            </p>
            <div className="relative mt-12 grid gap-8 border-t border-white/10 pt-10 sm:grid-cols-3">
              {principles.map((p) => (
                <div key={p.title}>
                  <h3 className="font-display text-lg font-semibold text-white">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist/70">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
