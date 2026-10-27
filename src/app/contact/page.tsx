import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "./ContactForm";
import { Brace } from "@/components/ui/Brace";
import { CONTACT } from "@/lib/content";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Start a project",
  description: "Tell Codifykit about your website, app, ads, content or college project. Send it by email or WhatsApp and we'll come back with the next steps.",
};

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <section className={`container ${styles.grid}`}>
        <div className={styles.side}>
          <p className="label">Start a project</p>
          <h1 className={styles.title}>
            Tell us what you&apos;re <Brace>building</Brace>.
          </h1>
          <p className="lead">
            A few lines is enough. We&apos;ll come back to you with questions, the next steps and a rough price.
          </p>
          <ul className={styles.direct}>
            <li>
              <span>Email</span>
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </li>
            <li>
              <span>WhatsApp</span>
              <a href={CONTACT.whatsapp} target="_blank" rel="noopener">{CONTACT.phone}</a>
            </li>
            <li>
              <span>Not sure yet?</span>
              <Link href="/talk/">Talk it through with Kitto first ↗</Link>
            </li>
          </ul>
        </div>
        <ContactForm />
      </section>
    </div>
  );
}
