import Link from "next/link";
import { SERVICES, serviceHref } from "@/lib/content";
import styles from "./ServiceSwitch.module.css";

/** Every service as one compact row of links, the current one marked: a quick way sideways. */
export function ServiceSwitch({ current, title = "Other services" }: { current?: string; title?: string }) {
  return (
    <section className="container section" aria-labelledby="switch-title">
      <div className={styles.head}>
        <p id="switch-title" className="label">{title}</p>
        <Link href="/services/" className={styles.all}>All services →</Link>
      </div>
      <ul className={styles.list}>
        {SERVICES.map((s) => (
          <li key={s.slug}>
            <Link href={serviceHref(s)} className={styles.item} aria-current={s.slug === current ? "page" : undefined}>
              <span className={styles.n}>{s.n}</span>
              <strong>{s.name}</strong>
              <span className={styles.short}>{s.short}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
