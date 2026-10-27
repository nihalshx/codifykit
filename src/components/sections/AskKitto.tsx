"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Kitto, type Mood } from "@/components/kitto/Kitto";
import { CONTACT } from "@/lib/content";
import { KITTO_CHIPS, KITTO_GREETING, stashDraft } from "@/components/chat/kitto";
import styles from "./AskKitto.module.css";

export function AskKitto() {
  const router = useRouter();
  const ref = useRef<HTMLElement>(null);
  const [text, setText] = useState("");
  const [wave, setWave] = useState(0);
  const [mood, setMood] = useState<Mood>("curious");
  const idle = useRef<ReturnType<typeof setTimeout>>(undefined);

  // wave when the section scrolls in
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setWave((w) => w + 1), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // face follows the input
  useEffect(() => {
    clearTimeout(idle.current);
    if (text) setMood("focused");
    else setMood("curious");
    idle.current = setTimeout(() => setMood(text ? "thinking" : "sleepy"), 30000);
    return () => clearTimeout(idle.current);
  }, [text]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = text.trim();
    if (!msg) return;
    setMood("excited");
    stashDraft(msg);
    router.push("/talk/");
  };

  return (
    <section id="ask" ref={ref} className="section" aria-labelledby="ask-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.kittoCol}>
          <div className={styles.blob} aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/kitto/kitto-wordmark.webp" alt="" className={styles.wordmark} width={867} height={293} />
          <Kitto mood={mood} size={220} wave={wave} className={styles.kitto} />
        </div>
        <div className={styles.chat}>
          <p className="label">Ask Kitto</p>
          <h2 id="ask-title" className="h2">What are you working on?</h2>
          <p className="lead">
            Tell Kitto about your website, app, campaign or college project. Kitto helps you shape the idea, then passes it to our team.
          </p>
          <div className={styles.bubble}>
            <span className={styles.who}>Kitto</span>
            {KITTO_GREETING}
          </div>
          <form className={styles.form} onSubmit={submit}>
            <label htmlFor="ask-input" className="sr-only">What do you want to make?</label>
            <input
              id="ask-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What do you want to make?"
              maxLength={1000}
              autoComplete="off"
            />
            <button type="submit" aria-label="Send to Kitto" disabled={!text.trim()}>→</button>
          </form>
          <div className={styles.chips}>
            {KITTO_CHIPS.map((c) => (
              <button key={c.label} type="button" className="chip" onClick={() => setText(c.prompt)}>
                {c.label}
              </button>
            ))}
          </div>
          <div className={styles.links}>
            <a href="/talk/" className="link-arrow">Open full chat with Kitto ↗</a>
            <a href={CONTACT.whatsapp} target="_blank" rel="noopener" className="link-arrow">Talk to the team on WhatsApp ↗</a>
          </div>
          <p className={styles.note}>Kitto is an AI and can make mistakes.</p>
        </div>
      </div>
    </section>
  );
}
