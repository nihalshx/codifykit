"use client";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Kitto } from "@/components/kitto/Kitto";
import { CONTACT, SERVICES, SITE } from "@/lib/content";
import styles from "./Footer.module.css";

export function Footer() {
  const [awake, setAwake] = useState(false);
  return (
    <footer className={styles.footer}>
      <div
        className={styles.kitto}
        onMouseEnter={() => setAwake(true)}
        onMouseLeave={() => setAwake(false)}
        aria-hidden="true"
      >
        <Kitto mood={awake ? "curious" : "sleepy"} size={84} blink={false} label="" />
      </div>
      <div className={`container ${styles.inner}`}>
        <p className={styles.tagline}>{SITE.tagline}</p>
        <div className={styles.cols}>
          <div>
            <h2 className={styles.colHead}>Contact</h2>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>{CONTACT.phone}</a>
            <a href={CONTACT.whatsapp} target="_blank" rel="noopener">WhatsApp ↗</a>
          </div>
          <div>
            <h2 className={styles.colHead}>Follow</h2>
            <a href={CONTACT.instagram} target="_blank" rel="noopener">Instagram ↗</a>
            <a href={CONTACT.linkedin} target="_blank" rel="noopener">LinkedIn ↗</a>
            <a href={CONTACT.youtube} target="_blank" rel="noopener">YouTube ↗</a>
          </div>
          <div>
            <h2 className={styles.colHead}>Services</h2>
            <Link href="/services/web/">Web development</Link>
            <Link href="/services/apps/">App development</Link>
            {SERVICES.filter((s) => s.slug !== "web-app-development").map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}/`}>{s.name}</Link>
            ))}
          </div>
          <div>
            <h2 className={styles.colHead}>Studio</h2>
            <Link href="/work/">Work</Link>
            <Link href="/students/">Students</Link>
            <Link href="/about/">About</Link>
            <Link href="/contact/">Start a project</Link>
            <Link href="/talk/">Talk to Kitto</Link>
          </div>
        </div>
        <div className={styles.bottom}>
          <Logo height={24} />
          <p>© {new Date().getFullYear()} Codifykit</p>
        </div>
      </div>
    </footer>
  );
}
