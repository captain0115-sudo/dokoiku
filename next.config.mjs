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
    // Vercel Image Optimizationの無料枠(5,000変換/月)を2026-08-09に使い切ったため停止。
    // 楽天側から返る画像は既に適切なサイズなので、最適化なしでの実害は小さい判断。
    unoptimized: true,
  },
};

export default nextConfig;
