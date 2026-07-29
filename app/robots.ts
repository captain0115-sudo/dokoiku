import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.dokoiku.tokyo";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"], // APIエンドポイントはクロール対象外
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
