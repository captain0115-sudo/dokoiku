import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Logo from "@/components/Logo";
import HotelCard from "@/components/HotelCard";
import ShareButtons from "@/components/ShareButtons";
import {
  findPrefecture,
  regionKeyForPrefecture,
  prefecturesInRegion,
  REGION_LABELS,
  type RegionKey,
} from "@/lib/prefectures";
import { searchVacantHotelsByArea, type HotelResult } from "@/lib/rakuten";
import { nightsBetween } from "@/lib/dates";
import { AREA_VARIANT_LIST, type AreaVariant } from "@/lib/areaVariants";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.dokoiku.tokyo";

/** 都道府県コード+バリエーションから generateMetadata 用のMetadataを組み立てる */
export function buildAreaMetadata(code: string, variant: AreaVariant): Metadata {
  const pref = findPrefecture(code);
  if (!pref) return {};

  const title = variant.buildTitle(pref.name);
  const description = variant.buildDescription(pref.name, pref.catchphrase);

  return {
    title,
    description,
    alternates: { canonical: `/areas/${pref.middleClassCode}${variant.pathSuffix}` },
    openGraph: { title, description },
  };
}

type Props = { code: string; variant: AreaVariant };

export default async function AreaVariantPage({ code, variant }: Props) {
  const pref = findPrefecture(code);
  if (!pref) notFound();

  const regionKey = regionKeyForPrefecture(pref.middleClassCode);
  const regionLabel = regionKey ? REGION_LABELS[regionKey] : undefined;
  const neighbors = regionKey
    ? prefecturesInRegion(regionKey)
        .filter((p) => p.middleClassCode !== pref.middleClassCode)
        .slice(0, 3)
    : [];

  const { checkinDate, checkoutDate } = variant.dateRange();
  const nights = nightsBetween(checkinDate, checkoutDate);

  let hotels: HotelResult[] = [];
  let fetchFailed = false;

  try {
    hotels = await searchVacantHotelsByArea({
      checkinDate,
      checkoutDate,
      areaLat: pref.lat,
      areaLng: pref.lng,
      homeLat: pref.lat,
      homeLng: pref.lng,
      guests: { adults: 1 },
      filters: variant.filters,
    });
    hotels.sort((a, b) => a.hotelMinCharge - b.hotelMinCharge);
    // 「◯円以下」を明示するバリエーション(例: budget)では、楽天APIのmaxCharge
    // フィルタ基準(1部屋あたりの目安額)と実際に表示する金額(人数条件に
    // 一致した実料金)が乖離することがあるため、実際に表示する金額の側でも
    // 再度絞り込み、誇大な表示を防ぐ(lib/areaVariants.ts の maxDisplayCharge参照)。
    if (variant.maxDisplayCharge != null) {
      hotels = hotels.filter((h) => h.hotelMinCharge <= variant.maxDisplayCharge!);
    }
    hotels = hotels.slice(0, 15);
  } catch {
    fetchFailed = true;
  }

  const pageUrl = `${siteUrl}/areas/${pref.middleClassCode}${variant.pathSuffix}`;
  const heading = variant.buildHeading(pref.name);
  const introExtra = variant.buildIntroExtra(pref.name);
  const otherVariants = AREA_VARIANT_LIST.filter((v) => v.key !== variant.key);
  const faqItems = variant.buildFaq?.(pref.name) ?? [];

  const faqJsonLd =
    faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }
      : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "どこいく", item: siteUrl },
      { "@type": "ListItem", position: 2, name: heading, item: pageUrl },
    ],
  };

  // 実際に取得できた空室のみを構造化データ化する(架空の在庫を作らない)
  const itemListJsonLd =
    hotels.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListOrder: "https://schema.org/ItemListOrderAscending",
          numberOfItems: hotels.length,
          itemListElement: hotels.map((hotel, index) => ({
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
      {faqJsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <div className="mb-8">
        <Link href="/">
          <Logo />
        </Link>
      </div>

      <p className="font-mono text-sub text-xs tracking-wideLabel mb-2 uppercase">
        {checkinDate} 〜 {checkoutDate}({nights}泊)の例
      </p>
      <h1 className="font-display font-black text-3xl text-ink mb-3">
        {heading}
      </h1>
      <p className="text-sub font-body text-sm leading-relaxed mb-8">
        {pref.catchphrase}が魅力の{pref.name}
        {regionLabel && `は${regionLabel}地方に位置し`}
        {neighbors.length > 0 &&
          `、${neighbors.map((n) => n.name).join("・")}などが近隣にあります`}
        。「どこいく」は、行き先を決める前に日付から空室のある宿を探せる
        サービスです。ここでは{checkinDate}〜{checkoutDate}を例に、
        {pref.name}で現在空室のある宿を価格の安い順に表示しています。
        {introExtra && ` ${introExtra}`}
        ご自身の日程・人数で検索したい場合は、下のボタンからトップページの
        検索フォームをお使いください。
      </p>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Link
          href={`/?mode=region&prefill=${pref.middleClassCode}${
            variant.maxDisplayCharge != null
              ? `&maxCharge=${variant.maxDisplayCharge}`
              : ""
          }`}
          className="inline-block px-6 py-3 rounded-full bg-accent text-white font-display font-bold text-sm hover:brightness-110 transition"
        >
          自分の日程で{pref.name}を検索する
        </Link>
        <ShareButtons url={pageUrl} text={`${heading} | どこいく`} />
      </div>

      {fetchFailed && (
        <div className="border border-red-200 bg-red-50 rounded-xl p-4 text-red-600 text-sm font-body mb-8">
          現在、空室情報の取得に失敗しています。しばらくしてから再度アクセスしてください。
        </div>
      )}

      {!fetchFailed && hotels.length === 0 && (
        <div className="bg-surface border border-line rounded-2xl p-8 text-center text-sub font-body text-sm mb-8">
          {variant.emptyMessage}
        </div>
      )}

      {hotels.length > 0 && (
        <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm mb-10">
          <div className="px-5 py-4 border-b border-line">
            <h2 className="font-display font-bold text-ink text-base">
              {pref.name}の空室({hotels.length}件)
            </h2>
          </div>
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

      <section className="mb-10">
        <h2 className="font-display font-bold text-ink text-base mb-3">
          {pref.name}の他の探し方
        </h2>
        <div className="flex flex-wrap gap-2">
          {otherVariants.map((v) => (
            <Link
              key={v.key}
              href={`/areas/${pref.middleClassCode}${v.pathSuffix}`}
              className="pill-button pill-button-inactive text-xs"
            >
              {v.navLabel}
            </Link>
          ))}
        </div>
      </section>

      {faqItems.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display font-bold text-ink text-base mb-3">
            よくある質問
          </h2>
          <div className="flex flex-col gap-3">
            {faqItems.map((item) => (
              <details
                key={item.q}
                className="rounded-2xl border border-line bg-surface p-4 group"
              >
                <summary className="font-body font-semibold text-sm text-ink cursor-pointer list-none flex items-center justify-between gap-2">
                  {item.q}
                  <span className="text-sub text-xs font-mono shrink-0 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="text-sub text-xs font-body leading-relaxed mt-2">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {neighbors.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display font-bold text-ink text-base mb-3">
            {regionLabel}地方の他の都道府県
          </h2>
          <div className="flex flex-wrap gap-2">
            {neighbors.map((p) => (
              <Link
                key={p.middleClassCode}
                href={`/areas/${p.middleClassCode}${variant.pathSuffix}`}
                className="pill-button pill-button-inactive text-xs"
              >
                {p.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display font-bold text-ink text-base mb-4">
          全都道府県から探す
        </h2>
        <div className="flex flex-col gap-4">
          {(Object.keys(REGION_LABELS) as RegionKey[]).map((key) => {
            const prefsInRegion = prefecturesInRegion(key).filter(
              (p) => p.middleClassCode !== pref.middleClassCode
            );
            if (prefsInRegion.length === 0) return null;
            return (
              <div key={key}>
                <p className="text-sub text-xs font-mono tracking-wideLabel uppercase mb-2">
                  {REGION_LABELS[key]}
                </p>
                <div className="flex flex-wrap gap-2">
                  {prefsInRegion.map((p) => (
                    <Link
                      key={p.middleClassCode}
                      href={`/areas/${p.middleClassCode}${variant.pathSuffix}`}
                      className="pill-button pill-button-inactive text-xs"
                    >
                      {p.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
