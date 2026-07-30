import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Footer from "@/components/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.dokoiku.tokyo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "どこいく | 日付から探すホテル空室検索",
  description:
    "行き先ではなく日付から探す。空室のあるホテルを価格・距離で比較できるサービス「どこいく」。",
  icons: {
    icon: "/icon.svg",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "どこいく | 日付から探すホテル空室検索",
    description:
      "行き先ではなく日付から探す。空室のあるホテルを価格・距離で比較できるサービス「どこいく」。",
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "どこいく | 日付から探すホテル空室検索",
    description:
      "行き先ではなく日付から探す。空室のあるホテルを価格・距離で比較できるサービス「どこいく」。",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "どこいく",
  url: siteUrl,
  description:
    "行き先ではなく日付から探す。空室のあるホテルを価格・距離で比較できるサービス。",
  inLanguage: "ja",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="font-body min-h-screen bg-bg flex flex-col">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="flex-1">{children}</div>
        <Footer />
        {/* Vercelホスティング標準のアクセス解析。追加のIDや環境変数設定は不要
            (GA4はMeasurement IDの取得が必要なため今回は見送り) */}
        <Analytics />
      </body>
    </html>
  );
}

