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
  title: "みらい議会",
  description: "議案をわかりやすく解説するプラットフォーム",
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

        <div className="relative max-w-[500px] mx-auto pc:mr-[500px] sm:shadow-lg">
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
