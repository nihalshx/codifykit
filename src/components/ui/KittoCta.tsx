import Link from "next/link";
import { Kitto } from "@/components/kitto/Kitto";
import { CONTACT } from "@/lib/content";
import styles from "./KittoCta.module.css";

/** "Ask Kitto" call to action used at the bottom of inner pages. */
export function KittoCta({ title = "Not sure where to start?", line = "Tell Kitto what you're working on. Kitto helps you shape the idea, then passes it to our team." }: { title?: string; line?: string }) {
  return (
    <section className="section">
      <div className="container">
        <div className={styles.card}>
          <div className={styles.cat} aria-hidden="true">
            <Kitto mood="curious" size={120} label="" />
          </div>
          <div className={styles.copy}>
            <p className="label">Ask Kitto</p>
            <h2 className="h2">{title}</h2>
            <p className="lead">{line}</p>
            <div className={styles.btns}>
              <Link href="/talk/" className="btn">Chat with Kitto</Link>
              <a href={CONTACT.whatsapp} target="_blank" rel="noopener" className="btn btn--ghost">WhatsApp the team ↗</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
