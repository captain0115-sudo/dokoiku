import type { HotelResult } from "@/lib/rakuten";

export default function HotelCard({
  hotel,
  highlighted,
}: {
  hotel: HotelResult;
  highlighted?: boolean;
}) {
  return (
    <a
      id={`hotel-${hotel.hotelNo}`}
      href={hotel.planListUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto] gap-3 sm:gap-4 items-center py-4 px-2 rounded-xl transition-colors ${
        highlighted ? "ring-2 ring-accent bg-accentSoft" : "hover:bg-bg"
      }`}
    >
      <img
        src={hotel.hotelImageUrl}
        alt={hotel.hotelName}
        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-line"
      />

      <div className="min-w-0">
        {highlighted && (
          <p className="text-accent text-[10px] font-mono font-semibold mb-0.5">
            🎲 おまかせ選定
          </p>
        )}
        <p className="text-ink font-body font-medium truncate text-sm sm:text-base">
          {hotel.hotelName}
        </p>
        <p className="text-sub text-xs font-mono tabnum mt-1">
          自宅から {hotel.distanceKm.toFixed(0)} km ・{" "}
          {hotel.reviewAverage != null
            ? `評価 ${hotel.reviewAverage.toFixed(1)}`
            : "評価なし"}
        </p>
        {/* 価格情報はモバイル幅ではここに折り返して表示 */}
        <p className="text-price font-mono font-semibold text-base mt-2 tabnum sm:hidden">
          ¥{hotel.hotelMinCharge.toLocaleString()}〜
        </p>
      </div>

      <div className="hidden sm:block text-right pl-4 border-l border-dashed border-line">
        <p className="text-price font-mono font-semibold text-lg tabnum">
          ¥{hotel.hotelMinCharge.toLocaleString()}〜
        </p>
        <p className="text-sub text-[10px] font-mono mt-0.5">
          指定人数での最安プラン
        </p>
      </div>
    </a>
  );
}
