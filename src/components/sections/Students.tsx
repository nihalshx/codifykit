import { Brace } from "@/components/ui/Brace";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./Students.module.css";

export function Students() {
  return (
    <section id="students" className="section" aria-labelledby="students-title">
      <div className="container">
        <Reveal className={styles.card}>
          <div className={styles.copy}>
            <p className="label">Students</p>
            <h2 id="students-title" className="h2">Stuck on your <Brace>college</Brace> project?</h2>
            <p className="lead">
              We started by helping students with their mini and main projects. We still do: from picking the idea to the final demo.
            </p>
            <div className={styles.ctas}>
              <Link href="/students/" className="btn">Get project help</Link>
              <Link href="/students/#how" className="btn btn--ghost">How it works</Link>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/students-desk.webp" alt="A student's desk at night: laptop with code, notebook with a project sketch, and a cup of tea." className={styles.img} loading="lazy" width={1672} height={941} />
        </Reveal>
      </div>
    </section>
  );
}
