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
  title: "Compound Interest Calculator",
  description: "Model your investment growth and visualize the power of compound interest.",
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
