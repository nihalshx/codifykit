import type { Metadata } from "next";
import Link from "next/link";
import { PosterDeck } from "@/components/sections/PosterDeck";
import { Posters } from "@/components/sections/Posters";
import { KittoCta } from "@/components/ui/KittoCta";
import { Brace } from "@/components/ui/Brace";

export const metadata: Metadata = {
  title: "Posters & creatives",
  description: "Posters, product creatives, logos and campaigns designed by Codifykit.",
};

export default function PostersPage() {
  return (
    <>
      <section className="container page-hero">
        <p className="label">Posters &amp; brand</p>
        <h1 className="h-display">
          Posters that <Brace>stop</Brace> the scroll.
        </h1>
        <p className="lead">Offer posters, product creatives, logos and campaign sets. Flip through the deck, or jump to the full grid.</p>
        <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
          <Link href="/contact/?need=Branding%20%26%20posters" className="btn btn--violet">Get posters made</Link>
          <a href="#all-posters" className="btn btn--ghost">See every poster ↓</a>
        </div>
      </section>
      <PosterDeck heading={false} />
      <Posters heading={false} />
      <KittoCta title="Need posters that get noticed?" />
    </>
  );
}
