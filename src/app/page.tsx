import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { ServiceTeasers } from "@/components/sections/ServiceTeasers";
import { Process } from "@/components/sections/Process";
import { Students } from "@/components/sections/Students";
import { AskKitto } from "@/components/sections/AskKitto";

// The homepage is a short overview: one teaser per service, all the same shape, each leading to its
// service page (which holds the full showcase), then how we work, students, and Kitto.
export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <ServiceTeasers />
      <Process />
      <Students />
      <AskKitto />
    </>
  );
}
