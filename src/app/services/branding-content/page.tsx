import type { Metadata } from "next";
import { ServiceLanding } from "@/components/landing/ServiceLanding";
import { PosterFeed } from "@/components/sections/PosterFeed";
import { CAMPAIGNS, SERVICE_PAGES } from "@/lib/content";

export const metadata: Metadata = {
  title: "Branding & content",
  description: "Logos, posters, social media and video from Codifykit, planned together so every post, reel and ad looks like the same brand.",
};

export default function ContentServicePage() {
  return (
    <ServiceLanding page={SERVICE_PAGES.content} strip={CAMPAIGNS.flatMap((c) => c.posters)}>
      <PosterFeed />
    </ServiceLanding>
  );
}
