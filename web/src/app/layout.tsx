import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Lexend_Giga, Noto_Sans_JP } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { useId } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/layouts/footer/footer";
import { env } from "@/lib/env";
import { RubyfulInitializer } from "@/lib/rubyful";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const lexendGiga = Lexend_Giga({
  variable: "--font-lexend-giga",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.webUrl),
  title: "みらい議会",
  description: "議案をわかりやすく解説するプラットフォーム",
  keywords: [
    "みらい議会",
    "議案",
    "政治",
    "日本",
    "政策",
    "解説",
    "チームみらい",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "みらい議会",
    description: "議案をわかりやすく解説するプラットフォーム",
    images: [
      {
        url: "/ogp.png",
        width: 1200,
        height: 630,
        alt: "みらい議会のOGPイメージ",
      },
    ],
    siteName: "みらい議会",
  },
  twitter: {
    card: "summary_large_image",
    title: "みらい議会",
    description: "議案をわかりやすく解説するプラットフォーム",
    images: ["/ogp.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const mainContentId = useId();

  return (
    <html lang="ja">
      <body
        className={`${notoSansJP.variable} ${lexendGiga.variable} font-sans antialiased`}
      >
        <NextTopLoader showSpinner={false} color="#2aa693" />
        <SpeedInsights />
        <GoogleAnalytics gaId={env.analytics.gaTrackingId ?? ""} />
        <RubyfulInitializer />

        <div
          className="
            relative max-w-[700px] mx-auto sm:shadow-lg sm:mt-22
            pc:mr-[500px] pcl:mr-[max(calc(50vw-250px),500px)]
          "
        >
          <Header />
          <main id={mainContentId} className="min-h-screen">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
