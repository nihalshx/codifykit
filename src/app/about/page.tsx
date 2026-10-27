import type { Metadata } from "next";
import Link from "next/link";
import { KittoCta } from "@/components/ui/KittoCta";
import { Icon } from "@/components/ui/Logo";
import { SERVICES } from "@/lib/content";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About",
  description: "Codifykit started in an MCA classroom and grew into a digital growth and creative studio: one team for the tech, the creative and the marketing.",
};

const TEAM = [
  { name: "Nihal N", role: "Founder & CEO" },
  { name: "Hanna", role: "CEO" },
];

export default function AboutPage() {
  return (
    <>
      <section className="container page-hero">
        <p className="label">About</p>
        <h1 className="h-display">Codifykit started in an MCA classroom.</h1>
      </section>

      <section className="container section">
        <div className={styles.story}>
          <div className={styles.pill} aria-hidden="true">
            <Icon size={80} />
            <span>Team photo coming soon</span>
          </div>
          <div className={styles.copy}>
            <p>Nihal built it as a student, with Hanna by his side, to help classmates and juniors get their college projects done right. We guided students through their mini and main projects, from the first idea to the final demo.</p>
            <p>The more we built, the more people asked. Businesses wanted websites. Founders wanted apps. Brands wanted ads and content that actually looked good. So we brought our team together and turned Codifykit into a digital growth and creative studio.</p>
            <p>We still work the way we did back then: sit with the problem, understand what you actually need, and build it properly.</p>
            <p className={styles.big}>We&apos;re not trying to be the biggest agency out there. We&apos;re trying to be the team you call when you want it built properly, by people who care how it turns out.</p>
          </div>
        </div>
      </section>

      <section className="container section">
        <p className="label">What we do today</p>
        <ul className={styles.services}>
          {SERVICES.map((s) => (
            <li key={s.slug}>
              <Link href={`/services/${s.slug}/`}>
                <strong>{s.name}</strong>
                <span>{s.short}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={`container section ${styles.teamSection}`}>
        <div>
          <p className="label">Team</p>
          <h2 className="h2">The people behind it.</h2>
          <p className="lead" style={{ marginTop: 16 }}>A small team that started with student projects and still sits with every client the same way.</p>
        </div>
        <div className={styles.team}>
          {TEAM.map((t) => (
            <figure key={t.name} className={styles.person}>
              <div className={styles.photo} aria-hidden="true"><Icon size={48} /></div>
              <figcaption>
                <strong>{t.name}</strong>
                <span>{t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <KittoCta title="Want to work with us?" line="Tell us what you're working on. We'll sit with it, then tell you honestly how we'd build it." />
    </>
  );
}
