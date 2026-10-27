"use client";
import { useState } from "react";
import { T } from "@/components/ui/T";
import { Brace } from "@/components/ui/Brace";
import { PLATFORM_TECH, TOOLS } from "@/lib/content";
import styles from "./Tools.module.css";

const TABS = [
  { key: "apps", label: "Mobile apps", rows: PLATFORM_TECH.map((p) => ({ name: p.name, items: p.items })) },
  { key: "all", label: "Everything else", rows: TOOLS.map((g) => ({ name: g.name, items: g.items })) },
];

/** Tools & technologies, laid out like the reference: a ruled table of platforms and the tools we use. */
export function Tools() {
  const [tab, setTab] = useState(0);
  const t = TABS[tab];
  return (
    <section className="section" aria-labelledby="tools-title">
      <div className={`container ${styles.head}`}>
        <h2 id="tools-title" className={styles.title}>
          Tools &amp; technologies
          <br />
          we use for <Brace>{t.label.toLowerCase()}</Brace>
        </h2>
        <div className={styles.side}>
          <p className="muted">
            We mainly build apps in Flutter, so one codebase runs on Android and iOS. If your project needs another stack, we work in that too.
          </p>
          <div className={styles.tabs} role="tablist" aria-label="Tool groups">
            {TABS.map((x, i) => (
              <button key={x.key} type="button" role="tab" aria-selected={tab === i} className="chip" aria-pressed={tab === i} onClick={() => setTab(i)}>
                {x.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="container">
        <div className={styles.table} role="tabpanel">
          {t.rows.map((r) => (
            <div key={r.name} className={styles.row}>
              <h3>{r.name}</h3>
              <ul>
                {r.items.map((i) => (
                  <li key={i}><T>{i}</T></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
