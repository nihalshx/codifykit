import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { Story } from "@/components/story";
import { Services } from "@/components/services";
import { Audience } from "@/components/audience";
import { Process } from "@/components/process";
import { Manifesto } from "@/components/manifesto";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Story />
        <Services />
        <Audience />
        <Process />
        <Manifesto />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
