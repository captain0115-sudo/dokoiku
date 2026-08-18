import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import Footer from "@/components/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.dokoiku.tokyo";
const gaId = process.env.NEXT_PUBLIC_GA_ID ?? "G-N4LQJY73L6";

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
        {/* Vercelホスティング標準のアクセス解析。追加のIDや環境変数設定は不要 */}
        <Analytics />
      </body>
      {/* GA4(Googleマーケティングプラットフォーム)。2026-08-19、ユーザーがGoogle
          アナリティクスでプロパティ「dokoiku」を作成しMeasurement IDを取得したため導入。
          @next/third-partiesのGoogleAnalyticsコンポーネントはgtag.jsを最適化した形で
          読み込む(Next.js公式推奨の実装方法) */}
      <GoogleAnalytics gaId={gaId} />
    </html>
  );
}

