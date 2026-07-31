import type { MetadataRoute } from "next";
import { PREFECTURES } from "@/lib/prefectures";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.dokoiku.tokyo";

  const areaPages: MetadataRoute.Sitemap = PREFECTURES.map((pref) => ({
    url: `${baseUrl}/areas/${pref.middleClassCode}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      // 期間限定の季節特集ページ。お盆休み(2026/8/13〜8/16)を過ぎたら
      // 内容の見直し・削除を検討すること(sitemap.tsのコメント参照)。
      url: `${baseUrl}/obon2026`,
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
