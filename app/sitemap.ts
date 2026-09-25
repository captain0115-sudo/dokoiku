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
      // 季節特集: スポーツの日3連休(10/10〜12)。シルバーウィークが終わる
      // 前に事前公開し、Googleのクロール・インデックスに猶予を持たせる
      // (2026-09-20追加)。2026-09-25、シルバーウィーク終了(9/23)を受けて
      // /silverweek2026をsitemapのこのエントリから外し、主役をこちらに交代
      // (過去のobon2026→silverweek2026切り替えと同じ運用。/silverweek2026自体は
      // ページとして残置、内部リンクのみ外す)。次は10/12を過ぎたら、この
      // エントリを外して次の季節特集に切り替えること。
      url: `${baseUrl}/sportsday2026`,
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
