import type { Metadata } from "next";
import Link from "next/link";
import { KittoCta } from "@/components/ui/KittoCta";
import { Reveal } from "@/components/ui/Reveal";
import { Faq } from "@/components/ui/Faq";
import styles from "./students.module.css";

export const metadata: Metadata = {
  title: "Student project help",
  description: "Stuck on your mini or main college project? Codifykit started by guiding students, and we still do: from picking the idea to the final demo.",
};

const OFFER = [
  { t: "Mini projects", d: "Pick an idea that fits your course, plan the scope, and build it step by step with someone who has done it before." },
  { t: "Main projects", d: "From the abstract and the design to building, testing and fixing, we guide you through the whole thing so you understand every part." },
  { t: "Portfolio sites", d: "A clean personal website that shows your projects and skills, ready to share with colleges and recruiters." },
];

const HOW = [
  { t: "Tell us about it", d: "Share your course, your deadline and any idea you already have. Kitto or the team will ask a few short questions." },
  { t: "Pick the idea together", d: "We help you choose a project that's realistic for your time and fits what your college expects." },
  { t: "Build it with guidance", d: "We guide you through planning, building and fixing it, and explain how each part works." },
  { t: "Present it with confidence", d: "We help you prepare the demo and walk through the questions you're likely to get." },
];

const FAQ = [
  { q: "Will you just do the project for me?", a: "No. We guide you through it and help you build it, so you understand your own project and can explain it in your viva or demo." },
  { q: "Which courses do you help with?", a: "We started with MCA projects, and we help with most computer science and IT courses. Tell us your course and we'll say honestly if we're the right fit." },
  { q: "How much does it cost, and how long does it take?", a: "It depends on the project and your deadline. Tell us about it and the team will share the details before anything starts." },
  { q: "Can you help if my deadline is close?", a: "Message us as early as you can on WhatsApp. We'll tell you straight away what's realistic." },
  { q: "I don't have an idea yet. Is that okay?", a: "Yes, that's where most students start. Picking the right idea is the first thing we help with." },
];

export default function StudentsPage() {
  return (
    <>
      <section className={`container page-hero ${styles.hero}`}>
        <div>
          <p className="label">Students</p>
          <h1 className="h-display">Stuck on your college project?</h1>
          <p className="lead">
            Codifykit started in an MCA classroom, helping classmates and juniors get their projects done right. We still do: from picking the idea to the final demo.
          </p>
          <div className={styles.ctas}>
            <Link href="/contact/?need=College%20project" className="btn btn--violet">Get project help</Link>
            <a href="#how" className="btn btn--ghost">How it works</a>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/students-desk.webp" alt="A student's desk at night with a laptop showing code and a notebook with a project sketch." width={1672} height={941} className={styles.img} />
      </section>

      <section className="container section">
        <p className="label">What we help with</p>
        <div className={styles.offer}>
          {OFFER.map((o, i) => (
            <Reveal key={o.t} delay={i * 80} className={styles.offerCard}>
              <span className={styles.n}>{String(i + 1).padStart(2, "0")}</span>
              <h2 className="h3">{o.t}</h2>
              <p className="muted">{o.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="how" className="container section">
        <div className="grid-2">
          <div>
            <p className="label">How it works</p>
            <h2 className="h2">From the first idea to the final demo.</h2>
          </div>
          <ol className={styles.how}>
            {HOW.map((h, i) => (
              <li key={h.t}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="h3">{h.t}</h3>
                  <p className="muted">{h.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Faq items={FAQ} title="Questions students ask us." />

      <KittoCta title="Tell Kitto about your project." line="Share your course, your deadline and your idea (or that you don't have one yet). Kitto will help you think it through and pass it to the team." />
    </>
  );
}
