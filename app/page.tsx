"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SearchForm, { SearchValues } from "@/components/SearchForm";
import HotelList from "@/components/HotelList";
import HotelListSkeleton from "@/components/HotelListSkeleton";
import Logo from "@/components/Logo";
import type { HotelResult } from "@/lib/rakuten";
import { nightsBetween } from "@/lib/dates";
import { regionKeyForPrefecture, type RegionKey } from "@/lib/prefectures";

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const prefillCode = searchParams.get("prefill");
  const prefillRegion: RegionKey | undefined = prefillCode
    ? regionKeyForPrefecture(prefillCode)
    : undefined;
  const prefillCheckin = searchParams.get("checkin") ?? undefined;
  const prefillCheckout = searchParams.get("checkout") ?? undefined;

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
    <main className="max-w-3xl mx-auto px-4 py-14">
      <header className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-accentSoft via-surface to-white px-6 py-10 sm:px-10 sm:py-14 mb-10">
        {/* 画像アセット不要な範囲での装飾(ぼかした円の重なりで奥行きを演出) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-accent/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-price/10 blur-3xl"
        />
        <div className="relative">
          <div className="mb-5">
            <Logo />
          </div>
          <h1 className="font-display font-black text-3xl md:text-5xl text-ink leading-tight">
            行き先じゃなく、
            <br className="sm:hidden" />
            日付から。
          </h1>
          <p className="text-sub mt-4 font-body text-sm md:text-base max-w-md">
            日付と自宅からの範囲で、今空いているホテルを価格順に見つけます。
          </p>
          <Link
            href="/obon2026"
            className="inline-flex items-center gap-1.5 mt-6 px-4 py-2 rounded-full bg-white/70 border border-line text-ink text-xs font-mono font-semibold hover:bg-white transition"
          >
            🎋 季節特集: お盆休み2026(8/13〜8/16)の空室ホテルを見る
          </Link>
        </div>
      </header>

      <SearchForm
        onSearch={handleSearch}
        loading={loading}
        initialMode={prefillRegion ? "region" : undefined}
        initialRegion={prefillRegion}
        initialCheckinDate={prefillCheckin}
        initialCheckoutDate={prefillCheckout}
      />

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
    </main>
  );
}
