import Link from "next/link";
import { Kitto } from "@/components/kitto/Kitto";

export default function NotFound() {
  return (
    <section className="container page-hero" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 20 }}>
      <Kitto mood="sad" size={180} label="Kitto looking sad" />
      <h1 className="h1">This page wandered off.</h1>
      <p className="lead">The link might be old, or the page moved. Let&apos;s get you back.</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/" className="btn">Back to home</Link>
        <Link href="/talk/" className="btn btn--ghost">Ask Kitto</Link>
      </div>
    </section>
  );
}
