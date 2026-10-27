import type { Metadata } from "next";
import { ServiceLanding } from "@/components/landing/ServiceLanding";
import { Websites } from "@/components/sections/Websites";
import { SERVICE_PAGES, WEB_PROJECTS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Web development",
  description: "Business websites, landing pages, portfolios and online stores from Codifykit: built to load fast, read well on a phone and turn visitors into enquiries.",
};

export default function WebServicePage() {
  return (
    <ServiceLanding page={SERVICE_PAGES.web} strip={WEB_PROJECTS.map((p) => p.screenshot)}>
      <Websites />
    </ServiceLanding>
  );
}
