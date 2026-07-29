import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "どこいく | 日付から探すホテル空室検索",
  description:
    "行き先ではなく日付から探す。空室のあるホテルを価格・距離で比較できるサービス「どこいく」。",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "どこいく | 日付から探すホテル空室検索",
    description:
      "行き先ではなく日付から探す。空室のあるホテルを価格・距離で比較できるサービス「どこいく」。",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "どこいく | 日付から探すホテル空室検索",
    description:
      "行き先ではなく日付から探す。空室のあるホテルを価格・距離で比較できるサービス「どこいく」。",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="font-body min-h-screen bg-bg flex flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
