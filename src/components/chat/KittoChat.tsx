"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Kitto, type Mood } from "@/components/kitto/Kitto";
import { Logo } from "@/components/ui/Logo";
import { CONTACT } from "@/lib/content";
import { KITTO_CHIPS, KITTO_GREETING, takeDraft } from "./kitto";
import styles from "./KittoChat.module.css";

type Msg = { role: "user" | "assistant"; content: string; error?: boolean };

const STATUS: Partial<Record<Mood, string>> = {
  curious: "Kitto is listening",
  focused: "Kitto is reading along",
  thinking: "Kitto is thinking…",
  happy: "Kitto replied",
  sad: "Kitto can't reach the server",
  sleepy: "Kitto is napping. Say hi!",
  excited: "Brief ready for the team",
};

export function KittoChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [mood, setMood] = useState<Mood>("curious");
  const [look, setLook] = useState<Mood | null>(null);
  const [hop, setHop] = useState(0);
  const [briefOpen, setBriefOpen] = useState(false);
  const [brief, setBrief] = useState<string | null>(null);
  const [briefBusy, setBriefBusy] = useState(false);
  const [briefErr, setBriefErr] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const idle = useRef<ReturnType<typeof setTimeout>>(undefined);

  const poke = useCallback(() => {
    clearTimeout(idle.current);
    idle.current = setTimeout(() => setMood("sleepy"), 30000);
  }, []);
  useEffect(() => {
    poke();
    return () => clearTimeout(idle.current);
  }, [poke]);

  // eyes follow the pointer while Kitto is just listening
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const on = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth;
      setLook(x < 0.3 ? "look_left" : x > 0.7 ? "look_right" : null);
      clearTimeout(t);
      t = setTimeout(() => setLook(null), 1200);
    };
    window.addEventListener("pointermove", on);
    return () => {
      window.removeEventListener("pointermove", on);
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = useCallback(
    async (raw: string) => {
      const content = raw.trim().slice(0, 1000);
      if (!content || busy) return;
      poke();
      const history: Msg[] = [...messages.filter((m) => !m.error), { role: "user", content }];
      setMessages([...history, { role: "assistant", content: "" }]);
      setText("");
      setBusy(true);
      setMood("thinking");
      try {
        const res = await fetch("/api/kitto/", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
        });
        if (!res.ok || !res.body) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || "Kitto can't reach the team's server right now.");
        }
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let reply = "";
        let first = true;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          reply += dec.decode(value, { stream: true });
          if (first && reply) {
            first = false;
            setMood("happy");
            setHop((h) => h + 1);
          }
          setMessages([...history, { role: "assistant", content: reply }]);
        }
        if (!reply.trim()) throw new Error("Kitto lost the thread.");
        setMood("happy");
      } catch (e) {
        setMood("sad");
        setMessages([
          ...history,
          { role: "assistant", error: true, content: `${(e as Error).message} You can always reach the team on WhatsApp.` },
        ]);
      } finally {
        setBusy(false);
        poke();
      }
    },
    [busy, messages, poke]
  );

  // a message carried over from the homepage
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const d = takeDraft();
    if (d) send(d);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const makeBrief = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBriefBusy(true);
    setBriefErr(null);
    try {
      const res = await fetch("/api/kitto/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode: "brief",
          name: f.get("name"),
          contact: f.get("contact"),
          messages: messages.filter((m) => !m.error).map(({ role, content }) => ({ role, content })),
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Couldn't make the brief.");
      setBrief(j.brief);
      setMood("excited");
    } catch (err) {
      setBriefErr((err as Error).message);
      setMood("sad");
    } finally {
      setBriefBusy(false);
    }
  };

  const shownMood: Mood = mood === "curious" && look ? look : mood;
  const userTurns = messages.filter((m) => m.role === "user").length;
  const waText = brief ? encodeURIComponent(`Hi Codifykit! Here's my brief from Kitto:\n\n${brief}`) : "";

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <Link href="/" aria-label="Codifykit home"><Logo height={24} /></Link>
        <span className={styles.topTitle}>Talk to Kitto</span>
        <Link href="/" className={styles.back}>Back to the site ↗</Link>
      </header>

      <div className={styles.cols}>
        <aside className={styles.kittoCol}>
          <div className={styles.blob} aria-hidden="true" />
          <Kitto mood={shownMood} size={260} hop={hop} className={styles.kitto} />
          <p className={styles.status} role="status">
            <span data-mood={mood} />
            {STATUS[mood] ?? "Kitto is here"}
          </p>
        </aside>

        <section className={styles.chat} aria-labelledby="talk-title">
          <h1 id="talk-title" className="h2">What are you working on?</h1>
          <div ref={listRef} className={styles.list} aria-live="polite">
            <div className={styles.bot}>
              <span className={styles.who}>Kitto</span>
              {KITTO_GREETING}
            </div>
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? styles.user : `${styles.bot} ${m.error ? styles.err : ""}`}>
                {m.role === "assistant" && <span className={styles.who}>Kitto</span>}
                {m.content || <span className={styles.dots} aria-label="Kitto is typing"><i /><i /><i /></span>}
                {m.error && (
                  <a href={CONTACT.whatsapp} target="_blank" rel="noopener" className={styles.errLink}>WhatsApp the team ↗</a>
                )}
              </div>
            ))}
          </div>
          {userTurns === 0 && (
            <div className={styles.chips}>
              {KITTO_CHIPS.map((c) => (
                <button key={c.label} type="button" className="chip" onClick={() => send(c.prompt)}>{c.label}</button>
              ))}
            </div>
          )}
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              send(text);
            }}
          >
            <label htmlFor="talk-input" className="sr-only">Message Kitto</label>
            <textarea
              id="talk-input"
              ref={inputRef}
              rows={1}
              value={text}
              maxLength={1000}
              placeholder="What do you want to make?"
              onChange={(e) => {
                setText(e.target.value);
                poke();
                if (!busy) setMood(e.target.value ? "focused" : "curious");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(text);
                }
              }}
            />
            <button type="submit" disabled={busy || !text.trim()} aria-label="Send">→</button>
          </form>
          <p className={styles.note}>Kitto is an AI and can make mistakes. Prices and timelines always come from the team.</p>
        </section>

        <aside className={styles.side}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Kitto can help with</h2>
            <ul>
              <li>Working out what you actually need</li>
              <li>Picking the right service</li>
              <li>Shaping a college project idea</li>
              <li>Writing a short brief for the team</li>
            </ul>
          </div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Send this chat to the team</h2>
            {!briefOpen && !brief && (
              <>
                <p className="muted">Kitto writes a short summary and you send it to us on WhatsApp or email.</p>
                <button type="button" className="btn btn--sm" disabled={!userTurns} onClick={() => setBriefOpen(true)}>
                  Make a brief
                </button>
              </>
            )}
            {briefOpen && !brief && (
              <form onSubmit={makeBrief} className={styles.briefForm}>
                <label>Your name<input name="name" required maxLength={120} autoComplete="name" /></label>
                <label>Phone or email<input name="contact" required maxLength={160} autoComplete="email" /></label>
                <button type="submit" className="btn btn--sm" disabled={briefBusy}>{briefBusy ? "Writing…" : "Write the brief"}</button>
                {briefErr && <p className={styles.errText}>{briefErr}</p>}
              </form>
            )}
            {brief && (
              <div className={styles.brief}>
                <pre>{brief}</pre>
                <a className="btn btn--sm" href={`https://wa.me/${CONTACT.whatsapp.split("/").pop()}?text=${waText}`} target="_blank" rel="noopener">Send on WhatsApp ↗</a>
                <a className="btn btn--sm btn--ghost" href={`mailto:${CONTACT.email}?subject=${encodeURIComponent("Project brief from Kitto")}&body=${encodeURIComponent(brief)}`}>Send by email</a>
              </div>
            )}
          </div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Talk to a human</h2>
            <a href={CONTACT.whatsapp} target="_blank" rel="noopener">WhatsApp {CONTACT.phone} ↗</a>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          </div>
        </aside>
      </div>
    </div>
  );
}
