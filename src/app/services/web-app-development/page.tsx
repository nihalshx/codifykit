import type { Metadata } from "next";
import Link from "next/link";

// The old combined "Web & App Development" page now lives on two pages. The site is static, so this
// old address forwards with a meta refresh and keeps both links for anyone who lands on it.
export const metadata: Metadata = {
  title: "Websites and apps",
  robots: { index: false },
};

export default function OldWebAppPage() {
  return (
    <section className="container page-hero">
      <meta httpEquiv="refresh" content="0; url=/services/web/" />
      <h1 className="h1">Websites and apps now have their own pages.</h1>
      <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
        <Link href="/services/web/" className="btn btn--violet">Websites →</Link>
        <Link href="/services/apps/" className="btn btn--ghost">Android &amp; iOS apps →</Link>
      </div>
    </section>
  );
}
