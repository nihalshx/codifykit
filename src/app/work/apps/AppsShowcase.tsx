"use client";
import { Showcase, type ShowcaseItem } from "@/components/three/Showcase";
import { APPS } from "@/lib/content";

const ITEMS: ShowcaseItem[] = APPS.map((a) => ({
  slug: a.slug,
  title: a.title,
  rows: [
    ["Client", a.client],
    ["Platforms", a.platforms.join(" + ")],
    ["Built with", a.builtWith.join(", ")],
    ["Year", a.year],
    ["Screens", String(a.screens.length)],
  ],
  facts: [a.platforms.join(" + ").toUpperCase(), a.builtWith.join(", ").toUpperCase(), `${a.screens.length} SCREENS`],
  bigNumber: null,
  bigLabel: null,
  fallbackBig: a.year,
  href: null,
  caseHref: `/work/${a.slug}/`,
  line: a.oneLine,
  images: a.screens,
}));

export function AppsShowcase() {
  return <Showcase kind="phone" items={ITEMS} title="Apps we built" section="Apps" primaryLabel="Open case study →" />;
}
