"use client";
import { Brace } from "@/components/ui/Brace";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Logo";
import styles from "./Story.module.css";

export function Story() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1]);
  const words = "ONE TEAM • TECH + CREATIVE • ";
  return (
    <section className="section" aria-labelledby="story-title">
      <div className={`container ${styles.grid}`}>
        <Reveal className={styles.copy}>
          <p className="label">Story</p>
          <h2 id="story-title" className="h2">Codifykit started in an <Brace>MCA</Brace> classroom.</h2>
          <p className="lead">
            Word spread, businesses started asking, and we grew into one team for the tech, the creative and the marketing.
          </p>
          <Link href="/about/" className="link-arrow">Read our story →</Link>
        </Reveal>
        <div ref={ref} className={styles.pill}>
          {/* Team photo goes here: public/images/team-pill.webp (must be a real photo). */}
          <motion.div className={styles.photo} style={{ scale }}>
            <div className={styles.placeholder}>
              <Icon size={64} />
              <span>Team photo coming soon</span>
            </div>
          </motion.div>
          <div className={styles.marquee} aria-hidden="true">
            <div className={styles.track}>
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i}>{words}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
