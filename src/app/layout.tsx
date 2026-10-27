import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "@/styles/tokens.css";
import "@/styles/globals.css";
import { AudienceProvider } from "@/components/layout/Audience";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { KittoButton } from "@/components/layout/KittoButton";
import { CONTACT, SITE } from "@/lib/content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://codifykit.pages.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Codifykit — Websites, apps, ads and creative, from one team",
    template: "%s · Codifykit",
  },
  description: SITE.boilerplateShort,
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }], apple: "/apple-touch-icon.png" },
  openGraph: {
    type: "website",
    siteName: "Codifykit",
    title: "Codifykit — Websites, apps, ads and creative, from one team",
    description: SITE.boilerplateShort,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Codifykit" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#F4F4F2", width: "device-width", initialScale: 1 };

const orgLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Codifykit",
  url: SITE_URL,
  logo: `${SITE_URL}/brand/logo-black.svg`,
  email: CONTACT.email,
  telephone: CONTACT.phone,
  description: SITE.boilerplateShort,
  sameAs: [CONTACT.instagram, CONTACT.linkedin, CONTACT.youtube],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <AudienceProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <KittoButton />
        </AudienceProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      </body>
    </html>
  );
}
