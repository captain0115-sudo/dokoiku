import Link from "next/link";

const FEATURED_AREAS: { name: string; code: string }[] = [
  { name: "東京都", code: "tokyo" },
  { name: "大阪府", code: "osaka" },
  { name: "北海道", code: "hokkaido" },
  { name: "福岡県", code: "fukuoka" },
  { name: "沖縄県", code: "okinawa" },
];

export default function Footer() {
  return (
    <footer className="max-w-3xl mx-auto px-4 py-8 mt-4">
      <div className="border-t border-line pt-6 flex flex-col gap-4">
        <div>
          <p className="text-sub text-xs font-mono mb-2">特集</p>
          <Link
            href="/obon2026"
            className="text-sub text-xs font-body underline hover:text-ink"
          >
            お盆休み2026の空室ホテル特集
          </Link>
        </div>

        <div>
          <p className="text-sub text-xs font-mono mb-2">エリアから探す</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {FEATURED_AREAS.map((area) => (
              <Link
                key={area.code}
                href={`/areas/${area.code}`}
                className="text-sub text-xs font-body underline hover:text-ink"
              >
                {area.name}
              </Link>
            ))}
          </div>
        </div>

        <p className="text-sub text-xs font-body">
          【PR】本サイトは楽天アフィリエイトプログラムに参加しており、
          掲載する宿泊施設へのリンクから成果報酬を受け取る場合があります。
        </p>
        <div className="flex gap-4">
          <Link
            href="/privacy"
            className="text-sub text-xs font-body underline hover:text-ink"
          >
            プライバシーポリシー
          </Link>
        </div>
      </div>
    </footer>
  );
}
