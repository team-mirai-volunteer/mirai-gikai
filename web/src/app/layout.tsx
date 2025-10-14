import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Lexend_Giga, Noto_Sans_JP } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Header } from "@/components/header";
import { DesktopMenu } from "@/components/layouts/desktop-menu";
import { Footer } from "@/components/layouts/footer/footer";
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
  title: {
    default: "みらい議会",
    template: "%s | みらい議会",
  },
  description:
    "議案をわかりやすく解説するプラットフォーム。国会で議論されている法案を、やさしい言葉でわかりやすく説明します。",
  keywords: [
    "みらい議会",
    "国会",
    "法案",
    "議案",
    "政治",
    "わかりやすい",
    "解説",
    "市民参加",
  ],
  authors: [{ name: "チームみらい" }],
  creator: "チームみらい",
  publisher: "チームみらい",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://mirai-gikai.vercel.app"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "/",
    title: "みらい議会",
    description:
      "議案をわかりやすく解説するプラットフォーム。国会で議論されている法案を、やさしい言葉でわかりやすく説明します。",
    siteName: "みらい議会",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "みらい議会",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "みらい議会",
    description:
      "議案をわかりやすく解説するプラットフォーム。国会で議論されている法案を、やさしい言葉でわかりやすく説明します。",
    images: ["/og-image.png"],
    creator: "@team_mirai",
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
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
