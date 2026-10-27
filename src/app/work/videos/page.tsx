import type { Metadata } from "next";
import { VideoWheel } from "@/components/pages/VideoWheel";
import { KittoCta } from "@/components/ui/KittoCta";

export const metadata: Metadata = {
  title: "Reels and AI videos",
  description: "Organic reels and realistic AI videos made by Codifykit.",
};

export default function VideosPage() {
  return (
    <>
      <section className="container page-hero" style={{ paddingBottom: 32 }}>
        <p className="label">Videos</p>
        <h1 className="h-display">Reels and AI videos.</h1>
        <p className="lead">Drag or swipe to turn the wheel. Tap a card to watch.</p>
      </section>
      <VideoWheel />
      <KittoCta title="Need video that people actually watch?" />
    </>
  );
}
