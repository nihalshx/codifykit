import Link from "next/link";
import { T } from "@/components/ui/T";
import type { CaseStudy } from "@/lib/content";
import styles from "./WorkCard.module.css";

export function WorkCard({ item }: { item: CaseStudy }) {
  return (
    <Link href={`/work/${item.slug}/`} className={styles.card} data-kind={item.kind}>
      <span className={styles.media}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.images[0]} alt="" loading="lazy" />
      </span>
      <span className={styles.meta}>{item.kind} · {item.type}</span>
      <span className={styles.title}><T>{item.title}</T></span>
    </Link>
  );
}
