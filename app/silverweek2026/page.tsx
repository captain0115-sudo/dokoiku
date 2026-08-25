import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import HotelCard from "@/components/HotelCard";
import SilverWeekAreaRetry from "@/components/SilverWeekAreaRetry";
import ShareButtons from "@/components/ShareButtons";
import { findPrefecture, type Prefecture } from "@/lib/prefectures";
import { searchVacantHotelsByArea, type HotelResult } from "@/lib/rakuten";
import { runWithConcurrencyLimit } from "@/lib/concurrency";
import { nightsBetween, resolvePastDateRange } from "@/lib/dates";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.dokoiku.tokyo";

// 夏休み(お盆〜8月後半)特集は終了。2026-08-25、次の特集として
// 2026年9月19日(土)〜23日(水・秋分の日)の5連休「シルバーウィーク」に切り替え。
// 敬老の日(9/21)と秋分の日(9/23)の間の9/22が「国民の休日」となり5連休が成立する、
// 2015年以来11年ぶりの現象(内閣府・国立天文台の祝日確定情報に基づく実データ)。
// 連休後半の敬老の日(月)〜秋分の日(水)の2泊を代表例として採用。
// タイトル・meta descriptionはこのテーマ日付を使うが、実際の検索には
// resolvePastDateRange()で「今日」以降にスライドさせた日付を使う
// (このテーマ日付が過去になると楽天APIが全件エラーになるため、/obon2026と同じ対策)。
const THEME_CHECKIN_DATE = "2026-09-21";
const THEME_CHECKOUT_DATE = "2026-09-23";

// 都市・温泉地・避暑地・海と、行き先の傾向が偏らないよう編集部で選定した6エリア。
// /obon2026と同じ選定基準を踏襲(「人気ランキング」等の裏付けのない順位付けはしない)。
const FEATURED_CODES = [
  "hokkaido",
  "tokyo",
  "kanagawa",
  "shizuoka",
  "osaka",
  "okinawa",
];

// ページは事前生成せず初回アクセス時に生成 → 1時間キャッシュ(ISR)。
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "11年ぶりのシルバーウィーク(9/19〜23)空室ホテル特集 | どこいく",
  description:
    "2026年9月19日〜23日は敬老の日・国民の休日・秋分の日が重なる5連休(2015年以来11年ぶり)。北海道・東京・神奈川・静岡・大阪・沖縄で今空いているホテルを価格順にまとめました。日付から探すホテル検索「どこいく」。",
  alternates: { canonical: "/silverweek2026" },
  openGraph: {
    title: "11年ぶりのシルバーウィーク 空室ホテル特集 | どこいく",
    description:
      "9月19日〜23日の5連休、北海道・東京・神奈川・静岡・大阪・沖縄で今空いているホテルを価格順に一覧表示。",
  },
};

type AreaSection = {
  pref: Prefecture;
  hotels: HotelResult[];
  fetchFailed: boolean;
};

export default async function SilverWeek2026Page() {
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
    // /obon2026で確認済みのため、同じく完全逐次(1)で実行する。
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
  const pageUrl = `${siteUrl}/silverweek2026`;
  const allListedHotels = sections.flatMap((s) => s.hotels);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "どこいく", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "シルバーウィーク空室ホテル特集",
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
        11年ぶりのシルバーウィーク 空室ホテル特集
      </h1>
      <p className="text-sub font-body text-sm leading-relaxed mb-8">
        2026年9月19日(土)〜23日(水・秋分の日)は、敬老の日(9/21)と秋分の日(9/23)の間の
        9月22日が「国民の休日」となり、土日と合わせて5連休になります。これは2015年以来
        11年ぶりです。ここでは連休後半にあたる9月21日〜23日を例に、北海道・東京・神奈川・
        静岡・大阪・沖縄の6エリアで現在空室のあるホテルを価格の安い順にまとめました。
        掲載しているのは実際に取得できた空室のみです。ご自身の日程・行き先で探したい場合は、
        下のボタンからトップページの検索フォームをお使いください(このページの日付が
        自動で入力された状態で開きます)。
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
          text="11年ぶりのシルバーウィーク 空室ホテル特集 | どこいく"
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
            <SilverWeekAreaRetry
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
