"use client";
/**
 * Posters on a 3D phone, opened on our Instagram-style profile. The section holds the screen while
 * you scroll: the profile grid scrolls up, a post is tapped, it opens as a reel, and the reels swipe
 * up one after another, while the phone turns in 3D from one side to the other.
 * Without motion (reduced motion or no script) the phone stands still on the profile.
 * The phone is real HTML (not a picture), so the posters stay sharp and the counts are honest:
 * only the number of posts is shown, never follower numbers we don't have.
 */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Brace } from "@/components/ui/Brace";
import { T } from "@/components/ui/T";
import { Icon } from "@/components/ui/Logo";
import { CAMPAIGNS, CONTACT, SITE, isPlaceholder } from "@/lib/content";
import styles from "./PosterPhone.module.css";

const STEPS = [
  { title: "Your profile, made to be scrolled", line: "Every post planned so the grid reads as one brand: the same colours, the same voice." },
  { title: "One tap, and it opens", line: "Each poster works on its own too, full screen, with nothing to explain." },
  { title: "Swipe after swipe", line: "Offer posters, product creatives and campaign sets that stop the thumb." },
];
const REELS = 5; // posts that open as reels

export function PosterPhone() {
  const sectionRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);

  // every poster, newest campaign first, each with the caption of its campaign
  const posts = useMemo(
    () => CAMPAIGNS.flatMap((c) => c.posters.map((src, i) => ({ src, c, key: `${c.slug}-${i}` }))),
    []
  );
  const grid = useMemo(() => Array.from({ length: 15 }, (_, i) => posts[i % posts.length]), [posts]);
  const reels = posts.slice(0, REELS);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ctx: gsap.Context | undefined;
    let cancelled = false;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const root = sectionRef.current!;
      root.dataset.live = "";
      ctx = gsap.context(() => {
        const q = (sel: string) => root.querySelector<HTMLElement>(`.${styles[sel]}`)!;
        const phone = q("phone");
        const profile = q("profileScroll");
        const reelView = q("reelView");
        const reelTrack = q("reelTrack");
        const tap = q("tap");
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: q("pin"),
            start: "top top",
            end: "+=320%",
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            onUpdate: (self) => setStep(self.progress < 0.36 ? 0 : self.progress < 0.5 ? 1 : 2),
          },
        });
        // the phone turns from one side, faces us, and turns to the other side
        tl.fromTo(phone, { rotateY: -26, rotateX: 10, rotateZ: -4 }, { rotateY: 0, rotateX: 4, rotateZ: 0, duration: 0.4, ease: "power1.out" }, 0);
        tl.to(phone, { rotateY: 18, rotateX: 6, rotateZ: 3, duration: 0.6, ease: "power1.inOut" }, 0.4);
        // 1. the profile scrolls up through the grid
        tl.fromTo(profile, { y: 0 }, { y: () => -(profile.scrollHeight - profile.parentElement!.clientHeight) * 0.55, duration: 0.32 }, 0.02);
        // 2. a tap on a post, and the post opens as a reel
        tl.fromTo(tap, { scale: 0, opacity: 0.9 }, { scale: 1, opacity: 0, duration: 0.06 }, 0.36);
        tl.fromTo(reelView, { yPercent: 100 }, { yPercent: 0, duration: 0.08, ease: "power2.out" }, 0.4);
        // 3. the reels swipe up one after another
        for (let i = 1; i < REELS; i++) {
          tl.to(reelTrack, { yPercent: -(100 / REELS) * i, duration: 0.07, ease: "power2.inOut" }, 0.5 + (i - 1) * 0.12);
        }
      }, root);
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
      if (sectionRef.current) delete sectionRef.current.dataset.live;
    };
  }, []);

  const handle = CONTACT.instagram.replace(/\/$/, "").split("/").pop() || "codifykit";

  return (
    <section ref={sectionRef} id="posters" className={styles.section} aria-labelledby="posters-title">
      <svg className={styles.orbits} viewBox="0 0 1400 900" preserveAspectRatio="none" aria-hidden="true">
        <ellipse cx="260" cy="760" rx="460" ry="210" />
        <ellipse cx="1140" cy="240" rx="380" ry="170" />
      </svg>
      <div className={styles.pin}>
        <div className={`container ${styles.layout}`}>
          <div className={styles.copy}>
            <p className="label">Posters &amp; brand</p>
            <h2 id="posters-title" className={styles.title}>Posters that <Brace>stop</Brace> the scroll.</h2>
            <ol className={styles.steps}>
              {STEPS.map((s, i) => (
                <li key={s.title} data-on={i === step || undefined}>
                  <strong>{s.title}</strong>
                  <span>{s.line}</span>
                </li>
              ))}
            </ol>
            <div className={styles.btns}>
              <Link href="/work/posters/" className={styles.primary}>See every poster ↗</Link>
              <a href={CONTACT.instagram} target="_blank" rel="noopener" className={styles.ghost}>Follow on Instagram ↗</a>
            </div>
          </div>

          <div className={styles.scene} aria-hidden="true">
            <div className={styles.phone}>
              <span className={styles.side} />
              <div className={styles.screen}>
                <div className={styles.status} data-dark={step > 0 || undefined}><b>9:41</b><i /><span /></div>
                <div className={styles.viewport}>
                  {/* the profile */}
                  <div className={styles.profileScroll}>
                    <div className={styles.bar}>
                      <strong>{handle}</strong>
                      <svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                    </div>
                    <div className={styles.head}>
                      <span className={styles.avatar}><Icon size={30} /></span>
                      <div className={styles.stats}>
                        <span><b>{posts.length}</b>posts</span>
                      </div>
                    </div>
                    <p className={styles.name}>Codifykit</p>
                    <p className={styles.bio}>{SITE.tagline}</p>
                    <div className={styles.actions}><span>Follow</span><span>Message</span></div>
                    <div className={styles.tabs}><span data-on="" /><span /><span /></div>
                    <div className={styles.grid}>
                      {grid.map((p, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={p.src} alt="" loading="lazy" draggable={false} />
                      ))}
                    </div>
                  </div>
                  <span className={styles.tap} />
                </div>
                <div className={styles.homeBar} />
                  {/* the reels */}
                <div className={styles.reelView}>
                  <div className={styles.reelTrack} style={{ height: `${REELS * 100}%` }}>
                    {reels.map((p) => (
                      <div key={p.key} className={styles.reel}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.src} alt="" loading="lazy" draggable={false} />
                        <div className={styles.reelUi}>
                          <div className={styles.reelSide}>
                            <svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></svg>
                            <svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-3.3-6.5L20 4l-.6 4.2A8 8 0 0 1 20 12Z" /></svg>
                            <svg viewBox="0 0 24 24"><path d="m21 4-9 16-2.5-7L3 10.5 21 4Z" /></svg>
                          </div>
                          <div className={styles.reelInfo}>
                            <span className={styles.reelUser}><span className={styles.mini}><Icon size={12} /></span>{handle}</span>
                            <span className={styles.reelCap}>{isPlaceholder(p.c.caption) ? p.c.type : <T>{p.c.caption}</T>}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
            <div className={styles.shadow} />
          </div>
        </div>
      </div>
    </section>
  );
}
