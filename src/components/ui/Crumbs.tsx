import Link from "next/link";
import styles from "./Crumbs.module.css";

/** "Home / Services / Websites": where this page sits, and a quick way back up. */
export function Crumbs({ trail }: { trail: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className={styles.crumbs}>
      <ol>
        <li><Link href="/">Home</Link></li>
        {trail.map((t) => (
          <li key={t.label}>
            {t.href ? <Link href={t.href}>{t.label}</Link> : <span aria-current="page">{t.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
