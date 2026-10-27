import type { Metadata } from "next";
import { Moved } from "@/components/pages/Moved";

export const metadata: Metadata = { title: "Websites and apps", robots: { index: false } };

export default function OldWebAppPage() {
  return (
    <Moved
      to="/services/web/"
      title="Websites and apps now have their own pages."
      links={[{ href: "/services/web/", label: "Websites →" }, { href: "/services/apps/", label: "Android & iOS apps →" }]}
    />
  );
}
