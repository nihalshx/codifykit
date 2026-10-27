"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { T } from "@/components/ui/T";
import { Reveal } from "@/components/ui/Reveal";
import { WEB_PROJECTS, type WebProject } from "@/lib/content";
import { useMediaQuery, useReducedMotion } from "@/lib/useReducedMotion";
import styles from "./Websites.module.css";

const FEATURED = WEB_PROJECTS.filter((p) => p.featured).slice(0, 4);

function Browser({ project, children }: { project: WebProject; children: React.ReactNode }) {
  return (
    <div className={styles.browser}>
      <div className={styles.bar} aria-hidden="true">
        <span /><span /><span />
        <div className={styles.url}>{project.domain ?? ""}</div>
      </div>
      <div className={styles.viewport}>{children}</div>
    </div>
  );
}

function Shot({ project, progress, index, count }: { project: WebProject; progress: MotionValue<number>; index: number; count: number }) {
  const seg = 1 / count;
  const a = index * seg;
  // screenshot scrolls top -> bottom during its segment
  const t = (v: number) => Math.min(1, Math.max(0, (v - a) / (seg * 0.85)));
  const y = useTransform(progress, (v) => `${-100 * t(v)}%`);
  const top = useTransform(progress, (v) => `${100 * t(v)}%`);
  // wipe in from the right at the start of its segment (first one is already in)
  const clip = useTransform(progress, (v) => {
    if (index === 0) return "inset(0 0 0 0%)";
    const w = Math.min(1, Math.max(0, (v - (a - seg * 0.15)) / (seg * 0.15)));
    return `inset(0 0 0 ${(100 * (1 - w)).toFixed(2)}%)`;
  });
  return (
    <motion.div className={styles.shot} style={{ clipPath: clip, zIndex: index }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img src={project.screenshot} alt={`Full-page screenshot of ${project.title}`} style={{ y, top }} className={styles.shotImg} />
    </motion.div>
  );
}

export function Websites() {
  const reduced = useReducedMotion();
  const mobile = useMediaQuery("(max-width: 899px)");
  const sticky = !reduced && !mobile;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(FEATURED.length - 1, Math.floor(v * FEATURED.length)));
  });
  const p = FEATURED[active];

  const head = (
    <>
      <p className="label">Websites</p>
      <h2 className="h2">Websites that bring customers in.</h2>
    </>
  );

  if (!sticky) {
    return (
      <section id="web" className={`section ${styles.section}`}>
        <div className="container">
          <Reveal>{head}</Reveal>
          <div className={styles.stack}>
            {FEATURED.map((proj, i) => (
              <Reveal key={proj.slug} className={styles.stackItem}>
                <Browser project={proj}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={proj.screenshot} alt={`Screenshot of ${proj.title}`} className={`${styles.shotImg} ${reduced ? "" : styles.autoscroll}`} loading="lazy" />
                </Browser>
                <p className={styles.meta}>
                  {String(i + 1).padStart(2, "0")} / {String(FEATURED.length).padStart(2, "0")} · {proj.type.toUpperCase()}
                </p>
                <h3 className="h3"><T>{proj.title}</T></h3>
                <p className="muted"><T>{proj.oneLine}</T></p>
              </Reveal>
            ))}
          </div>
          <Link href="/work/web/" className="btn" style={{ marginTop: 32 }}>Enter the 3D web showcase ↗</Link>
        </div>
      </section>
    );
  }

  return (
    <section id="web" ref={ref} className={styles.tall} style={{ height: `${FEATURED.length * 75 + 25}vh` }}>
      <div className={styles.sticky}>
        <div className={`container ${styles.grid}`}>
          <div className={styles.left}>
            {head}
            <div className={styles.copy} key={active}>
              <p className={styles.meta}>
                {String(active + 1).padStart(2, "0")} / {String(FEATURED.length).padStart(2, "0")} · {p.type.toUpperCase()}
              </p>
              <h3 className={styles.name}><T>{p.title}</T></h3>
              <p className="muted"><T>{p.oneLine}</T></p>
            </div>
            <div className={styles.dashes} aria-hidden="true">
              {FEATURED.map((f, i) => (
                <span key={f.slug} data-on={i <= active} />
              ))}
            </div>
            <Link href="/work/web/" className="btn">Enter the 3D web showcase ↗</Link>
          </div>
          <Browser project={p}>
            {FEATURED.map((proj, i) => (
              <Shot key={proj.slug} project={proj} progress={scrollYProgress} index={i} count={FEATURED.length} />
            ))}
          </Browser>
        </div>
      </div>
    </section>
  );
}
