import type { Metadata } from "next";
import { ServiceLanding } from "@/components/landing/ServiceLanding";
import { AppShowcase } from "@/components/sections/AppShowcase";
import { APPS, SERVICE_PAGES } from "@/lib/content";

export const metadata: Metadata = {
  title: "Android & iOS apps",
  description: "Android and iOS apps from Codifykit, designed to be used: planned with you, built properly and looked after once they're live.",
};

export default function AppsServicePage() {
  return (
    <ServiceLanding page={SERVICE_PAGES.apps} strip={APPS.map((a) => a.screens[0])}>
      <AppShowcase />
    </ServiceLanding>
  );
}
