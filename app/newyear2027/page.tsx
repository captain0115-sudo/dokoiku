import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import HotelCard from "@/components/HotelCard";
import NewyearAreaRetry from "@/components/NewyearAreaRetry";
import ShareButtons from "@/components/ShareButtons";
import { findPrefecture, type Prefecture } from "@/lib/prefectures";
import { searchVacantHotelsByArea, type HotelResult } from "@/lib/rakuten";
import { runWithConcurrencyLimit } from "@/lib/concurrency";
import { nightsBetween, resolvePastDateRange } from "@/lib/dates";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.dokoiku.tokyo";

// スポーツの日3連休特集の次、2026年の年末年始特集(2026-10-08着手)。
// 大晦日(12/31)・元日(1/1)を挟む12/30(水)〜1/1(金)の2泊を基準日程とする。
// 成長戦略(年末年始特集を10月中に作成・公開)に基づき、年末の繁忙期より前に
// 公開してGoogleのクロール・インデックスに猶予を持たせる狙い。
// /obon2026・/silverweek2026・/sportsday2026と同じ設計を踏襲する。
const THEME_CHECKIN_DATE = "2026-12-30";
const THEME_CHECKOUT_DATE = "2027-01-01";

// これまでの特集(シルバーウィーク: 北海道・東京・神奈川・静岡・大阪・沖縄、
// スポーツの日: 宮城・長野・愛知・京都・広島・福岡)と重複しない6エリアを選定。
// 年末年始は初詣・温泉・雪景色の需要が高いため、温泉地を中心に地方を分散させた
// (どこいくのミッション「旅行者を分散させ、様々な地方の魅力に気づいてもらう」
// にも沿う選定、詳細は[[どこいく/mission-vision]]参照)。
const FEATURED_CODES = [
  "niigata",
  "ishikawa",
  "gifu",
  "hyogo",
  "ehime",
  "oita",
];

// ページは事前生成せず初回アクセス時に生成 → 1時間キャッシュ(ISR)。
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "年末年始(12/30〜1/1)空室ホテル特集 | どこいく",
  description:
    "2026年12月30日〜2027年1月1日、大晦日・元日を挟む年末年始の2泊。新潟・石川・岐阜・兵庫・愛媛・大分で今空いているホテルを価格順にまとめました。日付から探すホテル検索「どこいく」。",
  alternates: { canonical: "/newyear2027" },
  openGraph: {
    title: "年末年始 空室ホテル特集 | どこいく",
    description:
      "12月30日〜1月1日の年末年始、新潟・石川・岐阜・兵庫・愛媛・大分で今空いているホテルを価格順に一覧表示。",
  },
};

type AreaSection = {
  pref: Prefecture;
  hotels: HotelResult[];
  fetchFailed: boolean;
};

export default async function Newyear2027Page() {
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
    // 6エリア同時取得は楽天API側の429(レート制限)を誘発しやすいことが
    // /obon2026・/silverweek2026・/sportsday2026で確認済みのため、
    // 同じく完全逐次(1)で実行する。
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
  const pageUrl = `${siteUrl}/newyear2027`;
  const allListedHotels = sections.flatMap((s) => s.hotels);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "どこいく", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "年末年始 空室ホテル特集",
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
        年末年始 空室ホテル特集
      </h1>
      <p className="text-sub font-body text-sm leading-relaxed mb-8">
        2026年12月30日(水)〜2027年1月1日(金)、大晦日・元日を挟む年末年始の2泊です。
        ここでは新潟・石川・岐阜・兵庫・愛媛・大分の6エリアで現在空室のあるホテルを
        価格の安い順にまとめました。初詣・温泉・雪景色など、年末年始らしい過ごし方が
        できるエリアを選んでいます。掲載しているのは実際に取得できた空室のみです。
        ご自身の日程・行き先で探したい場合は、下のボタンからトップページの検索フォームを
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
          text="年末年始 空室ホテル特集 | どこいく"
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
            <NewyearAreaRetry
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
