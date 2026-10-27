import type { ReactNode } from "react";
import { CONTACT } from "@/lib/content";
import styles from "./Faq.module.css";

export type FaqItem = { q: string; a: string };

/** Questions people ask, as open-and-close rows, with a way to ask something else. */
export function Faq({ items, title = "Questions people ask us.", aside }: { items: FaqItem[]; title?: string; aside?: ReactNode }) {
  if (!items.length) return null;
  return (
    <section className="container section" aria-labelledby="faq-title">
      <div className={styles.wrap}>
        <div>
          <p className="label">FAQ</p>
          <h2 id="faq-title" className="h2">{title}</h2>
          <p className="lead" style={{ marginTop: 16 }}>
            {aside ?? <>Something else? <a href={CONTACT.whatsapp} target="_blank" rel="noopener">Message us on WhatsApp</a> or ask Kitto.</>}
          </p>
        </div>
        <div className={styles.faq}>
          {items.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
