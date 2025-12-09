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

const siteTitle = "みらい議会｜チームみらい";
const siteDescription =
  "国会で今どんな法案が検討されているか、わかりやすく伝えるプラットフォーム";
const siteName = "みらい議会";
const ogImage = {
  url: "/ogp.jpg",
  width: 1200,
  height: 630,
  alt: "みらい議会のOGPイメージ",
};

export const metadata: Metadata = {
  metadataBase: new URL(env.webUrl),
  title: siteTitle,
  description: siteDescription,
  keywords: [siteName, "議案", "政治", "日本", "政策", "解説", "チームみらい"],
  icons: {
    icon: "/icons/pwa/icon_android_192.png",
    apple: "/icons/pwa/icon_ios.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    images: [ogImage],
    siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [ogImage.url],
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
  themeColor: "#2aa693",
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
        className={`${notoSansJP.variable} ${lexendGiga.variable} font-sans antialiased bg-[#EEEEEE]`}
      >
        <NextTopLoader showSpinner={false} color="#2aa693" />
        <SpeedInsights />
        <GoogleAnalytics gaId={env.analytics.gaTrackingId ?? ""} />
        <RubyfulInitializer />

        <div
          // xlサイズでは、横幅1180px（メイン + チャット）の中央寄せにする
          className="
            relative max-w-[700px] mx-auto sm:shadow-lg md:mt-24
            pc:mr-[500px] xl:ml-[calc(calc(100vw-1180px)/2)]
          "
        >
          <Header />
          <main id={mainContentId} className="min-h-screen bg-[#F7F4F0]">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
