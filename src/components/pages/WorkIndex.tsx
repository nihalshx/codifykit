"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { WorkCard } from "./WorkCard";
import { CASE_STUDIES } from "@/lib/content";
import styles from "./WorkIndex.module.css";

const FILTERS = ["All", "Apps", "Websites", "Posters"] as const;
type Filter = (typeof FILTERS)[number];
const count = (x: Filter) => (x === "All" ? CASE_STUDIES.length : CASE_STUDIES.filter((c) => c.kind === x).length);

export function WorkIndex() {
  const [f, setF] = useState<Filter>("All");
  // /work/?filter=Apps opens on that filter (links from the case studies), and the URL follows the chips
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("filter");
    if (q && (FILTERS as readonly string[]).includes(q)) setF(q as Filter);
  }, []);
  const choose = (x: Filter) => {
    setF(x);
    window.history.replaceState(null, "", x === "All" ? "/work/" : `/work/?filter=${x}`);
  };
  const list = f === "All" ? CASE_STUDIES : CASE_STUDIES.filter((c) => c.kind === f);
  return (
    <>
      <div className={styles.entries}>
        <Link href="/work/web/" className={styles.entry}>
          <span className={styles.entryLabel}>3D showcase</span>
          <span className={styles.entryTitle}>Websites in 3D ↗</span>
        </Link>
        <Link href="/work/apps/" className={styles.entry}>
          <span className={styles.entryLabel}>3D showcase</span>
          <span className={styles.entryTitle}>Apps in 3D ↗</span>
        </Link>
        <Link href="/work/posters/" className={styles.entry}>
          <span className={styles.entryLabel}>Flip through</span>
          <span className={styles.entryTitle}>Poster deck ↗</span>
        </Link>
        <Link href="/work/videos/" className={styles.entry}>
          <span className={styles.entryLabel}>Reels &amp; AI videos</span>
          <span className={styles.entryTitle}>Video wheel ↗</span>
        </Link>
      </div>
      <div className={styles.chips} role="group" aria-label="Filter work">
        {FILTERS.map((x) => (
          <button key={x} type="button" className="chip" aria-pressed={f === x} onClick={() => choose(x)}>
            {x} <span className={styles.count}>{count(x)}</span>
          </button>
        ))}
      </div>
      <div className={styles.grid}>
        {list.map((c) => <WorkCard key={c.slug} item={c} />)}
      </div>
    </>
  );
}
