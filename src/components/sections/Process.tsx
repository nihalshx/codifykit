"use client";
import { useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { T } from "@/components/ui/T";
import { PROCESS } from "@/lib/content";
import { useMediaQuery, useReducedMotion } from "@/lib/useReducedMotion";
import styles from "./Process.module.css";

const RING_LABELS = ["Your idea", "Research", "Design", "Build", "Growth"];

function Circles({ active }: { active: number }) {
  return (
    <div className={styles.circles} aria-hidden="true">
      {RING_LABELS.map((l, i) => {
        const size = 30 + i * 17.5; // "Your idea" in the middle, growing outwards
        return (
          <span
            key={l}
            className={styles.ring}
            data-on={i <= active}
            data-inner={i === 0}
            style={{ width: `${size}%`, height: `${size}%`, zIndex: 10 - i, background: i ? `color-mix(in srgb, var(--ck-line) ${10 + i * 7}%, var(--ck-paper))` : undefined }}
          >
            <em className={styles.ringLabel} data-on={i === active}>{l}</em>
          </span>
        );
      })}
    </div>
  );
}

export function Process({ ctaHref = "#ask" }: { ctaHref?: string }) {
  const reduced = useReducedMotion();
  const mobile = useMediaQuery("(max-width: 899px)");
  const sticky = !reduced && !mobile;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(PROCESS.length - 1, Math.floor(v * PROCESS.length * 0.999))));
  const shownActive = sticky ? active : PROCESS.length - 1;

  return (
    <section ref={ref} className={styles.wrap} style={sticky ? { height: "250vh" } : undefined} aria-labelledby="process-title">
      <div className={sticky ? styles.sticky : "section"}>
        <div className={`container ${styles.grid}`}>
          <div>
            <p className="label">Process</p>
            <h2 id="process-title" className="h2">From idea to growth, one team.</h2>
            <ol className={styles.steps}>
              {PROCESS.map((s, i) => (
                <li key={s.n} data-on={!sticky || i === active}>
                  <span className={styles.num}>{s.n}</span>
                  <div>
                    <h3 className={styles.name}>{s.name}</h3>
                    <p className={styles.desc}><T>{s.desc}</T></p>
                  </div>
                </li>
              ))}
            </ol>
            <a href={ctaHref} className={`gradient-card ${styles.cta}`}>
              <span className={styles.ctaLabel}>Let&apos;s build</span>
              <span className={styles.ctaText}>Start a project →</span>
            </a>
          </div>
          <Circles active={shownActive} />
        </div>
      </div>
    </section>
  );
}
