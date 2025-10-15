import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Lexend_Giga, Noto_Sans_JP } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { env } from "@/lib/env";
import { Header } from "@/components/header";
import { DesktopMenu } from "@/components/layouts/desktop-menu";
import { Footer } from "@/components/layouts/footer/footer";
import { GoogleAnalytics } from "@next/third-parties/google";
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
  return (
    <html lang="ja">
      <body
        className={`${notoSansJP.variable} ${lexendGiga.variable} font-sans antialiased`}
      >
        <NextTopLoader showSpinner={false} color="#2aa693" />
        <SpeedInsights />
        <GoogleAnalytics gaId={env.analytics.gaTrackingId ?? ""} />
        <RubyfulInitializer />

        {/* 画面幅1400px以上で表示されるデスクトップメニュー */}
        <DesktopMenu />

        <div
          className="
            relative max-w-[500px] mx-auto sm:shadow-lg
            pc:mr-[500px] pcl:mr-[max(calc(50vw-250px),500px)]
          "
        >
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
