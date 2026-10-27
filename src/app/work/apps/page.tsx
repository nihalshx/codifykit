import type { Metadata } from "next";
import Link from "next/link";
import { KittoCta } from "@/components/ui/KittoCta";
import { T } from "@/components/ui/T";
import { APPS } from "@/lib/content";
import styles from "./apps.module.css";

export const metadata: Metadata = {
  title: "App work",
  description: "Android and iOS apps by Codifykit, designed to be used, not just looked at.",
};

export default function AppsPage() {
  return (
    <div className={styles.page}>
      <section className="container page-hero">
        <p className={`label ${styles.label}`}>Apps</p>
        <h1 className="h-display">Apps people actually use.</h1>
        <p className={styles.lead}>Android and iOS apps, designed to be used, not just looked at. We mainly build in Flutter (one codebase for both), and work in other stacks when a project needs it.</p>
      </section>
      <section className="container">
        <ul className={styles.grid}>
          {APPS.map((a, i) => (
            <li key={a.slug}>
              <Link href={`/work/${a.slug}/`} className={styles.card}>
                <span className={styles.screen}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.screens[0]} alt="" loading={i < 5 ? "eager" : "lazy"} />
                </span>
                <span className={styles.title}><T>{a.title}</T></span>
                <span className={styles.meta}>{a.platforms.join(" + ")} · {a.builtWith.join(", ")}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <div className={styles.cta}><KittoCta title="Got an app idea?" /></div>
    </div>
  );
}
