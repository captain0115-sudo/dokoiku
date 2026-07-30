/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // 楽天トラベル空室検索APIが返すhotelImageUrlの実際の配信元ドメイン
    // (2026-07-30時点の実レスポンスで確認済み: img.travel.rakuten.co.jp)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.travel.rakuten.co.jp",
      },
    ],
  },
};

export default nextConfig;
