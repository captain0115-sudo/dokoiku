"use client";

import Image from "next/image";
import { track } from "@vercel/analytics";
import { sendGAEvent } from "@next/third-parties/google";
import type { HotelResult } from "@/lib/rakuten";

export default function HotelCard({
  hotel,
  highlighted,
  nights = 1,
  distanceLabel = "起点から",
  areaLabel,
}: {
  hotel: HotelResult;
  highlighted?: boolean;
  nights?: number;
  /**
   * 距離の基準点のラベル。トップページの通常検索では「起点となる住所」入力欄(現在地・
   * 任意の住所いずれも指定可能、必ずしも実際の自宅とは限らない)を指す。エリアページ・
   * 季節特集ページでは都道府県の代表地点が基準のため、呼び出し側で正しい文言を渡すこと
   * (デフォルトのまま放置すると、検索結果のスニペットにも表示され意味不明になる)。
   */
  distanceLabel?: string;
  /**
   * 画像alt文言に添える地域名(例: 「奈良県」)。オンページSEO監査(2026-09-07)で、
   * 画像altがホテル名のみでエリア文脈を含んでいなかった点を修正。都道府県が
   * 特定できるページ(エリアページ等)からのみ渡す想定で、トップページの通常検索
   * (起点住所は必ずしも都道府県と一致しない)では渡さず従来通りホテル名のみとする。
   */
  areaLabel?: string;
}) {
  const total = hotel.hotelMinCharge * nights;

  return (
    <a
      id={`hotel-${hotel.hotelNo}`}
      href={hotel.planListUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() => {
        // 楽天への実際の送客(コンバージョンの最終ステップ)を計測する。
        // 個人情報は含めず、ホテル名・価格・距離帯など集計に必要な情報のみ送る。
        // 2026-09-10: GA4には拡張計測機能の汎用clickイベントしか届いておらず、この
        // 最重要イベントがVercel Analyticsのみにしか記録されていなかったため、
        // GA4側にも同じイベントを送るようにした(GA4でキーイベントとして登録する前提)。
        const payload = {
          hotelName: hotel.hotelName,
          price: hotel.hotelMinCharge,
          highlighted: Boolean(highlighted),
        };
        track("hotel_click", payload);
        sendGAEvent("event", "hotel_click", payload);
      }}
      className={`grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto] gap-3 sm:gap-4 items-center py-4 px-2 rounded-xl transition-colors ${
        highlighted ? "ring-2 ring-accent bg-accentSoft" : "hover:bg-bg"
      }`}
    >
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden border border-line bg-bg">
        <Image
          src={hotel.hotelImageUrl}
          alt={areaLabel ? `${hotel.hotelName}（${areaLabel}）` : hotel.hotelName}
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
          {distanceLabel} {hotel.distanceKm.toFixed(0)} km ・{" "}
          {hotel.reviewAverage != null
            ? `評価 ${hotel.reviewAverage.toFixed(1)}${
                hotel.reviewCount != null ? `(${hotel.reviewCount.toLocaleString()}件)` : ""
              }`
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
      {/* カード全体がリンクであることに加え、外部(楽天トラベル)へ遷移することを事前に
          明示するCTA(2026-09-17改善)。単なる文字リンクだとクリック後の遷移先が不明で
          離脱不安につながるため、遷移先を明示したボタン調に変更した */}
      <span className="pill-button pill-button-active inline-flex items-center gap-1 mt-2 !px-3 !py-1.5 text-[11px] font-mono font-semibold whitespace-nowrap">
        楽天トラベルで空室を確認
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
