"use client";
import { useState } from "react";
import { CardWheel } from "@/components/wheel/CardWheel";
import { Lightbox } from "@/components/ui/Lightbox";
import { WHEEL_CARDS, type WheelCard } from "@/lib/content";

const VIDEO_CARDS = WHEEL_CARDS.filter((c) => c.type === "reel" || c.type === "ai-video");
// the wheel needs a full ring; repeat the set if there are fewer than 34
const RING: WheelCard[] = Array.from({ length: 34 }, (_, i) => VIDEO_CARDS[i % VIDEO_CARDS.length]);

export function VideoWheel() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{ padding: "0 16px", maxWidth: "calc(var(--max-w) + 32px)", margin: "0 auto" }}>
      <CardWheel
        cards={RING}
        intro={false}
        onCardOpen={(c) => setOpen(VIDEO_CARDS.indexOf(c))}
      />
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
