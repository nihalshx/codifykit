import { PROCESS } from "@/lib/content";
import styles from "./Steps.module.css";

/** The five steps of how we work, as one compact row (the big animated version lives on the homepage). */
export function Steps({ title = "How it works." }: { title?: string }) {
  return (
    <section className="container section" aria-labelledby="steps-title">
      <p className="label">How we work</p>
      <h2 id="steps-title" className="h2">{title}</h2>
      <ol className={styles.steps}>
        {PROCESS.map((p) => (
          <li key={p.n}>
            <span className={styles.n}>{p.n}</span>
            <h3>{p.name}</h3>
            <p>{p.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
