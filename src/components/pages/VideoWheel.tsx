"use client";
import { useState } from "react";
import { HeroReels } from "@/components/hero/HeroReels";
import { Lightbox } from "@/components/ui/Lightbox";
import { WHEEL_CARDS, type WheelCard } from "@/lib/content";

const VIDEO_CARDS = WHEEL_CARDS.filter((c) => c.type === "reel" || c.type === "ai-video");
// the ring has 16 slots; repeat the set if there are fewer reels than that
const RING: WheelCard[] = Array.from({ length: Math.max(16, VIDEO_CARDS.length) }, (_, i) => VIDEO_CARDS[i % VIDEO_CARDS.length]);

export function VideoWheel() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{ padding: "0 16px", maxWidth: "calc(var(--max-w) + 32px)", margin: "0 auto" }}>
      <div style={{ position: "relative", height: "min(76svh, 720px)", minHeight: 460 }}>
        <HeroReels cards={RING} intro={false} box onCardOpen={(c) => setOpen(VIDEO_CARDS.indexOf(c))} />
      </div>
      {open !== null && (
        <Lightbox
          items={VIDEO_CARDS.map((c) => ({ src: c.cover, alt: c.label, video: c.video, caption: c.type === "ai-video" ? "AI video by Codifykit" : c.label.startsWith("[") ? "Reel (placeholder)" : c.label }))}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}
