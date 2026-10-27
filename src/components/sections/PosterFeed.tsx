"use client";
/**
 * Posters sliding through a phone, after the reference: a row of tall poster cards drifts sideways on
 * its own behind a phone fixed in the middle, and whatever passes the phone shows on its screen as an
 * Instagram post (our profile header, the post, the like / comment / share row and the caption).
 * The post inside moves in step with the cards outside, so each poster seems to slide through the
 * phone. Hover or focus pauses it; with reduced
 * motion it stands still on the first post.
 */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Brace } from "@/components/ui/Brace";
import { T } from "@/components/ui/T";
import { Icon } from "@/components/ui/Logo";
import { CAMPAIGNS, CONTACT, isPlaceholder } from "@/lib/content";
import styles from "./PosterFeed.module.css";

const SPEED = 0.3; // cards per second (about the pace of the reference)

export function PosterFeed() {
  const posts = useMemo(
    () => CAMPAIGNS.flatMap((c) => c.posters.map((src, i) => ({ src, c, key: `${c.slug}-${i}` }))),
    []
  );
  const n = posts.length;
  const trackRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const paused = useRef(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const track = trackRef.current, inner = innerRef.current, section = sectionRef.current;
    if (!track || !inner || !section || !n) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.05 });
    io.observe(section);
    let pos = 0; // in cards; 0 = the first poster centred on the phone
    let last = performance.now();
    let shownIdx = -1;
    let raf = 0;
    const tick = (now: number) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      if (visible && !paused.current) pos += SPEED * dt * (1 + 0.6 * Math.sin(pos * Math.PI * 2) ** 2);
      // the row outside: one card pitch per step
      track.style.setProperty("--pos", pos.toFixed(4));
      // the post inside: the same steps, one screen width each, looping over the posts
      const p = ((pos % n) + n) % n;
      inner.style.setProperty("--pos", p.toFixed(4));
      const idx = Math.round(p) % n;
      if (idx !== shownIdx) {
        shownIdx = idx;
        setCurrent(idx);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [n]);

  if (!n) return null;
  const cur = posts[current];
  const handle = CONTACT.instagram.replace(/\/$/, "").split("/").pop() || "codifykit";
  // the row: enough copies to cover the widest screen on both sides
  const row = Array.from({ length: n * 3 }, (_, i) => posts[i % n]);
  const caption = (p: (typeof posts)[number]) => (isPlaceholder(p.c.caption) ? `${p.c.type} for ${isPlaceholder(p.c.client) ? "a client" : p.c.client}.` : p.c.caption);

  return (
    <section
      ref={sectionRef}
      id="posters"
      className={styles.section}
      aria-labelledby="posters-title"
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocusCapture={() => (paused.current = true)}
      onBlurCapture={() => (paused.current = false)}
    >
      <div className={`container ${styles.head}`}>
        <h2 id="posters-title" className={styles.title}>Posters that <Brace>stop</Brace> the scroll.</h2>
        <p className={styles.lead}>Offer posters, product creatives and campaign sets, planned so your feed reads as one brand and every post works on its own.</p>
        <div className={styles.btns}>
          <Link href="/contact/?need=Branding%20%26%20content" className={styles.primary}>Get posters made</Link>
          <Link href="/work/?filter=Posters" className={styles.ghost}>See every poster →</Link>
        </div>
      </div>

      <div className={styles.stage}>
        {/* the row of cards drifting behind the phone */}
        <div ref={trackRef} className={styles.track} aria-hidden="true">
          {row.map((p, i) => (
            <div key={i} className={styles.card} style={{ "--i": i - n } as React.CSSProperties}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt="" loading="lazy" draggable={false} />
            </div>
          ))}
        </div>

        {/* the phone, open on the post in front */}
        <div className={styles.phone}>
          <div className={styles.screen}>
            <div className={styles.status} aria-hidden="true"><b>9:41</b><i /><span /></div>
            <div className={styles.appBar} aria-hidden="true">
              <strong>{handle}</strong>
              <svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></svg>
            </div>
            <div className={styles.postHead}>
              <span className={styles.avatar} aria-hidden="true"><Icon size={14} /></span>
              <span className={styles.who}>
                <strong>{handle}</strong>
                <small><T>{cur.c.client}</T></small>
              </span>
              <span className={styles.more} aria-hidden="true">•••</span>
            </div>
            {/* the post image moves in step with the cards outside */}
            <div className={styles.media} aria-hidden="true">
              <div ref={innerRef} className={styles.mediaTrack}>
                {[...posts, posts[0]].map((p, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={p.src} alt="" draggable={false} style={{ "--i": i } as React.CSSProperties} />
                ))}
              </div>
            </div>
            <div className={styles.icons} aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></svg>
              <svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-3.3-6.5L20 4l-.6 4.2A8 8 0 0 1 20 12Z" /></svg>
              <svg viewBox="0 0 24 24"><path d="m21 4-9 16-2.5-7L3 10.5 21 4Z" /></svg>
              <span className={styles.dots}>{posts.slice(0, 5).map((_, i) => <i key={i} data-on={i === current % 5 || undefined} />)}</span>
              <svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4.5L6 21V3Z" /></svg>
            </div>
            <p className={styles.caption}>
              <strong>{handle}</strong> <T>{caption(cur)}</T>
            </p>
            <div className={styles.nav} aria-hidden="true"><i /><i /><i /><i /><i /></div>
          </div>
          <p className="sr-only" aria-live="polite">Now showing: {cur.c.type} for {isPlaceholder(cur.c.client) ? "a client" : cur.c.client}</p>
        </div>

      </div>
    </section>
  );
}
