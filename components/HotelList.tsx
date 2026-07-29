import type { HotelResult } from "@/lib/rakuten";
import HotelCard from "./HotelCard";

export default function HotelList({
  hotels,
  originLabel,
  highlightedHotelNo,
}: {
  hotels: HotelResult[];
  originLabel?: string;
  highlightedHotelNo?: number | null;
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
      <div className="flex items-baseline justify-between px-5 py-4 border-b border-line">
        <h2 className="font-display font-bold text-ink text-base">
          空室 {hotels.length}件
        </h2>
        {originLabel && (
          <span className="text-sub text-xs font-mono">起点: {originLabel}</span>
        )}
      </div>
      <p className="px-5 py-2 text-sub text-xs font-body bg-bg/60 border-b border-line">
        表示価格は指定人数条件での最安プランの目安です。税・サービス料の
        取り扱いは施設により異なるため、予約前に予約サイト側で最終確認してください。
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
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
