"use client";
import Link from "next/link";
import { useState } from "react";
import { WorkCard } from "./WorkCard";
import { CASE_STUDIES } from "@/lib/content";
import styles from "./WorkIndex.module.css";

const FILTERS = ["All", "Apps", "Websites", "Posters", "Videos"] as const;

export function WorkIndex() {
  const [f, setF] = useState<(typeof FILTERS)[number]>("All");
  const list = f === "All" ? CASE_STUDIES : CASE_STUDIES.filter((c) => c.kind === f);
  return (
    <>
      <div className={styles.entries}>
        <Link href="/work/web/" className={styles.entry}>
          <span className={styles.entryLabel}>3D showcase</span>
          <span className={styles.entryTitle}>Websites in 3D ↗</span>
        </Link>
        <Link href="/work/posters/" className={styles.entry}>
          <span className={styles.entryLabel}>3D showcase</span>
          <span className={styles.entryTitle}>Posters in 3D ↗</span>
        </Link>
      </div>
      <div className={styles.chips} role="group" aria-label="Filter work">
        {FILTERS.map((x) => (
          <button key={x} type="button" className="chip" aria-pressed={f === x} onClick={() => setF(x)}>{x}</button>
        ))}
      </div>
      {f === "Videos" ? (
        <p className="lead">Reels and AI videos live in the <Link href="/work/videos/">video wheel</Link>.</p>
      ) : (
        <div className={styles.grid}>
          {list.map((c) => <WorkCard key={c.slug} item={c} />)}
        </div>
      )}
    </>
  );
}
