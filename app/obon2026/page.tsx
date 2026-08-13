import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import HotelCard from "@/components/HotelCard";
import ShareButtons from "@/components/ShareButtons";
import { findPrefecture, type Prefecture } from "@/lib/prefectures";
import { searchVacantHotelsByArea, type HotelResult } from "@/lib/rakuten";
import { runWithConcurrencyLimit } from "@/lib/concurrency";
import { nightsBetween } from "@/lib/dates";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.dokoiku.tokyo";

// お盆休みの代表的な期間として「月遅れ盆」の8/13〜8/16(2026年)を採用。
// 実際の休暇期間は会社・地域により異なるため、本文中でもその旨を明記している。
const CHECKIN_DATE = "2026-08-13";
const CHECKOUT_DATE = "2026-08-16";

// 都市・温泉地・避暑地・海と、行き先の傾向が偏らないよう編集部で選定した6エリア。
// 「人気ランキング」等の裏付けのない順位付けはせず、五十音・地方順ではなく
// 掲載上わかりやすい順に並べている。
const FEATURED_CODES = [
  "hokkaido",
  "tokyo",
  "kanagawa",
  "shizuoka",
  "osaka",
  "okinawa",
];

// ページは事前生成せず初回アクセス時に生成 → 1時間キャッシュ(ISR)。
// /areas/[code] と同じ方針(ビルド時に楽天APIへ一括アクセスするのを避けるため)。
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "お盆休み2026(8/13〜8/16)の空室ホテル特集 | どこいく",
  description:
    "2026年のお盆休み(8月13日〜16日を例に)、北海道・東京・神奈川・静岡・大阪・沖縄で今空いているホテルを価格順にまとめました。日付から探すホテル検索「どこいく」。",
  alternates: { canonical: "/obon2026" },
  openGraph: {
    title: "お盆休み2026の空室ホテル特集 | どこいく",
    description:
      "北海道・東京・神奈川・静岡・大阪・沖縄で、お盆休み(8/13〜8/16)に今空いているホテルを価格順に一覧表示。",
  },
};

type AreaSection = {
  pref: Prefecture;
  hotels: HotelResult[];
  fetchFailed: boolean;
};

export default async function Obon2026Page() {
  const prefectures = FEATURED_CODES.map((code) => findPrefecture(code)).filter(
    (p): p is Prefecture => p !== undefined
  );

  const settled = await runWithConcurrencyLimit(
    prefectures.map(
      (pref) => () =>
        searchVacantHotelsByArea({
          checkinDate: CHECKIN_DATE,
          checkoutDate: CHECKOUT_DATE,
          areaLat: pref.lat,
          areaLng: pref.lng,
          homeLat: pref.lat,
          homeLng: pref.lng,
          guests: { adults: 1 },
        })
    ),
    3
  );

  const sections: AreaSection[] = prefectures.map((pref, i) => {
    const result = settled[i];
    if (result.status !== "fulfilled") {
      return { pref, hotels: [], fetchFailed: true };
    }
    const hotels = [...result.value]
      .sort((a, b) => a.hotelMinCharge - b.hotelMinCharge)
      .slice(0, 4);
    return { pref, hotels, fetchFailed: false };
  });

  const nights = nightsBetween(CHECKIN_DATE, CHECKOUT_DATE);
  const pageUrl = `${siteUrl}/obon2026`;
  const allListedHotels = sections.flatMap((s) => s.hotels);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "どこいく", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "お盆休み2026の空室ホテル特集",
        item: pageUrl,
      },
    ],
  };

  // 実際に取得できた空室ホテルのみを構造化データ化する(架空の在庫を作らない)
  const itemListJsonLd =
    allListedHotels.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListOrder: "https://schema.org/ItemListOrderAscending",
          numberOfItems: allListedHotels.length,
          itemListElement: allListedHotels.map((hotel, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "LodgingBusiness",
              name: hotel.hotelName,
              url: hotel.hotelInformationUrl,
              image: hotel.hotelImageUrl,
              ...(hotel.reviewAverage != null && hotel.reviewCount != null
                ? {
                    aggregateRating: {
                      "@type": "AggregateRating",
                      ratingValue: hotel.reviewAverage,
                      reviewCount: hotel.reviewCount,
                      bestRating: 5,
                    },
                  }
                : {}),
              geo: {
                "@type": "GeoCoordinates",
                latitude: hotel.latitude,
                longitude: hotel.longitude,
              },
              makesOffer: {
                "@type": "Offer",
                price: hotel.hotelMinCharge,
                priceCurrency: "JPY",
                url: hotel.planListUrl,
                availability: "https://schema.org/InStock",
              },
            },
          })),
        }
      : null;

  return (
    <main className="max-w-3xl mx-auto px-4 py-14">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}

      <div className="mb-8">
        <Link href="/">
          <Logo />
        </Link>
      </div>

      <p className="font-mono text-sub text-xs tracking-wideLabel mb-2 uppercase">
        {CHECKIN_DATE} 〜 {CHECKOUT_DATE}({nights}泊)の例
      </p>
      <h1 className="font-display font-black text-3xl text-ink mb-3">
        お盆休み2026の空室ホテル特集
      </h1>
      <p className="text-sub font-body text-sm leading-relaxed mb-8">
        お盆休みの期間は会社・地域によって異なりますが、ここでは「月遅れ盆」にあたる
        2026年8月13日〜16日を例に、北海道・東京・神奈川・静岡・大阪・沖縄の6エリアで
        現在空室のあるホテルを価格の安い順にまとめました。掲載しているのは実際に取得できた
        空室のみです。ご自身の日程・行き先で探したい場合は、下のボタンからトップページの
        検索フォームをお使いください(このページの日付が自動で入力された状態で開きます)。
      </p>

      <div className="mb-10 flex flex-wrap items-center gap-3">
        <Link
          href={`/?checkin=${CHECKIN_DATE}&checkout=${CHECKOUT_DATE}`}
          className="inline-block px-6 py-3 rounded-full bg-accent text-white font-display font-bold text-sm hover:brightness-110 transition"
        >
          この日程で自分の行き先を検索する
        </Link>
        <ShareButtons
          url={pageUrl}
          text="お盆休み2026の空室ホテル特集 | どこいく"
        />
      </div>

      {sections.map(({ pref, hotels, fetchFailed }) => (
        <section key={pref.middleClassCode} className="mb-10">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="font-display font-bold text-ink text-lg">
              {pref.name}
              <span className="text-sub font-body font-normal text-sm ml-2">
                {pref.catchphrase}
              </span>
            </h2>
            <Link
              href={`/areas/${pref.middleClassCode}`}
              className="text-accent text-xs font-mono underline shrink-0 whitespace-nowrap"
            >
              {pref.name}をもっと見る →
            </Link>
          </div>

          {fetchFailed && (
            <p className="text-sub font-body text-xs bg-surface border border-line rounded-xl p-4">
              現在、{pref.name}の空室情報を取得できませんでした。しばらくしてから再度お試しください。
            </p>
          )}

          {!fetchFailed && hotels.length === 0 && (
            <p className="text-sub font-body text-xs bg-surface border border-line rounded-xl p-4">
              この日程では、{pref.name}で条件に合う空室が見つかりませんでした。
            </p>
          )}

          {hotels.length > 0 && (
            <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm">
              <div className="px-3 divide-y divide-line">
                {hotels.map((hotel) => (
                  <HotelCard key={hotel.hotelNo} hotel={hotel} nights={nights} />
                ))}
              </div>
            </div>
          )}
        </section>
      ))}

      <section>
        <h2 className="font-display font-bold text-ink text-base mb-4">
          他の都道府県から探す
        </h2>
        <Link href="/" className="pill-button pill-button-inactive text-xs">
          47都道府県の一覧を見る
        </Link>
      </section>
    </main>
  );
}
