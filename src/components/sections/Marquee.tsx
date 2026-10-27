import { MARQUEE } from "@/lib/content";
import styles from "./Marquee.module.css";

export function Marquee() {
  const Row = ({ hidden }: { hidden?: boolean }) => (
    <ul className={styles.row} aria-hidden={hidden || undefined}>
      {MARQUEE.map((m) => (
        <li key={m}>{m}</li>
      ))}
    </ul>
  );
  return (
    <section className={styles.band} aria-label="What we do">
      <div className={styles.track}>
        <Row />
        <Row hidden />
      </div>
    </section>
  );
}
