"use client";
/**
 * Process, built from the reference: a plain list of the five steps on the left and three nested
 * circles on the right. The step under the pointer (or tapped, or focused) opens: a small picture
 * replaces its number, the name grows and a one-line description appears beside it, and the step's
 * own labels appear inside the circles. Three labelled dots stay put whatever the step.
 */
import { useState } from "react";
import { Brace } from "@/components/ui/Brace";
import { PROCESS } from "@/lib/content";
import styles from "./Process.module.css";

// the dots that never move: where it starts, what we learn, where it goes
const FIXED = [
  { label: "Your idea", x: 79, y: 15 },
  { label: "Insights", x: 37, y: 63 },
  { label: "Growth", x: 25, y: 75 },
];
// each step's own labels, and where they sit inside the circles (% of the circle box)
const LABELS: { label: string; x: number; y: number }[][] = [
  [{ label: "Goals", x: 50, y: 34 }, { label: "Audience", x: 70, y: 52 }],
  [{ label: "UX strategy", x: 52, y: 30 }, { label: "Brand look", x: 87, y: 44 }, { label: "Prototype", x: 64, y: 50 }],
  [{ label: "Development", x: 31, y: 30 }, { label: "Testing", x: 30, y: 44 }, { label: "Integrations", x: 82, y: 66 }, { label: "Content", x: 63, y: 73 }],
  [{ label: "Go live", x: 46, y: 26 }, { label: "Tracking", x: 84, y: 56 }, { label: "Speed", x: 60, y: 70 }],
  [{ label: "Ads", x: 30, y: 30 }, { label: "Leads", x: 26, y: 47 }, { label: "Experiments", x: 80, y: 62 }, { label: "Optimising", x: 58, y: 74 }],
];

export function Process() {
  const [active, setActive] = useState(0);

  return (
    <section className={`section ${styles.wrap}`} aria-labelledby="process-title">
      <div className="container">
        <div className={styles.head}>
          <h2 id="process-title" className={styles.title}>
            From idea to growth, <Brace>one</Brace> team.
          </h2>
          <p className={styles.lead}>Five steps, the same people the whole way through. You see the plan before we build, and we stay on after launch.</p>
        </div>

        <div className={styles.grid}>
          <ol className={styles.steps}>
            {PROCESS.map((s, i) => (
              <li key={s.n} data-on={i === active || undefined}>
                <button
                  type="button"
                  className={styles.row}
                  aria-expanded={i === active}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                >
                  <span className={styles.badge} aria-hidden="true">
                    <span className={styles.num}>{s.n}</span>
                    <span className={styles.pic} data-step={i} />
                  </span>
                  <span className={styles.name}>{s.name}</span>
                  <span className={styles.desc}>{s.short}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className={styles.visual} aria-hidden="true">
            <div className={styles.circles}>
              <span className={styles.c1} />
              <span className={styles.c2} />
              <span className={styles.c3} />
              {FIXED.map((f) => (
                <span key={f.label} className={styles.fixed} style={{ left: `${f.x}%`, top: `${f.y}%` }}>
                  <em>{f.label}</em>
                  <i />
                </span>
              ))}
              {LABELS.map((set, si) =>
                set.map((l, li) => (
                  <span
                    key={`${si}-${l.label}`}
                    className={styles.tag}
                    data-on={si === active || undefined}
                    data-right={l.x > 72 || undefined}
                    style={{ left: `${l.x}%`, top: `${l.y}%`, "--d": `${li * 70}ms` } as React.CSSProperties}
                  >
                    {l.label}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
