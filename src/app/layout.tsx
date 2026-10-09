import type { Metadata, Viewport } from "next";
import { bodyFont, displayFont, headingFont } from "@/lib/fonts";
import { site } from "@/data/site";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { BackToTop } from "@/layout/BackToTop";
import { Header } from "@/layout/Header";
import { Preloader } from "@/layout/Preloader";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { default: `${site.name} — ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  metadataBase: new URL(site.url),
  openGraph: { title: site.name, description: site.description, siteName: site.name, type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable} ${displayFont.variable}`}>
      <body>
        <SmoothScrollProvider>
          <Preloader />
          <Header />
          <main className="relative">{children}</main>
          <BackToTop />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
