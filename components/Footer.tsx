import Link from "next/link";
import { REGION_LABELS, prefecturesInRegion, type RegionKey } from "@/lib/prefectures";

// 全都道府県への内部リンクをフッターに設置する(全ページ共通)。
// 以前は東京・大阪・北海道・福岡・沖縄の5県のみで、残り42県はサイトマップ経由でしか
// 発見されにくい状態だった(2026-08-13のSEO監査で指摘、地方ごとにグルーピングして解消)。
const REGION_ORDER: RegionKey[] = [
  "hokkaido",
  "tohoku",
  "kanto",
  "koshinetsu",
  "hokuriku",
  "tokai",
  "kinki",
  "chugoku",
  "shikoku",
  "kyushuOkinawa",
];

export default function Footer() {
  return (
    <footer className="max-w-3xl mx-auto px-4 py-8 mt-4">
      <div className="border-t border-line pt-6 flex flex-col gap-4">
        <div>
          <p className="text-sub text-xs font-mono mb-2">特集</p>
          <Link
            href="/silverweek2026"
            className="text-sub text-xs font-body underline hover:text-ink"
          >
            11年ぶりのシルバーウィーク空室ホテル特集
          </Link>
        </div>

        <div>
          <p className="text-sub text-xs font-mono mb-2">エリアから探す(全47都道府県)</p>
          <div className="flex flex-col gap-2">
            {REGION_ORDER.map((region) => (
              <div key={region} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-sub text-[10px] font-mono shrink-0 w-12">
                  {REGION_LABELS[region]}
                </span>
                {prefecturesInRegion(region).map((pref) => (
                  <Link
                    key={pref.middleClassCode}
                    href={`/areas/${pref.middleClassCode}`}
                    className="text-sub text-xs font-body underline hover:text-ink"
                  >
                    {pref.name}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sub text-xs font-mono mb-2">運営者について</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <a
              href="https://note.com/proper_clover730"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sub text-xs font-body underline hover:text-ink"
            >
              運営者のnote(副業・個人開発の話)
            </a>
            <a
              href="https://www.instagram.com/dokoiku_jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sub text-xs font-body underline hover:text-ink"
            >
              Instagram(@dokoiku_jp)
            </a>
            <a
              href="https://x.com/dokoiku_tokyo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sub text-xs font-body underline hover:text-ink"
            >
              X(@dokoiku_tokyo)
            </a>
            <a
              href="https://room.rakuten.co.jp/room_1b6167f7c7"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sub text-xs font-body underline hover:text-ink"
            >
              楽天ROOM
            </a>
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
