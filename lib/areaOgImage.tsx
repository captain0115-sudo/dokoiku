import { ImageResponse } from "next/og";

export const AREA_OG_IMAGE_SIZE = { width: 1200, height: 630 };

/**
 * 都道府県ページ(週末/温泉宿/今夜泊まれる宿/1万円以下)共通のOGP画像を組み立てる。
 * 各バリエーションのopengraph-image.tsxから呼び出す想定(edge runtime前提)。
 * 2026-08-21: 従来はapp/areas/[code]/opengraph-image.tsxがトップレベル
 * (/areas/[code])にしか適用されず、nested route(onsen/tonight/budget、
 * 計141ページ)はサイト全体の汎用OGP画像にフォールバックしていた
 * (画像上に都道府県名やバリエーションの文言が出ない状態)。この関数を
 * 各バリエーション専用のopengraph-image.tsxから呼び出すことで解消する。
 */
export function buildAreaVariantOgImage(
  heading: string,
  catchphrase: string | undefined,
  tagline: string
) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#F6F7F9",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="48" height="48" viewBox="0 0 26 26" fill="none">
            <path
              d="M13 2C8.58 2 5 5.58 5 10c0 6 8 14 8 14s8-8 8-14c0-4.42-3.58-8-8-8z"
              fill="none"
              stroke="#24417A"
              strokeWidth="1.8"
            />
            <circle cx="13" cy="10" r="3" fill="#0E7C66" />
          </svg>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#1C2530" }}>
            どこいく
          </div>
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: "#1C2530",
            marginTop: 32,
          }}
        >
          {heading}
        </div>
        {catchphrase && (
          <div style={{ fontSize: 28, color: "#6B7680", marginTop: 20 }}>
            {catchphrase}
          </div>
        )}
        <div style={{ fontSize: 22, color: "#0E7C66", marginTop: 32 }}>
          {tagline}
        </div>
      </div>
    ),
    { ...AREA_OG_IMAGE_SIZE }
  );
}
