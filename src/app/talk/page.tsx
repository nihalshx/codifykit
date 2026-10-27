import type { Metadata } from "next";
import { KittoChat } from "@/components/chat/KittoChat";

export const metadata: Metadata = {
  title: "Talk to Kitto",
  description: "Chat with Kitto, Codifykit's AI helper, about your website, app, campaign or college project. Or reach the team on WhatsApp.",
};

export default function TalkPage() {
  return <KittoChat />;
}
