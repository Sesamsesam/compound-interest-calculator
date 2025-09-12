import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

/* App-wide providers & shared UI */
import ThemeProvider from "@/components/ThemeProvider";
import Navigation from "@/components/Navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  /* ---------- Basic ---------- */
  title: "Compound Interest Calculator",
  description:
    "Byg formue ved at udnytte investerings-matematik med renters rente. Gro millioner af kr. ved at bruge det 8. vidunder af verden.",

  /* ---------- OpenGraph ---------- */
  openGraph: {
    title: "Compound Interest Calculator",
    description:
      "Byg formue ved at udnytte investerings-matematik med renters rente. Gro millioner af kr. ved at bruge det 8. vidunder af verden.",
    type: "website",
    url: "https://compound-interest-calculator.vercel.app/",
    images: [
      {
        url: "/CPH_Trading_Academy_Logo-B2-removebg-preview.png",
        width: 120,
        height: 60,
        alt: "CPH Trading Academy Logo",
      },
    ],
  },

  /* ---------- Twitter ---------- */
  twitter: {
    card: "summary_large_image",
    title: "Compound Interest Calculator",
    description:
      "Byg formue ved at udnytte investerings-matematik med renters rente. Gro millioner af kr. ved at bruge det 8. vidunder af verden.",
    images: ["/CPH_Trading_Academy_Logo-B2-removebg-preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da">
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>
          <Navigation />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
