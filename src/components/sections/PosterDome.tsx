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
import { useMediaQuery } from "@/lib/useReducedMotion";
import styles from "./PosterDome.module.css";

const DOME_BG = "#1C1C1F"; // the same dark as the app section

export function PosterDome() {
  const [filter, setFilter] = useState("All");
  const phone = useMediaQuery("(max-width: 767px)");
  const images = useMemo<DomeImage[]>(() => {
    const list = filter === "All" ? CAMPAIGNS : CAMPAIGNS.filter((c) => c.category === filter);
    return list.flatMap((c) =>
      c.posters.map((src) => ({ src, alt: isPlaceholder(c.title) ? `${c.type} poster` : `${c.title}, ${c.type.toLowerCase()}` }))
    );
  }, [filter]);

  return (
    <section id="posters" className={styles.section} aria-labelledby="posters-title">
      {/* the app section's world: thin orbit lines and a giant faint line of words behind the dome */}
      <svg className={styles.orbits} viewBox="0 0 1400 900" preserveAspectRatio="none" aria-hidden="true">
        <ellipse cx="260" cy="760" rx="460" ry="210" />
        <ellipse cx="1140" cy="240" rx="380" ry="170" />
        <ellipse cx="700" cy="520" rx="160" ry="390" transform="rotate(-24 700 520)" />
      </svg>
      <div className={styles.words} aria-hidden="true">
        posters that stop the scroll · product creatives · logos · posters that stop the scroll · product creatives · logos ·
      </div>
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
            fit={phone ? 0.9 : 0.52}
            minRadius={phone ? 330 : 460}
            segments={phone ? 22 : 30}
            maxVerticalRotationDeg={3}
            dragDampening={0.8}
            autoRotateSpeed={2.4}
            imageBorderRadius="16px"
            openedImageBorderRadius="18px"
            openedImageWidth="min(380px, 78vw)"
            openedImageHeight="min(475px, 62svh)"
          />
        ) : (
          <p className={styles.empty}>Nothing in this category yet.</p>
        )}
      </div>
      <p className={styles.hint} aria-hidden="true">Drag to turn the globe · {phone ? "tap" : "click"} a poster to open it</p>
    </section>
  );
}
