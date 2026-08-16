import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import HotelCard from "@/components/HotelCard";
import ObonAreaRetry from "@/components/ObonAreaRetry";
import ShareButtons from "@/components/ShareButtons";
import { findPrefecture, type Prefecture } from "@/lib/prefectures";
import { searchVacantHotelsByArea, type HotelResult } from "@/lib/rakuten";
import { runWithConcurrencyLimit } from "@/lib/concurrency";
import { nightsBetween, resolvePastDateRange } from "@/lib/dates";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.dokoiku.tokyo";

// お盆(8/13〜8/16)は終了したため、2026-08-16にテーマを「夏休み後半」に切り替え。
// 8月最終週の週末(8/22土〜8/24月)を代表例として採用。実際の休暇期間は人により
// 異なるため、本文中でもその旨を明記している。
// タイトル・meta descriptionはこのテーマ日付を使うが、実際の検索には
// resolvePastDateRange()で「今日」以降にスライドさせた日付を使う
// (このテーマ日付が過去になると楽天APIが全件エラーになるため。2026-08-14発覚)。
const THEME_CHECKIN_DATE = "2026-08-22";
const THEME_CHECKOUT_DATE = "2026-08-24";

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
  title: "夏休み後半(8/22〜8/24)の空室ホテル特集 | どこいく",
  description:
    "2026年の夏休み後半(8月22日〜24日を例に)、北海道・東京・神奈川・静岡・大阪・沖縄で今空いているホテルを価格順にまとめました。日付から探すホテル検索「どこいく」。",
  alternates: { canonical: "/obon2026" },
  openGraph: {
    title: "夏休み後半の空室ホテル特集 | どこいく",
    description:
      "北海道・東京・神奈川・静岡・大阪・沖縄で、夏休み後半(8/22〜8/24)に今空いているホテルを価格順に一覧表示。",
  },
};

type AreaSection = {
  pref: Prefecture;
  hotels: HotelResult[];
  fetchFailed: boolean;
};

export default async function Obon2026Page() {
  const { checkinDate: CHECKIN_DATE, checkoutDate: CHECKOUT_DATE } =
    resolvePastDateRange(THEME_CHECKIN_DATE, THEME_CHECKOUT_DATE);

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
    // 6エリア同時取得は楽天API側の429(レート制限)を誘発しやすいことを確認済み
    // (2026-08-13)。同時実行数を3→2に絞った後も本番で単発の失敗(エリアはランダム)
    // が残ったため、さらに1(完全逐次)まで絞った。このページはISRで1時間に1回
    // しか生成されないため、逐次化による生成時間の増加は許容できる。
    1
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
        name: "夏休み後半の空室ホテル特集",
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
        夏休み後半の空室ホテル特集
      </h1>
      <p className="text-sub font-body text-sm leading-relaxed mb-8">
        夏休みも後半戦。ここでは8月最終週の週末にあたる2026年8月22日〜24日を例に、
        北海道・東京・神奈川・静岡・大阪・沖縄の6エリアで現在空室のあるホテルを価格の
        安い順にまとめました。掲載しているのは実際に取得できた空室のみです。ご自身の
        日程・行き先で探したい場合は、下のボタンからトップページの検索フォームを
        お使いください(このページの日付が自動で入力された状態で開きます)。
        {CHECKIN_DATE !== THEME_CHECKIN_DATE && (
          <>
            <br />
            ※{THEME_CHECKIN_DATE}は既に過去の日付のため、実際の検索条件は
            {CHECKIN_DATE}〜{CHECKOUT_DATE}に自動で切り替えています。
          </>
        )}
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
          text="夏休み後半の空室ホテル特集 | どこいく"
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
            <ObonAreaRetry
              areaCode={pref.middleClassCode}
              prefName={pref.name}
              nights={nights}
            />
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
                  <HotelCard
                    key={hotel.hotelNo}
                    hotel={hotel}
                    nights={nights}
                    distanceLabel={`${pref.name}の中心部から`}
                  />
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
