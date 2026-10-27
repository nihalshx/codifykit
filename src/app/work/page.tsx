import type { Metadata } from "next";
import { WorkIndex } from "@/components/pages/WorkIndex";
import { KittoCta } from "@/components/ui/KittoCta";

export const metadata: Metadata = {
  title: "Our work",
  description: "Websites, Android and iOS apps, posters and videos built by Codifykit.",
};

export default function WorkPage() {
  return (
    <>
      <section className="container page-hero">
        <p className="label">Work</p>
        <h1 className="h-display">Our work</h1>
        <p className="lead">Websites, apps, posters and videos we&apos;ve built. Pick a kind to see all of it; websites and apps can also be seen in 3D.</p>
      </section>
      <section className="container">
        <WorkIndex />
      </section>
      <KittoCta title="Want something like this?" />
    </>
  );
}
