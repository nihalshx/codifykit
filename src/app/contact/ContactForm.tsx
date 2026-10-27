"use client";
/**
 * Project enquiry. The site is static, so the form doesn't post anywhere: it writes the message for you
 * and opens WhatsApp or your email app with it filled in. Nothing is stored.
 */
import { useEffect, useState, type FormEvent } from "react";
import { CONTACT } from "@/lib/content";
import styles from "./contact.module.css";

const NEEDS = ["Website", "Android / iOS app", "Custom CRM or ERP", "Social media & content", "Video", "Ads & marketing", "Branding & posters", "College project", "Something else"];
const BUDGETS = ["Not sure yet", "Under ₹25,000", "₹25,000 – ₹1 lakh", "₹1 – 3 lakh", "Over ₹3 lakh"];

export function ContactForm() {
  const [needs, setNeeds] = useState<string[]>([]);
  const [error, setError] = useState("");

  // /contact/?need=Website preselects a chip (links from the service pages)
  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get("need");
    if (n && NEEDS.includes(n)) setNeeds([n]);
  }, []);

  const toggle = (n: string) => setNeeds((v) => (v.includes(n) ? v.filter((x) => x !== n) : [...v, n]));

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const via = ((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value ?? "whatsapp";
    const d = new FormData(form);
    const name = String(d.get("name") ?? "").trim();
    const reach = String(d.get("reach") ?? "").trim();
    const about = String(d.get("about") ?? "").trim();
    if (!name || !about) {
      setError("Add your name and a line about the project.");
      return;
    }
    setError("");
    const text = [
      `Hi Codifykit, I'm ${name}.`,
      needs.length ? `I need: ${needs.join(", ")}.` : "",
      `Budget: ${d.get("budget")}.`,
      "",
      about,
      reach ? `\nYou can reach me at ${reach}.` : "",
    ].filter((l, i) => l || i === 3).join("\n");
    const url =
      via === "email"
        ? `mailto:${CONTACT.email}?subject=${encodeURIComponent(`New project: ${needs[0] ?? "enquiry"} (${name})`)}&body=${encodeURIComponent(text)}`
        : `${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
    if (via === "email") window.location.href = url;
    else window.open(url, "_blank", "noopener");
  };

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <fieldset className={styles.needs}>
        <legend>What do you need?</legend>
        <div>
          {NEEDS.map((n) => (
            <button key={n} type="button" className="chip" aria-pressed={needs.includes(n)} onClick={() => toggle(n)}>
              {n}
            </button>
          ))}
        </div>
      </fieldset>
      <div className={styles.row}>
        <label>
          <span>Your name</span>
          <input name="name" autoComplete="name" required />
        </label>
        <label>
          <span>Email or phone <em>(optional)</em></span>
          <input name="reach" autoComplete="email" />
        </label>
      </div>
      <label>
        <span>Budget</span>
        <select name="budget" defaultValue={BUDGETS[0]}>
          {BUDGETS.map((b) => <option key={b}>{b}</option>)}
        </select>
      </label>
      <label>
        <span>About the project</span>
        <textarea name="about" rows={5} required placeholder="What is it, who is it for, and when do you need it?" />
      </label>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.send}>
        <button type="submit" value="whatsapp" className="btn btn--violet">Send on WhatsApp</button>
        <button type="submit" value="email" className="btn btn--ghost">Send by email</button>
      </div>
      <p className={styles.note}>This opens WhatsApp or your email app with your message written out. Nothing is sent until you press send there.</p>
    </form>
  );
}
