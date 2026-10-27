"use client";
/**
 * The one portfolio page: every case study, filtered by kind. Each filter brings its own ways in
 * (the 3D view for websites and apps, the service page, starting a project); videos play right here
 * on the reel wheel. /work/?filter=Apps opens on a filter, and the address follows the chips.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { WorkCard } from "./WorkCard";
import { VideoWheel } from "./VideoWheel";
import { CASE_STUDIES, WHEEL_CARDS } from "@/lib/content";
import styles from "./WorkIndex.module.css";

const FILTERS = ["All", "Websites", "Apps", "Posters", "Videos"] as const;
type Filter = (typeof FILTERS)[number];
const VIDEOS = WHEEL_CARDS.filter((c) => c.type === "reel" || c.type === "ai-video").length;
const count = (x: Filter) =>
  x === "All" ? CASE_STUDIES.length : x === "Videos" ? VIDEOS : CASE_STUDIES.filter((c) => c.kind === x).length;

// what each filter offers besides the grid
const WAYS: Partial<Record<Filter, { line: string; links: { href: string; label: string; primary?: boolean }[] }>> = {
  Websites: {
    line: "Business sites, landing pages, portfolios and stores.",
    links: [{ href: "/work/web/", label: "View them in 3D ↗" }, { href: "/services/web/", label: "Websites service →" }, { href: "/contact/?need=Website", label: "Start a website", primary: true }],
  },
  Apps: {
    line: "Android and iOS apps, and the dashboards behind them.",
    links: [{ href: "/work/apps/", label: "View them in 3D ↗" }, { href: "/services/apps/", label: "Apps service →" }, { href: "/contact/?need=Android%20%2F%20iOS%20app", label: "Start an app", primary: true }],
  },
  Posters: {
    line: "Offer posters, product creatives, logos and campaign sets.",
    links: [{ href: "/services/branding-content/", label: "Branding & content service →" }, { href: "/contact/?need=Branding%20%26%20posters", label: "Get posters made", primary: true }],
  },
  Videos: {
    line: "Reels and realistic AI videos. Drag to turn the wheel, tap a card to watch.",
    links: [{ href: "/services/branding-content/", label: "Branding & content service →" }, { href: "/contact/?need=Video", label: "Get videos made", primary: true }],
  },
};

export function WorkIndex() {
  const [f, setF] = useState<Filter>("All");
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("filter");
    if (q && (FILTERS as readonly string[]).includes(q)) setF(q as Filter);
  }, []);
  const choose = (x: Filter) => {
    setF(x);
    window.history.replaceState(null, "", x === "All" ? "/work/" : `/work/?filter=${x}`);
  };
  const list = f === "All" ? CASE_STUDIES : CASE_STUDIES.filter((c) => c.kind === f);
  const ways = WAYS[f];
  return (
    <>
      <div className={styles.chips} role="group" aria-label="Filter work">
        {FILTERS.map((x) => (
          <button key={x} type="button" className="chip" aria-pressed={f === x} onClick={() => choose(x)}>
            {x} <span className={styles.count}>{count(x)}</span>
          </button>
        ))}
      </div>
      {ways && (
        <div className={styles.ways}>
          <p>{ways.line}</p>
          <div>
            {ways.links.map((l) => (
              <Link key={l.href} href={l.href} className={l.primary ? "btn btn--violet btn--sm" : styles.wayLink}>{l.label}</Link>
            ))}
          </div>
        </div>
      )}
      {f === "Videos" ? (
        <VideoWheel />
      ) : (
        <div className={styles.grid}>
          {list.map((c) => <WorkCard key={c.slug} item={c} />)}
        </div>
      )}
    </>
  );
}
