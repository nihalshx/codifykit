import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/outfit";
import "./globals.css";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Digital growth & creative studio`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: [
    "web development",
    "social media management",
    "digital marketing",
    "branding",
    "creative studio",
    "Codifykit",
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#04040f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="overflow-x-clip antialiased">
      <body className="min-h-full overflow-x-clip">{children}</body>
    </html>
  );
}
