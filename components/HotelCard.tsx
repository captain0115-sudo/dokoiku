"use client";

import Image from "next/image";
import { track } from "@vercel/analytics";
import type { HotelResult } from "@/lib/rakuten";

export default function HotelCard({
  hotel,
  highlighted,
  nights = 1,
}: {
  hotel: HotelResult;
  highlighted?: boolean;
  nights?: number;
}) {
  const total = hotel.hotelMinCharge * nights;

  return (
    <a
      id={`hotel-${hotel.hotelNo}`}
      href={hotel.planListUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() =>
        // 楽天への実際の送客(コンバージョンの最終ステップ)を計測する。
        // 個人情報は含めず、ホテル名・価格・距離帯など集計に必要な情報のみ送る。
        track("hotel_click", {
          hotelName: hotel.hotelName,
          price: hotel.hotelMinCharge,
          highlighted: Boolean(highlighted),
        })
      }
      className={`grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto] gap-3 sm:gap-4 items-center py-4 px-2 rounded-xl transition-colors ${
        highlighted ? "ring-2 ring-accent bg-accentSoft" : "hover:bg-bg"
      }`}
    >
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden border border-line bg-bg">
        <Image
          src={hotel.hotelImageUrl}
          alt={hotel.hotelName}
          fill
          sizes="(min-width: 640px) 128px, 96px"
          className="object-cover"
        />
      </div>

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
        <div className="sm:hidden mt-2">
          <PriceBlock
            perNight={hotel.hotelMinCharge}
            total={total}
            nights={nights}
          />
        </div>
      </div>

      <div className="hidden sm:block text-right pl-4 border-l border-dashed border-line">
        <PriceBlock
          perNight={hotel.hotelMinCharge}
          total={total}
          nights={nights}
        />
      </div>
    </a>
  );
}

function PriceBlock({
  perNight,
  total,
  nights,
}: {
  perNight: number;
  total: number;
  nights: number;
}) {
  return (
    <>
      <p className="text-price font-mono font-semibold text-base sm:text-lg tabnum">
        ¥{perNight.toLocaleString()}〜
        <span className="text-[10px] text-sub font-normal ml-1">/ 1泊〜</span>
      </p>
      {nights > 1 && (
        <p className="text-sub text-xs font-mono tabnum mt-0.5">
          {nights}泊で目安 ¥{total.toLocaleString()}〜
        </p>
      )}
      <p className="text-sub text-[10px] font-mono mt-0.5 hidden sm:block">
        指定人数での最安プラン
      </p>
      {/* カード全体がリンクであることが伝わりにくいため、クリック先を明示するCTA表記 */}
      <span className="inline-flex items-center gap-0.5 mt-2 text-[11px] font-mono font-semibold text-accent whitespace-nowrap">
        空室・料金を見る
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </span>
    </>
  );
}
