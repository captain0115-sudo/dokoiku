import type { MetadataRoute } from "next";
import { PREFECTURES } from "@/lib/prefectures";
import { AREA_VARIANT_LIST } from "@/lib/areaVariants";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.dokoiku.tokyo";

  // 都道府県 x バリエーション(週末/温泉宿/今夜泊まれる宿)の全組み合わせ。
  // ロングテールSEO対策(2026-07-31)で温泉宿・直前予約ページを追加。
  const areaPages: MetadataRoute.Sitemap = PREFECTURES.flatMap((pref) =>
    AREA_VARIANT_LIST.map((variant) => ({
      url: `${baseUrl}/areas/${pref.middleClassCode}${variant.pathSuffix}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: variant.key === "weekend" ? 0.7 : 0.6,
    }))
  );

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      // 期間限定の季節特集ページ。2026-08-16にお盆休み(8/13〜8/16)テーマから
      // 夏休み後半(8/22〜8/24)テーマに切り替え、2026-08-25に夏休み終了を受けて
      // 新規ページ/silverweek2026(9/19〜23の5連休)へ切り替えた。旧/obon2026は
      // 内部リンクを外したがページ自体は残す(既存インデックス・被リンクの維持)。
      // このテーマも過ぎたら内容の見直し・削除を検討すること。
      url: `${baseUrl}/silverweek2026`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...areaPages,
  ];
}
