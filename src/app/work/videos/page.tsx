import type { Metadata } from "next";
import { Moved } from "@/components/pages/Moved";

export const metadata: Metadata = { title: "Reels and AI videos", robots: { index: false } };

export default function OldVideosPage() {
  return <Moved to="/work/?filter=Videos" title="Reels and videos now live with the rest of our work." links={[{ href: "/work/?filter=Videos", label: "Watch the reels →" }]} />;
}
