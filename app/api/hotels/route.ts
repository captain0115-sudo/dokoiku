import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/geocode";
import { searchVacantHotelsByArea, HotelResult } from "@/lib/rakuten";
import { runWithConcurrencyLimit } from "@/lib/concurrency";
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

  if (!checkinDate || !checkoutDate) {
    return NextResponse.json(
      { error: "checkinDate, checkoutDate は必須です" },
      { status: 400 }
    );
  }

  // region指定検索(都道府県・地方名で絞り込み)は「自宅からの距離」を使わないため、
  // 本来address(現在地)は不要。以前はband/none等と同じ扱いでaddress必須にしていたが、
  // これがエリアページ(/areas/[code])の「自分の日程で検索する」CTAからトップページに
  // 戻った際に追加で住所入力・位置情報許可を求める形になり、離脱要因になっていた
  // (2026-09-22、hotel_clickのトップページ一極集中の一因として調査・特定)。
  const regionModeWithoutAddress =
    mode === "region" && region && REGION_LABELS[region] && !address;

  if (!address && !regionModeWithoutAddress) {
    return NextResponse.json(
      { error: "address, checkinDate, checkoutDate は必須です" },
      { status: 400 }
    );
  }

  try {
    const geo = address ? await geocodeAddress(address) : null;
    if (address && !geo) {
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
    } else if (mode === "band" && band && BAND_LABELS[band] && geo) {
      targetPrefectures = prefecturesInBand(geo.lat, geo.lng, band);
      rangeLabel = BAND_LABELS[band];
    } else if (geo) {
      targetPrefectures = defaultPrefectures(geo.lat, geo.lng);
      rangeLabel = "指定なし(自宅からある程度離れたエリア)";
    } else {
      // regionModeWithoutAddressで通ってきたがregion指定自体が不正だった場合の保険
      // (通常はここに到達しない)
      return NextResponse.json(
        { error: "address, checkinDate, checkoutDate は必須です" },
        { status: 400 }
      );
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
            // 住所なし(region指定のみ)の場合は「自宅からの距離」自体が無意味なので、
            // エリアページ(components/AreaVariantPage.tsx)と同じくエリア中心自身を
            // 基点にする(距離表示は「エリア中心からXkm」という参考値になる)。
            homeLat: geo?.lat ?? pref.lat,
            homeLng: geo?.lng ?? pref.lng,
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
