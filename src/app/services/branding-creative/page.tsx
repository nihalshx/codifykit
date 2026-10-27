import type { Metadata } from "next";
import { Moved } from "@/components/pages/Moved";

export const metadata: Metadata = { title: "Branding & content", robots: { index: false } };

export default function OldContentPage() {
  return (
    <Moved
      to="/services/branding-content/"
      title="Branding, social media and video now live on one page."
      links={[{ href: "/services/branding-content/", label: "Branding & content →" }]}
    />
  );
}
