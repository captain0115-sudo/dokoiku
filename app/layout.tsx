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

// ウェイト削減(2026-08-19): コードベース全体でfont-display(Zen Kaku Gothic New)は
// font-black(900)/font-bold(700)のみ、font-mono(IBM Plex Mono)はデフォルト(400)/
// font-semibold(600)のみ使用されており、両者とも500は未使用と確認済みのため除外
// (PageSpeed Insightsの「使用していないCSSの削減」対策、Noto Sans JPは400/500/600
// すべて実使用があるため据え置き)
const googleFontsHref =
  "https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@700;900&family=Noto+Sans+JP:wght@400;500;600&family=IBM+Plex+Mono:wght@400;600&display=swap";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        {/* Googleフォントの読み込みを非ブロッキング化(2026-08-19)。当初globals.cssの@importを
            単純なlink rel="stylesheet"に置き換えたが、それでも175KB・2,730msの
            レンダリングブロッキングとしてPageSpeed Insightsに検出され続けた(同期的な
            stylesheetリンクである限り@import/linkどちらでもブロッキングは解消しない)。
            media="print"で読み込んでrender-blocking対象から外し、読み込み完了後に
            JSでmedia="all"に切り替える標準手法(loadCSSパターン)に変更。display=swapとの
            組み合わせで、フォント未読み込み時もテキストは即座にフォールバックフォントで
            表示される(文字が見えなくなることはない) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" as="style" href={googleFontsHref} />
        <link
          rel="stylesheet"
          href={googleFontsHref}
          media="print"
          id="google-fonts-stylesheet"
        />
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var l=document.getElementById('google-fonts-stylesheet');" +
              "if(l){l.addEventListener('load',function(){l.media='all';});}})();",
          }}
        />
        <noscript>
          <link rel="stylesheet" href={googleFontsHref} />
        </noscript>
      </head>
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

