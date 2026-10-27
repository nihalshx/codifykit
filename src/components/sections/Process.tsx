"use client";
/**
 * Process, rebuilt from the reference: a pinned list of steps on the left (the active one opens),
 * and on the right a soft sphere with an orbit of labelled dots that turns with the scroll.
 * Each step brings its own set of labels onto the orbit.
 */
import { useEffect, useRef, useState } from "react";
import { T } from "@/components/ui/T";
import { Brace } from "@/components/ui/Brace";
import { PROCESS } from "@/lib/content";
import { IconCode, IconGrow, IconIdea, IconLaunch, IconPen } from "@/components/ui/Icons";
import styles from "./Process.module.css";

// what each step is about, shown as labels orbiting the sphere
const ORBIT: string[][] = [
  ["Your idea", "Insights", "Goals"],
  ["UX strategy", "Brand look", "Prototype"],
  ["Development", "Testing", "Integrations", "Content"],
  ["Go live", "Tracking", "Speed"],
  ["Ads", "Content", "Leads", "Optimising"],
];
const ICONS = [IconIdea, IconPen, IconCode, IconLaunch, IconGrow];

export function Process({ ctaHref = "/contact/" }: { ctaHref?: string }) {
  const wrapRef = useRef<HTMLElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 899px)").matches;
    if (reduced || mobile) return;
    let ctx: gsap.Context | undefined;
    let cancelled = false;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      setPinned(true);
      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: wrapRef.current,
          start: "top top",
          end: `+=${PROCESS.length * 40}%`,
          pin: true,
          scrub: true,
          onUpdate: (self) => {
            setActive(Math.min(PROCESS.length - 1, Math.floor(self.progress * PROCESS.length * 0.9999)));
            if (orbitRef.current) orbitRef.current.style.setProperty("--turn", `${self.progress * 220}deg`);
          },
        });
      });
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  const labels = ORBIT[active] ?? ORBIT[0];

  return (
    <section ref={wrapRef} className={styles.wrap} aria-labelledby="process-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.left}>
          <p className="label">Process</p>
          <h2 id="process-title" className="h2">
            From idea to growth, <Brace>one</Brace> team.
          </h2>
          <ol className={styles.steps}>
            {PROCESS.map((s, i) => {
              const on = !pinned || i === active;
              const Icon = ICONS[i] ?? IconIdea;
              return (
                <li key={s.n} data-on={on} data-past={pinned && i < active}>
                  <span className={styles.icon} aria-hidden="true"><Icon /></span>
                  <span className={styles.num}>{s.n}</span>
                  <div>
                    <h3 className={styles.name}>{s.name}</h3>
                    <p className={styles.desc}><T>{s.desc}</T></p>
                  </div>
                </li>
              );
            })}
          </ol>
          <a href={ctaHref} className={`gradient-card ${styles.cta}`}>
            <span className={styles.ctaLabel}>Let&apos;s build</span>
            <span className={styles.ctaText}>Start a project →</span>
          </a>
        </div>

        <div className={styles.visual} aria-hidden="true">
          <div className={styles.sphereBack} />
          <div className={styles.sphere} />
          <div className={styles.sphereFront} />
          <div ref={orbitRef} className={styles.orbit}>
            {labels.map((l, i) => (
              <span key={`${active}-${l}`} className={styles.dot} style={{ "--a": `${(i / labels.length) * 360 + active * 37}deg`, "--i": i } as React.CSSProperties}>
                <i />
                <em>{l}</em>
              </span>
            ))}
          </div>
          <span className={styles.step}>{PROCESS[active]?.n} / {String(PROCESS.length).padStart(2, "0")}</span>
        </div>
      </div>
    </section>
  );
}
