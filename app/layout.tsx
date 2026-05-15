import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans, Space_Mono, Barlow } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { ChatWidget } from "@/components/ui/ChatWidget";
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
  title: siteConfig.title,
  description: siteConfig.description,
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
        <ScrollToTop />
        <ChatWidget />
      </body>
    </html>
  );
}
