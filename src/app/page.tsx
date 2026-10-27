import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { WhatWeDo } from "@/components/sections/WhatWeDo";
import { Posters } from "@/components/sections/Posters";
import { Process } from "@/components/sections/Process";
import { Students } from "@/components/sections/Students";
import { AskKitto } from "@/components/sections/AskKitto";

// Kept short on purpose: the app and web showcases live on /services/apps and /services/web,
// the story on /about and the tools on each service page.
export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <WhatWeDo />
      <Posters />
      <Process />
      <Students />
      <AskKitto />
    </>
  );
}
