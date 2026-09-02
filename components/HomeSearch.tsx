"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import SearchForm, { SearchValues } from "@/components/SearchForm";
import HotelList from "@/components/HotelList";
import HotelListSkeleton from "@/components/HotelListSkeleton";
import type { HotelResult } from "@/lib/rakuten";
import { nightsBetween } from "@/lib/dates";
import { regionKeyForPrefecture, type RegionKey } from "@/lib/prefectures";
import type { TravelBand } from "@/lib/distanceBands";

/**
 * トップページの検索フォーム・検索結果部分(インタラクティブ)。
 * 2026-08-20: SEO対策として、H1・特徴紹介・FAQ等の静的な部分はサーバーコンポーネント
 * (app/page.tsx側)に残し、useSearchParams/useStateが必要なこの部分だけを
 * クライアントコンポーネントとして切り出した(生HTMLにH1が含まれない問題への対応)。
 */
export default function HomeSearch() {
  const searchParams = useSearchParams();
  const prefillCode = searchParams.get("prefill");
  const prefillRegion: RegionKey | undefined = prefillCode
    ? regionKeyForPrefecture(prefillCode)
    : undefined;
  const prefillBandParam = searchParams.get("band");
  const prefillBand: TravelBand | undefined =
    prefillBandParam === "shortTrip" || prefillBandParam === "farTrip"
      ? prefillBandParam
      : undefined;
  const prefillCheckin = searchParams.get("checkin") ?? undefined;
  const prefillCheckout = searchParams.get("checkout") ?? undefined;
  const prefillMode = prefillRegion ? "region" : prefillBand ? "band" : undefined;
  const prefillMaxChargeParam = searchParams.get("maxCharge");
  const prefillMaxCharge = prefillMaxChargeParam
    ? Number(prefillMaxChargeParam)
    : undefined;

  const [hotels, setHotels] = useState<HotelResult[]>([]);
  const [originLabel, setOriginLabel] = useState<string>();
  const [rangeLabel, setRangeLabel] = useState<string>();
  const [searchedAreas, setSearchedAreas] = useState<string[]>([]);
  const [areaErrors, setAreaErrors] = useState<
    { area: string; error: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [searched, setSearched] = useState(false);
  const [pickedHotelNo, setPickedHotelNo] = useState<number | null>(null);
  const [nights, setNights] = useState(1);

  function buildQuery(values: SearchValues) {
    const query = new URLSearchParams({
      address: values.address,
      checkinDate: values.checkinDate,
      checkoutDate: values.checkoutDate,
      mode: values.mode,
      sort: values.sort,
      adults: String(values.adults),
      children: String(values.children),
      infants: String(values.infants),
      onsen: values.onsen ? "1" : "0",
      nonSmoking: values.nonSmoking ? "1" : "0",
    });
    if (values.band) query.set("band", values.band);
    if (values.region) query.set("region", values.region);
    if (values.maxCharge) query.set("maxCharge", String(values.maxCharge));
    return query;
  }

  async function handleSearch(values: SearchValues) {
    setLoading(true);
    setError(undefined);
    setSearched(true);
    setPickedHotelNo(null);
    setSearchedAreas([]);
    setNights(nightsBetween(values.checkinDate, values.checkoutDate));

    try {
      // 先に「どのエリアを検索するか」だけ軽量に取得し、待ち時間中に表示する
      const areaQuery = new URLSearchParams({
        address: values.address,
        mode: values.mode,
      });
      if (values.band) areaQuery.set("band", values.band);
      if (values.region) areaQuery.set("region", values.region);

      fetch(`/api/areas?${areaQuery.toString()}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.areas) setSearchedAreas(d.areas);
        })
        .catch(() => {
          /* 進捗表示用の補助情報なので、失敗しても無視してよい */
        });

      const query = buildQuery(values);
      const res = await fetch(`/api/hotels?${query.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "検索に失敗しました");
        setHotels([]);
        return;
      }

      setHotels(data.hotels);
      setOriginLabel(data.origin?.matchedAddress);
      setRangeLabel(data.rangeLabel);
      setSearchedAreas(data.searchedAreas ?? []);
      setAreaErrors(data.errors ?? []);
    } catch (e) {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  function pickRandomHotel() {
    if (hotels.length === 0) return;
    const picked = hotels[Math.floor(Math.random() * hotels.length)];
    setPickedHotelNo(picked.hotelNo);
    requestAnimationFrame(() => {
      document
        .getElementById(`hotel-${picked.hotelNo}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  return (
    <>
      <div id="search-form">
        <SearchForm
          // 「こんな時に」カードは同一ページ("/")内でクエリだけ変えて遷移するため、
          // keyを付けないとReactがコンポーネントを再マウントせず、useStateの初期値
          // (initialCheckinDate等)が更新後の値に反映されない(2026-08-14に実機検証で発覚)。
          key={searchParams.toString()}
          onSearch={handleSearch}
          loading={loading}
          initialMode={prefillMode}
          initialRegion={prefillRegion}
          initialBand={prefillBand}
          initialCheckinDate={prefillCheckin}
          initialCheckoutDate={prefillCheckout}
          initialMaxCharge={prefillMaxCharge}
        />
      </div>

      <section className="mt-8">
        {error && (
          <p className="text-red-600 font-body text-sm mb-4">{error}</p>
        )}

        {loading && (
          <div>
            <div className="text-sub font-body text-sm mb-3">
              <p>空室情報を取得中…(複数エリアを検索しているため少し時間がかかります)</p>
              {searchedAreas.length > 0 && (
                <p className="text-xs font-mono mt-1">
                  検索中: {searchedAreas.join(" / ")}
                </p>
              )}
            </div>
            <HotelListSkeleton />
          </div>
        )}

        {!loading && searched && !error && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              {searchedAreas.length > 0 && (
                <p className="text-sub text-xs font-mono">
                  {rangeLabel && `${rangeLabel} / `}
                  検索エリア: {searchedAreas.join(" / ")}
                </p>
              )}
              {hotels.length > 0 && (
                <button
                  type="button"
                  onClick={pickRandomHotel}
                  className="pill-button pill-button-inactive text-xs"
                >
                  🎲 おまかせで1件選ぶ
                </button>
              )}
            </div>
            {areaErrors.length > 0 && (
              <div className="border border-red-200 bg-red-50 rounded-xl p-3 mb-4">
                <p className="text-red-600 text-xs font-mono mb-1">
                  一部エリアの検索でエラーが発生しました(結果には反映されていません):
                </p>
                {areaErrors.map((e) => (
                  <p key={e.area} className="text-red-500 text-xs font-mono">
                    {e.area}: {e.error}
                  </p>
                ))}
              </div>
            )}
            <HotelList
              hotels={hotels}
              originLabel={originLabel}
              highlightedHotelNo={pickedHotelNo}
              nights={nights}
            />
          </>
        )}
      </section>
    </>
  );
}
