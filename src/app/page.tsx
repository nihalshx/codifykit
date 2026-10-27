import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { WhatWeDo } from "@/components/sections/WhatWeDo";
import { AppShowcase } from "@/components/sections/AppShowcase";
import { StackedSites } from "@/components/sections/StackedSites";
import { PosterDome } from "@/components/sections/PosterDome";
import { Process } from "@/components/sections/Process";
import { Students } from "@/components/sections/Students";
import { AskKitto } from "@/components/sections/AskKitto";

// What we do first (so people can jump to what they came for), then one interactive showcase per
// kind of work: apps (scroll), websites (stacked cards that tip back as you scroll), posters (a dome you drag around).
export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <WhatWeDo />
      <AppShowcase />
      <StackedSites />
      <PosterDome />
      <Process />
      <Students />
      <AskKitto />
    </>
  );
}
