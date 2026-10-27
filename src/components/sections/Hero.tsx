"use client";
import { CardWheel } from "@/components/wheel/CardWheel";
import { useAudience } from "@/components/layout/Audience";
import { SITE, WHEEL_CARDS, type AudienceSegment } from "@/lib/content";
import styles from "./Hero.module.css";

export function Hero() {
  const { audience } = useAudience();
  const line = (audience === "students" ? SITE.audienceLine.students : SITE.audienceLine.business) as AudienceSegment[];

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <h1 id="hero-title" className="sr-only">
        Codifykit — a digital growth and creative studio. Websites, Android and iOS apps, ads and creative, from one team.
      </h1>
      {/* hide header + headline before hydration so they never flash before the intro */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.dataset.intro='running'}catch(e){}",
        }}
      />
      <CardWheel cards={WHEEL_CARDS} intro />
      <div className={styles.under}>
        <p className={styles.audience} aria-live="polite">
          {line.map((seg, i) =>
            seg.href ? (
              <a key={i} href={seg.href}>
                {seg.text}
              </a>
            ) : (
              <span key={i}>{seg.text}</span>
            )
          )}
        </p>
        <div className={styles.ctas}>
          {audience === "students" ? (
            <a href="/students/" className="btn">Get project help</a>
          ) : (
            <a href="#ask" className="btn">Start a project</a>
          )}
          <a href="/work/" className="btn btn--ghost">See our work</a>
        </div>
      </div>
    </section>
  );
}
