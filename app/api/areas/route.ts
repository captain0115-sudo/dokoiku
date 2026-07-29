import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/geocode";
import { prefecturesInBand, defaultPrefectures, TravelBand, BAND_LABELS } from "@/lib/distanceBands";
import { prefecturesInRegion, RegionKey, REGION_LABELS } from "@/lib/prefectures";

const MAX_AREAS_PER_SEARCH = 8;

/**
 * 実際に楽天APIへは問い合わせず、
 * 「どのエリアを検索対象にするか」だけを素早く返すエンドポイント。
 * 検索中の進捗表示(「検索エリア: 東京都 / 神奈川県 / …」)に使う。
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const address = params.get("address");
  const mode = params.get("mode");
  const band = params.get("band") as TravelBand | null;
  const region = params.get("region") as RegionKey | null;

  if (!address) {
    return NextResponse.json({ error: "address は必須です" }, { status: 400 });
  }

  try {
    const geo = await geocodeAddress(address);
    if (!geo) {
      return NextResponse.json(
        { error: "住所から位置情報を特定できませんでした" },
        { status: 404 }
      );
    }

    let areas: string[];
    let rangeLabel: string;

    if (mode === "region" && region && REGION_LABELS[region]) {
      areas = prefecturesInRegion(region)
        .slice(0, MAX_AREAS_PER_SEARCH)
        .map((p) => p.name);
      rangeLabel = REGION_LABELS[region];
    } else if (mode === "band" && band && BAND_LABELS[band]) {
      areas = prefecturesInBand(geo.lat, geo.lng, band)
        .slice(0, MAX_AREAS_PER_SEARCH)
        .map((p) => p.name);
      rangeLabel = BAND_LABELS[band];
    } else {
      areas = defaultPrefectures(geo.lat, geo.lng)
        .slice(0, MAX_AREAS_PER_SEARCH)
        .map((p) => p.name);
      rangeLabel = "指定なし";
    }

    return NextResponse.json({ areas, rangeLabel });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "エリア判定中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
