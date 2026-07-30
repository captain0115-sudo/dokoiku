import type { HotelResult } from "@/lib/rakuten";
import HotelCard from "./HotelCard";
import ShareButtons from "./ShareButtons";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.dokoiku.tokyo";

export default function HotelList({
  hotels,
  originLabel,
  highlightedHotelNo,
  nights,
}: {
  hotels: HotelResult[];
  originLabel?: string;
  highlightedHotelNo?: number | null;
  nights?: number;
}) {
  if (hotels.length === 0) {
    return (
      <div className="bg-surface border border-line rounded-2xl p-8 text-center text-sub font-body text-sm">
        条件に合う空室が見つかりませんでした。日付や範囲の指定を変えてお試しください。
      </div>
    );
  }

  // 価格順に並んだ結果を、初出順を保ったままエリア(都道府県)ごとにまとめる。
  // こうすることで、グループ自体も「一番安い候補があるエリア」から並ぶ。
  const groups: { areaName: string; hotels: HotelResult[] }[] = [];
  for (const hotel of hotels) {
    const areaName = hotel.areaName ?? "その他";
    let group = groups.find((g) => g.areaName === areaName);
    if (!group) {
      group = { areaName, hotels: [] };
      groups.push(group);
    }
    group.hotels.push(hotel);
  }

  return (
    <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-2 px-5 py-4 border-b border-line">
        <div className="flex items-baseline gap-3">
          <h2 className="font-display font-bold text-ink text-base">
            空室 {hotels.length}件
          </h2>
          {originLabel && (
            <span className="text-sub text-xs font-mono">起点: {originLabel}</span>
          )}
        </div>
        <ShareButtons
          url={siteUrl}
          text="行き先じゃなく、日付から探すホテル検索「どこいく」"
        />
      </div>
      <p className="px-5 py-2 text-sub text-xs font-body bg-bg/60 border-b border-line">
        表示価格は<strong>1泊あたり</strong>の、指定人数条件での最安プランの目安です。
        {nights && nights > 1 &&
          `${nights}泊の合計目安額もあわせて表示しています。`}
        税・サービス料の取り扱いは施設により異なるため、予約前に予約サイト側で
        最終確認してください。
      </p>

      {groups.map((group) => (
        <div key={group.areaName}>
          <div className="px-5 py-2 bg-bg/60 border-b border-line">
            <span className="text-xs font-mono text-sub">
              {group.areaName}({group.hotels.length}件)
            </span>
          </div>
          <div className="px-3 divide-y divide-line">
            {group.hotels.map((hotel) => (
              <HotelCard
                key={hotel.hotelNo}
                hotel={hotel}
                highlighted={hotel.hotelNo === highlightedHotelNo}
                nights={nights}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
