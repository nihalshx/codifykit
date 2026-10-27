import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { AppShowcase } from "@/components/sections/AppShowcase";
import { Websites } from "@/components/sections/Websites";
import { Posters } from "@/components/sections/Posters";
import { Process } from "@/components/sections/Process";
import { Services } from "@/components/sections/Services";
import { Students } from "@/components/sections/Students";
import { Tools } from "@/components/sections/Tools";
import { Story } from "@/components/sections/Story";
import { AskKitto } from "@/components/sections/AskKitto";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <AppShowcase />
      <Websites />
      <Posters />
      <Process />
      <Services />
      <Tools />
      <Students />
      <Story />
      <AskKitto />
    </>
  );
}
