import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { WhatWeDo } from "@/components/sections/WhatWeDo";
import { AppShowcase } from "@/components/sections/AppShowcase";
import { StackedSites } from "@/components/sections/StackedSites";
import { PosterPhone } from "@/components/sections/PosterPhone";
import { Process } from "@/components/sections/Process";
import { Students } from "@/components/sections/Students";
import { AskKitto } from "@/components/sections/AskKitto";

// What we do first (so people can jump to what they came for), then one interactive showcase per
// kind of work: apps (scroll), websites (stacked cards that tip back as you scroll), posters (an Instagram profile on a 3D phone that opens into reels).
export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <WhatWeDo />
      <AppShowcase />
      <StackedSites />
      <PosterPhone />
      <Process />
      <Students />
      <AskKitto />
    </>
  );
}
