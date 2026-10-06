"use client";

import { sendGAEvent } from "@next/third-parties/google";

/**
 * 同じ日程でアゴダの検索結果を開く比較リンク(2026-10-06追加、A8.net経由のPRリンク)。
 * 価格はAPIで取得できないため表示しない。クリックはGA4の`agoda_click`で計測する。
 */
export default function AgodaCompareLink({
  href,
  areaName,
  cityName,
}: {
  href: string;
  areaName: string;
  cityName: string;
}) {
  return (
    <div className="px-5 py-4 border-t border-line bg-bg">
      <p className="text-sub text-[10px] font-mono mb-1">【PR】他の予約サイトとも比較</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() => sendGAEvent("event", "agoda_click", { area: areaName })}
        className="text-ink text-sm font-body underline underline-offset-2 hover:text-accent"
      >
        同じ日程で{cityName}周辺の宿をアゴダでも見る →
      </a>
    </div>
  );
}
