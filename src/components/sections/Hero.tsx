"use client";
import { useState } from "react";
import { HeroRing } from "@/components/hero/HeroRing";
import { useAudience } from "@/components/layout/Audience";
import { SITE, WHEEL_CARDS, type AudienceSegment } from "@/lib/content";
import styles from "./Hero.module.css";

// 24 cards make a ring that frames well from the inside
const HERO_CARDS = WHEEL_CARDS.slice(0, 24);
const UNDERLINE = ["#3A63B8", "#6A55C8", "#B9A8E8", "#1A1680"];

export function Hero() {
  const { audience } = useAudience();
  const line = (audience === "students" ? SITE.audienceLine.students : SITE.audienceLine.business) as AudienceSegment[];
  const [peek, setPeek] = useState<{ seg: AudienceSegment; x: number; y: number } | null>(null);
  let linkIndex = 0;

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <h1 id="hero-title" className="sr-only">
        Codifykit, a digital growth and creative studio: websites, Android and iOS apps, ads and creative from one team.
      </h1>
      {/* hide header + headline before hydration so they never flash before the intro */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.dataset.intro='running'}}catch(e){}",
        }}
      />
      <HeroRing cards={HERO_CARDS} intro>
        <div className={styles.under}>
          <p className={styles.audience} aria-live="polite">
            {line.map((seg, i) => {
              if (!seg.href) return <span key={i}>{seg.text}</span>;
              const color = UNDERLINE[linkIndex++ % UNDERLINE.length];
              return (
                <a
                  key={i}
                  href={seg.href}
                  className={seg.kitto ? styles.kittoLink : undefined}
                  style={{ "--u": color } as React.CSSProperties}
                  onMouseEnter={(e) => setPeek({ seg, x: e.clientX, y: e.clientY })}
                  onMouseMove={(e) => setPeek((p) => (p ? { ...p, x: e.clientX, y: e.clientY } : p))}
                  onMouseLeave={() => setPeek(null)}
                >
                  {seg.text}
                  <sup aria-hidden="true">{seg.kitto ? "↗" : String(linkIndex).padStart(2, "0")}</sup>
                </a>
              );
            })}
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
      </HeroRing>

      {peek && (
        <div className={styles.peek} style={{ left: peek.x, top: peek.y }} aria-hidden="true">
          {peek.seg.kitto ? (
            <div className={styles.kittoPeek}>
              <strong>What are you working on?</strong>
              <span>Ask Kitto about a website, app, campaign or college project.</span>
            </div>
          ) : peek.seg.preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={peek.seg.preview} alt="" />
          ) : null}
        </div>
      )}
    </section>
  );
}
