import type { Metadata } from "next";
import { Moved } from "@/components/pages/Moved";

export const metadata: Metadata = { title: "Posters & creatives", robots: { index: false } };

export default function OldPostersPage() {
  return <Moved to="/work/?filter=Posters" title="Posters now live with the rest of our work." links={[{ href: "/work/?filter=Posters", label: "See the posters →" }]} />;
}
