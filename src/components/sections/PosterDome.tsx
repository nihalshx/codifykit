"use client";
/**
 * Posters on the inside of a dome: drag sideways to turn it, click a poster (or Enter on it) to lift
 * it out full size; click outside or press Escape to put it back. The filters re-hang the dome.
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import { Brace } from "@/components/ui/Brace";
import { DomeGallery, type DomeImage } from "@/components/gallery/DomeGallery";
import { CAMPAIGNS, POSTER_CATEGORIES, isPlaceholder } from "@/lib/content";
import styles from "./PosterDome.module.css";

const DOME_BG = "#0E0C26";

export function PosterDome() {
  const [filter, setFilter] = useState("All");
  const images = useMemo<DomeImage[]>(() => {
    const list = filter === "All" ? CAMPAIGNS : CAMPAIGNS.filter((c) => c.category === filter);
    return list.flatMap((c) =>
      c.posters.map((src) => ({ src, alt: isPlaceholder(c.title) ? `${c.type} poster` : `${c.title}, ${c.type.toLowerCase()}` }))
    );
  }, [filter]);

  return (
    <section id="posters" className={styles.section} aria-labelledby="posters-title">
      <div className={`container ${styles.head}`}>
        <div>
          <p className="label">Posters &amp; brand</p>
          <h2 id="posters-title" className="h2">Posters that <Brace>stop</Brace> the scroll.</h2>
        </div>
        <div className={styles.side}>
          <div className={styles.chips} role="group" aria-label="Filter posters">
            {POSTER_CATEGORIES.map((c) => (
              <button key={c} type="button" className={styles.chip} aria-pressed={filter === c} onClick={() => setFilter(c)}>
                {c}
              </button>
            ))}
          </div>
          <Link href="/work/posters/" className={styles.all}>All posters ↗</Link>
        </div>
      </div>
      <div className={styles.dome}>
        {images.length ? (
          <DomeGallery
            key={filter}
            images={images}
            overlayBlurColor={DOME_BG}
            grayscale={false}
            fit={0.62}
            minRadius={520}
            segments={34}
            imageBorderRadius="16px"
            openedImageBorderRadius="18px"
            openedImageWidth="min(380px, 78vw)"
            openedImageHeight="min(475px, 62svh)"
          />
        ) : (
          <p className={styles.empty}>Nothing in this category yet.</p>
        )}
      </div>
      <p className={styles.hint} aria-hidden="true">Drag to turn the dome · click a poster to open it</p>
    </section>
  );
}
