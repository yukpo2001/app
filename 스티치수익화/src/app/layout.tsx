import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/LanguageContext";
import { TravelProvider } from "@/lib/TravelContext";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lumi's Pick - AI Travel Guide",
  description: "AI-powered aesthetic travel roadmap based on your reviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <LanguageProvider>
          <TravelProvider>
            {children}
          </TravelProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
