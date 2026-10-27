"use client";
import { Showcase, type ShowcaseItem } from "@/components/three/Showcase";
import { WEB_PROJECTS } from "@/lib/content";

const ITEMS: ShowcaseItem[] = WEB_PROJECTS.map((p) => ({
  slug: p.slug,
  title: p.title,
  rows: [
    ["Client", p.client],
    ["Type", p.type],
    ["Year", p.year],
    ["Built with", p.builtWith.join(", ")],
    ["Pages", p.pages != null ? String(p.pages) : null],
  ],
  facts: p.facts,
  bigNumber: p.bigNumber,
  bigLabel: p.bigNumberLabel,
  fallbackBig: p.year,
  href: p.liveUrl,
  images: [p.screenshot],
}));

export function WebShowcase() {
  return <Showcase kind="laptop" items={ITEMS} title="Websites we built" primaryLabel="Visit live site ↗" />;
}
