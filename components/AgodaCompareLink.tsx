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
  position,
}: {
  href: string;
  areaName: string;
  cityName: string;
  /** 一覧の上(見出し直下)か下か。GA4で位置別のクリックを比べるために送る(2026-10-06) */
  position: "top" | "bottom";
}) {
  const onClick = () =>
    sendGAEvent("event", "agoda_click", { area: areaName, position });

  // 2026-10-06: 一覧最下部の小さな文字リンクだけでは見落とされる(オーナー指摘)ため、
  // 見出し直下にも置き、下側はボタン調にした。
  if (position === "top") {
    return (
      <p className="px-5 py-2 border-b border-line bg-bg text-xs font-body text-sub">
        <span className="font-mono text-[10px] mr-1">【PR】</span>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={onClick}
          className="text-ink underline underline-offset-2 hover:text-accent"
        >
          同じ日程で{cityName}周辺の宿をアゴダでも比較する →
        </a>
      </p>
    );
  }

  return (
    <div className="px-5 py-4 border-t border-line bg-bg">
      <p className="text-sub text-[10px] font-mono mb-2">【PR】他の予約サイトとも比較</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={onClick}
        className="pill-button pill-button-inactive inline-flex items-center gap-1 !px-4 !py-2 text-xs font-mono font-semibold"
      >
        同じ日程で{cityName}周辺の宿をアゴダでも見る →
      </a>
    </div>
  );
}
