"use client";
import { useEffect, useRef } from "react";
import styles from "./Lightbox.module.css";

export type LightboxItem = { src: string; alt: string; caption?: React.ReactNode; video?: string | null };

/** Full-screen viewer with arrows; Esc closes, arrow keys step. */
export function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: LightboxItem[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const item = items[index];
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      prev?.focus();
    };
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % items.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length, onClose, onIndex]);

  if (!item) return null;
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Viewer" onClick={onClose}>
      <figure className={styles.figure} onClick={(e) => e.stopPropagation()}>
        {item.video ? (
          <video src={item.video} poster={item.src} controls autoPlay playsInline className={styles.media} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.src} alt={item.alt} className={styles.media} />
        )}
        {item.caption && <figcaption>{item.caption}</figcaption>}
      </figure>
      <button ref={closeRef} type="button" className={styles.close} onClick={onClose}>Close</button>
      {items.length > 1 && (
        <>
          <button type="button" className={`${styles.nav} ${styles.prev}`} aria-label="Previous" onClick={(e) => { e.stopPropagation(); onIndex((index - 1 + items.length) % items.length); }}>←</button>
          <button type="button" className={`${styles.nav} ${styles.next}`} aria-label="Next" onClick={(e) => { e.stopPropagation(); onIndex((index + 1) % items.length); }}>→</button>
        </>
      )}
    </div>
  );
}
