import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans, Space_Mono, Barlow } from "next/font/google";
import { DeferredWidgets } from "@/components/layout/DeferredWidgets";
import { Footer } from "@/components/layout/Footer";
import { MobileDock } from "@/components/layout/MobileDock";
import { Navbar } from "@/components/layout/Navbar";
import { SoundEffects } from "@/components/ui/SoundEffects";
import { siteConfig } from "@/config/site";
import Script from "next/script";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.title, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

// schema.org Person — helps search + rich results associate the site with John. Values come from
// config/site.ts so this can never contradict the visible page.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteConfig.name,
  jobTitle: siteConfig.role,
  url: siteConfig.url,
  email: `mailto:${siteConfig.email}`,
  sameAs: [siteConfig.social.github, siteConfig.social.linkedin],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${dmSans.variable} ${spaceMono.variable} ${barlow.variable} font-sans antialiased`}
      >
        {/* Reveal animations start hidden and are un-hidden by JS. Without JS (locked-down
            networks, non-JS crawlers), force that content visible so the page isn't blank.

            Two mechanisms depend on this now: `[style*="opacity:0"]` covers the framer-motion
            elements that remain (Hero, ProjectCarousel/ImageLightbox's AnimatePresence, the lazily
            loaded ChatWidget/ScrollToTop) — their `initial` prop renders as an inline style, which
            only their own animate() call (JS) ever clears. `[data-reveal="hidden"]` and
            `[data-reveal-group="hidden"] > *` cover the CSS-only reveal that replaced
            `whileInView` in About/Skills/Experience/Contact/Projects/LiveDemo (see globals.css and
            hooks/useReveal.ts) — that attribute is only ever flipped to "visible" by the
            IntersectionObserver in useReveal, which likewise never runs without JS.

            dangerouslySetInnerHTML is REQUIRED, not a shortcut. As a JSX text child React escapes
            the quotes to &quot;, and <style> is a raw-text element — the HTML parser does NOT decode
            entities inside it. The browser therefore received the literal selector
            [style*=&quot;opacity:0&quot;], which is invalid, so the rule was dropped and the
            fallback silently did nothing at all. */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<style>[style*="opacity:0"],[data-reveal="hidden"],[data-reveal-group="hidden"]>*{opacity:1!important;transform:none!important}</style>`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <Script id="theme-init" strategy="beforeInteractive">
          {`(() => {
            try {
              const stored = localStorage.getItem('portfolio-theme');
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              const shouldUseDark = stored ? stored === 'dark' : prefersDark;
              if (shouldUseDark) {
                document.documentElement.classList.add('dark');
              }
            } catch {}
          })();`}
        </Script>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <MobileDock />
        <DeferredWidgets />
        <SoundEffects />
      </body>
    </html>
  );
}
