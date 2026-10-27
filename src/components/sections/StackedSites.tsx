"use client";
/**
 * Websites as stacked cards, rebuilt from the reference: one dark card per kind of website (title,
 * one line, and one of our sites in a browser window). The stack holds still while you scroll; each
 * new card rises from below over the last one, which tips back in 3D, shrinks and slides up behind it.
 * A "Discuss the project" pill stays at the foot of the stack. GSAP ScrollTrigger drives it.
 * Without motion (reduced motion or no script) the cards simply sit one under another.
 */
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Brace } from "@/components/ui/Brace";
import { T } from "@/components/ui/T";
import { IconLock } from "@/components/ui/Icons";
import { WEB_FORMATS } from "@/lib/content";
import styles from "./StackedSites.module.css";

export function StackedSites() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ctx: gsap.Context | undefined;
    let cancelled = false;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const stage = stageRef.current!;
      // switch to the stacked layout before measuring, so the pin sees one screen, not the whole list
      stage.dataset.stacked = "";
      ctx = gsap.context(() => {
        const cards = gsap.utils.toArray<HTMLElement>(`.${styles.card}`, stage);
        gsap.set(cards.slice(1), { yPercent: 135 }); // waiting cards sit fully below the screen
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: `+=${(cards.length - 1) * 90}%`,
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
          },
        });
        cards.forEach((card, i) => {
          if (!i) return;
          const at = i - 1;
          // the new card rises over the stack
          tl.to(card, { yPercent: 0, duration: 1 }, at);
          // the one it covers tips back, shrinks and slides up behind it
          tl.to(cards[i - 1], { rotateX: 20, scale: 0.9, yPercent: -7, duration: 1 }, at);
          // the one before that sinks out of sight
          if (i > 1) tl.to(cards[i - 2], { scale: 0.82, yPercent: -12, autoAlpha: 0, duration: 1 }, at);
        });
      }, stageRef);
      const refresh = () => ScrollTrigger.refresh();
      if (document.readyState === "complete") refresh();
      else window.addEventListener("load", refresh, { once: true });
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
      if (stageRef.current) delete stageRef.current.dataset.stacked;
    };
  }, []);

  return (
    <section id="web" className={styles.section} aria-labelledby="web-title">
      <div className={`container ${styles.head}`}>
        <h2 id="web-title" className={styles.title}>
          What kind of <Brace>website</Brace> do you need?
        </h2>
      </div>

      <div ref={stageRef} className={styles.stage}>
        <ol className={styles.cards}>
          {WEB_FORMATS.map((f) => (
            <li key={f.name} className={styles.card}>
              <div className={styles.cardHead}>
                <h3>{f.name}</h3>
                <p>{f.line}</p>
              </div>
              <Link href={`/work/${f.project!.slug}/`} className={styles.browser} aria-label={`${f.name}: open the case study`}>
                <span className={styles.chrome} aria-hidden="true">
                  <span className={styles.dots}><i /><i /><i /></span>
                  <span className={styles.address}><IconLock /> {f.project!.domain}</span>
                </span>
                <span className={styles.shot}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.project!.screenshot} alt="" loading="lazy" draggable={false} />
                </span>
                <span className={styles.caption}><T>{f.project!.title}</T> · case study →</span>
              </Link>
            </li>
          ))}
        </ol>
        <Link href="/contact/?need=Website" className={styles.discuss}>Discuss the project</Link>
      </div>

      <div className={`container ${styles.end}`}>
        <p className={styles.endTitle}>
          Didn&apos;t find your format?
          <span>We&apos;ll build one for your case.</span>
        </p>
        <div className={styles.endBtns}>
          <Link href="/contact/?need=Website" className="btn btn--violet">Discuss the project</Link>
          <Link href="/services/web/" className="btn btn--ghost">Web development</Link>
        </div>
      </div>
    </section>
  );
}
