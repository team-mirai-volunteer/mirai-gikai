import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Header } from "@/components/header";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "みらい議会",
  description: "議案をわかりやすく解説するプラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
        <NextTopLoader showSpinner={false} />
        <Header />
        <main className="min-h-screen mt-20">{children}</main>
      </body>
    </html>
  );
}
