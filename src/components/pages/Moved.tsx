import Link from "next/link";

/** An old address that now lives elsewhere: forwards straight away (the site is static, so a meta refresh), and keeps a link for anyone who stays. */
export function Moved({ to, title, links }: { to: string; title: string; links: { href: string; label: string }[] }) {
  return (
    <section className="container page-hero">
      <meta httpEquiv="refresh" content={`0; url=${to}`} />
      <h1 className="h1">{title}</h1>
      <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
        {links.map((l, i) => (
          <Link key={l.href} href={l.href} className={`btn ${i ? "btn--ghost" : "btn--violet"}`}>{l.label}</Link>
        ))}
      </div>
    </section>
  );
}
