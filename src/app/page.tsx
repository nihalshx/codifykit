import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { WhatWeDo } from "@/components/sections/WhatWeDo";
import { AppShowcase } from "@/components/sections/AppShowcase";
import { WebBrowser } from "@/components/sections/WebBrowser";
import { PosterDeck } from "@/components/sections/PosterDeck";
import { Process } from "@/components/sections/Process";
import { Students } from "@/components/sections/Students";
import { AskKitto } from "@/components/sections/AskKitto";

// What we do first (so people can jump to what they came for), then one interactive showcase per
// kind of work: apps (scroll), websites (a browser you scroll), posters (a deck you flip through).
export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <WhatWeDo />
      <AppShowcase />
      <WebBrowser />
      <PosterDeck />
      <Process />
      <Students />
      <AskKitto />
    </>
  );
}
