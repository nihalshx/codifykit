"use client";
import { Showcase, type ShowcaseItem } from "@/components/three/Showcase";
import { CAMPAIGNS } from "@/lib/content";

const BASE: ShowcaseItem[] = CAMPAIGNS.map((c) => ({
  slug: c.slug,
  title: c.title,
  rows: [
    ["Client", c.client],
    ["Type", c.type],
    ["Date", c.date],
    ["Format", c.format],
    ["Posters in set", String(c.posters.length)],
  ],
  facts: c.stats ? [] : c.facts,
  bigNumber: null,
  bigLabel: null,
  fallbackBig: c.date,
  href: c.instagramUrl,
  images: c.posters,
  format: c.format,
  account: c.clientAccount,
  caption: c.caption,
}));

export function PosterShowcase() {
  return <Showcase kind="phone" items={BASE} title="Posters & creatives" primaryLabel="View on Instagram ↗" />;
}
