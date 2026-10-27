import type { Metadata } from "next";
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
        <p className="lead">Offer posters, product creatives, logos and campaign sets. Tap any poster to see it full size.</p>
      </section>
      <Posters heading={false} />
      <KittoCta title="Need posters that get noticed?" />
    </>
  );
}
