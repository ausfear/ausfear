import type { Metadata } from "next";
import { Inter, Syne, Syne_Tactile } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Providers from "@/components/Providers";
import { SITE_URL } from "@/lib/site";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const syneTactile = Syne_Tactile({
  variable: "--font-syne-tactile",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  // Resolves relative URLs (og:image, canonical) to absolute ones
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title: "Audinta Sakti Firmansyah (ausfear)",
  description:
    "Personal site of Audinta Sakti Firmansyah (ausfear). Game enjoyer, music listener, and occasional math guy.",
  keywords: [
    "Audinta Sakti",
    "ausfear",
    "personal site",
    "gaming",
    "music",
    "math",
  ],
  authors: [{ name: "Audinta Sakti Firmansyah" }],
  openGraph: {
    title: "Audinta Sakti Firmansyah (ausfear)",
    description:
      "Game enjoyer, music listener & occasional math guy.",
    type: "website",
    url: "/",
    siteName: "ausfear",
  },
  twitter: {
    card: "summary_large_image",
    title: "Audinta Sakti Firmansyah (ausfear)",
    description:
      "Game enjoyer, music listener & occasional math guy.",
  },
  // Icons come from the file conventions: app/favicon.ico, app/icon.png, app/apple-icon.png
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${syne.variable} ${syneTactile.variable} h-full antialiased`}
      // data-theme is set by the inline script below before React hydrates
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://embed.music.apple.com" />
        <link rel="dns-prefetch" href="https://embed.music.apple.com" />
        <link rel="preconnect" href="https://play.itunes.apple.com" />
        {/* Song previews are fetched with CORS (for the visualizer), so the preconnect must be too */}
        <link rel="preconnect" href="https://audio-ssl.itunes.apple.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://play.itunes.apple.com" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
