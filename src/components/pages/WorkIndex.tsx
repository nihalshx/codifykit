"use client";
/**
 * The one portfolio page: every case study, filtered by kind. "All" shows a short row of each kind
 * with a way into the rest; a filter shows everything of that kind, with its own ways in (the 3D
 * view for websites and apps, the service page, starting a project). Videos play here on the reel
 * wheel. /work/?filter=Apps opens on a filter, and the address follows the chips.
 */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { WorkCard } from "./WorkCard";
import { VideoWheel } from "./VideoWheel";
import { CASE_STUDIES, WHEEL_CARDS } from "@/lib/content";
import styles from "./WorkIndex.module.css";

const FILTERS = ["All", "Websites", "Apps", "Posters", "Videos"] as const;
type Filter = (typeof FILTERS)[number];
type Kind = Exclude<Filter, "All">;
const VIDEO_CARDS = WHEEL_CARDS.filter((c) => c.type === "reel" || c.type === "ai-video");
const count = (x: Filter) =>
  x === "All" ? CASE_STUDIES.length + VIDEO_CARDS.length : x === "Videos" ? VIDEO_CARDS.length : CASE_STUDIES.filter((c) => c.kind === x).length;

// what each kind is, and what it offers besides the grid
const WAYS: Record<Kind, { title: string; line: string; links: { href: string; label: string; primary?: boolean }[] }> = {
  Websites: {
    title: "Websites",
    line: "Business sites, landing pages, portfolios and stores.",
    links: [{ href: "/work/web/", label: "View them in 3D ↗" }, { href: "/services/web/", label: "Websites service →" }, { href: "/contact/?need=Website", label: "Start a website", primary: true }],
  },
  Apps: {
    title: "Android & iOS apps",
    line: "Android and iOS apps, and the dashboards behind them.",
    links: [{ href: "/work/apps/", label: "View them in 3D ↗" }, { href: "/services/apps/", label: "Apps service →" }, { href: "/contact/?need=Android%20%2F%20iOS%20app", label: "Start an app", primary: true }],
  },
  Posters: {
    title: "Posters & branding",
    line: "Offer posters, product creatives, logos and campaign sets.",
    links: [{ href: "/services/branding-content/", label: "Branding & content service →" }, { href: "/contact/?need=Branding%20%26%20content", label: "Get posters made", primary: true }],
  },
  Videos: {
    title: "Reels & AI videos",
    line: "Reels and realistic AI videos. Drag to turn the wheel, tap a card to watch.",
    links: [{ href: "/services/branding-content/", label: "Branding & content service →" }, { href: "/contact/?need=Branding%20%26%20content", label: "Get videos made", primary: true }],
  },
};
const PREVIEW = 4;

export function WorkIndex() {
  const [f, setF] = useState<Filter>("All");
  const topRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("filter");
    if (q && (FILTERS as readonly string[]).includes(q)) setF(q as Filter);
  }, []);
  const choose = (x: Filter, scroll = false) => {
    setF(x);
    window.history.replaceState(null, "", x === "All" ? "/work/" : `/work/?filter=${x}`);
    if (scroll) topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={topRef} className={styles.top}>
      <div className={styles.chips} role="group" aria-label="Filter work">
        {FILTERS.map((x) => (
          <button key={x} type="button" className="chip" aria-pressed={f === x} onClick={() => choose(x)}>
            {x} <span className={styles.count}>{count(x)}</span>
          </button>
        ))}
      </div>

      {f === "All" ? (
        // a short row of each kind, each with a way into the rest
        (Object.keys(WAYS) as Kind[]).map((k) => {
          const w = WAYS[k];
          return (
            <section key={k} className={styles.group} aria-labelledby={`g-${k}`}>
              <div className={styles.groupHead}>
                <div>
                  <h2 id={`g-${k}`} className={styles.groupTitle}>{w.title} <span className={styles.count}>{count(k)}</span></h2>
                  <p className="muted">{w.line.split(". Drag")[0]}</p>
                </div>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => choose(k, true)}>
                  {k === "Videos" ? "Watch them all →" : `See all ${count(k)} →`}
                </button>
              </div>
              {k === "Videos" ? (
                <ul className={styles.reels}>
                  {VIDEO_CARDS.slice(0, PREVIEW).map((c) => (
                    <li key={c.id}>
                      <button type="button" onClick={() => choose("Videos", true)} aria-label={`Watch reels: ${c.type === "ai-video" ? "AI video" : "reel"}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.cover} alt="" loading="lazy" />
                        <span aria-hidden="true">▶ Watch</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.grid}>
                  {CASE_STUDIES.filter((c) => c.kind === k).slice(0, PREVIEW).map((c) => <WorkCard key={c.slug} item={c} />)}
                </div>
              )}
            </section>
          );
        })
      ) : (
        <>
          <div className={styles.ways}>
            <p>{WAYS[f].line}</p>
            <div>
              {WAYS[f].links.map((l) => (
                <Link key={l.href + l.label} href={l.href} className={l.primary ? "btn btn--violet btn--sm" : styles.wayLink}>{l.label}</Link>
              ))}
            </div>
          </div>
          {f === "Videos" ? (
            <VideoWheel />
          ) : (
            <div className={styles.grid}>
              {CASE_STUDIES.filter((c) => c.kind === f).map((c) => <WorkCard key={c.slug} item={c} />)}
            </div>
          )}
          <button type="button" className={styles.back} onClick={() => choose("All", true)}>← Back to all work</button>
        </>
      )}
    </div>
  );
}
