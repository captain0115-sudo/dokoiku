import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/geocode";
import { searchVacantHotelsByArea, HotelResult } from "@/lib/rakuten";
import {
  prefecturesInBand,
  defaultPrefectures,
  TravelBand,
  BAND_LABELS,
} from "@/lib/distanceBands";
import {
  prefecturesInRegion,
  RegionKey,
  REGION_LABELS,
  Prefecture,
} from "@/lib/prefectures";

// 1回の検索で問い合わせる地点数の上限(APIレート制限・応答時間への配慮)。
const MAX_AREAS_PER_SEARCH = 8;

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const address = params.get("address");
  const checkinDate = params.get("checkinDate");
  const checkoutDate = params.get("checkoutDate");
  const mode = params.get("mode"); // "band" | "region" | "none" | null
  const band = params.get("band") as TravelBand | null;
  const region = params.get("region") as RegionKey | null;
  const sort = params.get("sort") === "desc" ? "desc" : "asc";

  const guests = {
    adults: Number(params.get("adults") ?? "1"),
    children: Number(params.get("children") ?? "0"),
    infants: Number(params.get("infants") ?? "0"),
    rooms: Number(params.get("rooms") ?? "1"),
  };

  const filters = {
    onsen: params.get("onsen") === "1",
    nonSmoking: params.get("nonSmoking") === "1",
    maxCharge: params.get("maxCharge")
      ? Number(params.get("maxCharge"))
      : undefined,
  };

  if (!address || !checkinDate || !checkoutDate) {
    return NextResponse.json(
      { error: "address, checkinDate, checkoutDate は必須です" },
      { status: 400 }
    );
  }

  try {
    const geo = await geocodeAddress(address);
    if (!geo) {
      return NextResponse.json(
        { error: "住所から位置情報を特定できませんでした" },
        { status: 404 }
      );
    }

    let targetPrefectures: Array<Prefecture & { distanceKm?: number }> = [];
    let rangeLabel: string;

    if (mode === "region" && region && REGION_LABELS[region]) {
      targetPrefectures = prefecturesInRegion(region);
      rangeLabel = REGION_LABELS[region];
    } else if (mode === "band" && band && BAND_LABELS[band]) {
      targetPrefectures = prefecturesInBand(geo.lat, geo.lng, band);
      rangeLabel = BAND_LABELS[band];
    } else {
      targetPrefectures = defaultPrefectures(geo.lat, geo.lng);
      rangeLabel = "指定なし(自宅からある程度離れたエリア)";
    }

    targetPrefectures = targetPrefectures.slice(0, MAX_AREAS_PER_SEARCH);

    if (targetPrefectures.length === 0) {
      return NextResponse.json({
        origin: geo,
        rangeLabel,
        searchedAreas: [],
        count: 0,
        hotels: [],
      });
    }

    // 同時に大量のリクエストを送るとAPI側のレート制限に引っかかる可能性があるため、
    // 同時実行数を絞りつつ問い合わせる
    const settledResults = await runWithConcurrencyLimit(
      targetPrefectures.map(
        (pref) => () =>
          searchVacantHotelsByArea({
            checkinDate,
            checkoutDate,
            areaLat: pref.lat,
            areaLng: pref.lng,
            homeLat: geo.lat,
            homeLng: geo.lng,
            guests,
            filters,
          }).then(
            (hotels): HotelResult[] =>
              // どのエリアの検索で見つかったかをタグ付けしておく(グルーピング表示用)
              hotels.map((h) => ({ ...h, areaName: pref.name }))
          )
      ),
      3
    );

    const hotels: HotelResult[] = settledResults
      .filter(
        (r): r is PromiseFulfilledResult<HotelResult[]> =>
          r.status === "fulfilled"
      )
      .flatMap((r) => r.value);

    const failed = settledResults
      .map((r, i) => ({ r, pref: targetPrefectures[i] }))
      .filter(
        (x): x is { r: PromiseRejectedResult; pref: (typeof targetPrefectures)[number] } =>
          x.r.status === "rejected"
      )
      .map((x) => ({
        area: x.pref.name,
        error: x.r.reason?.message ?? String(x.r.reason),
      }));

    if (failed.length > 0) {
      console.error("楽天API エリア検索でエラーが発生:", failed);
    }

    hotels.sort((a, b) =>
      sort === "asc"
        ? a.hotelMinCharge - b.hotelMinCharge
        : b.hotelMinCharge - a.hotelMinCharge
    );

    return NextResponse.json({
      origin: geo,
      rangeLabel,
      searchedAreas: targetPrefectures.map((p) => p.name),
      count: hotels.length,
      hotels,
      errors: failed.length > 0 ? failed : undefined,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "検索中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

/**
 * 同時実行数を絞ってPromiseを実行するヘルパー。
 * 各タスクの成功/失敗は Promise.allSettled と同じ形式で返す。
 */
async function runWithConcurrencyLimit<T>(
  tasks: Array<() => Promise<T>>,
  limit: number
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = new Array(tasks.length);
  let cursor = 0;

  async function worker() {
    while (cursor < tasks.length) {
      const index = cursor++;
      try {
        const value = await tasks[index]();
        results[index] = { status: "fulfilled", value };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, worker);
  await Promise.all(workers);
  return results;
}
