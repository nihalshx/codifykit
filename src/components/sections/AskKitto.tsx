"use client";
import { Brace } from "@/components/ui/Brace";
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
      <div className="container">
        <div className={styles.panel}>
          <svg className={styles.orbits} viewBox="0 0 1200 600" preserveAspectRatio="none" aria-hidden="true">
            <ellipse cx="240" cy="520" rx="380" ry="170" />
            <ellipse cx="980" cy="120" rx="300" ry="130" />
          </svg>

          <div className={styles.intro}>
            <h2 id="ask-title" className={styles.title}>What are you <Brace>working</Brace> on?</h2>
            <p className={styles.lead}>Tell Kitto, our AI helper, about your website, app, campaign or college project. Kitto helps you shape the idea, then passes it to our team.</p>
            <div className={styles.kittoStage}>
              <div className={styles.blob} aria-hidden="true" />
              <Kitto mood={mood} size={200} wave={wave} className={styles.kitto} />
            </div>
          </div>

          {/* a chat window that starts the real conversation on /talk */}
          <div className={styles.window}>
            <div className={styles.winHead}>
              <span className={styles.avatar} aria-hidden="true" />
              <div>
                <strong>Kitto</strong>
                <span className={styles.online}><i />{text ? "Kitto is reading along" : "Online"}</span>
              </div>
            </div>
            <div className={styles.msgs}>
              <div className={styles.row}>
                <span className={styles.avatarSm} aria-hidden="true" />
                <p className={styles.bubble}>{KITTO_GREETING}</p>
              </div>
              {text.trim() && <p className={styles.mine}>{text}</p>}
              {!text.trim() && (
                <div className={styles.chips} aria-label="Suggestions">
                  {KITTO_CHIPS.map((c) => (
                    <button key={c.label} type="button" className={styles.chip} onClick={() => setText(c.prompt)}>
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
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
              <button type="submit" aria-label="Send to Kitto" disabled={!text.trim()}>
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </form>
            <div className={styles.foot}>
              <span>Kitto is an AI and can make mistakes.</span>
              <a href={CONTACT.whatsapp} target="_blank" rel="noopener">Talk to a human ↗</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
