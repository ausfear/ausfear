import type { Metadata } from "next";
import { Inter, Syne, Syne_Tactile } from "next/font/google";
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
  title: "Audinta Sakti Firmansyah — ausfear",
  description:
    "Personal site of Audinta Sakti Firmansyah (ausfear) — game enjoyer, music listener, and occasional math guy.",
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
    title: "Audinta Sakti Firmansyah — ausfear",
    description:
      "Game enjoyer, music listener & occasional math guy. Just vibing on the internet.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${syne.variable} ${syneTactile.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
