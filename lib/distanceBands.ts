import { PREFECTURES, Prefecture } from "./prefectures";
import { haversineDistanceKm } from "./distance";

export type TravelBand = "shortTrip" | "farTrip";

export const BAND_LABELS: Record<TravelBand, string> = {
  shortTrip: "小旅行",
  farTrip: "遠出",
};

export const BAND_HINTS: Record<TravelBand, string> = {
  shortTrip: "〜250km",
  farTrip: "250km〜",
};

// 自宅からの直線距離のおおよその目安(km)。実際の道のり・所要時間とは異なります。
const BAND_RANGES: Record<TravelBand, { min: number; max: number }> = {
  shortTrip: { min: 0, max: 250 },
  farTrip: { min: 250, max: Infinity },
};

// 「指定しない」場合のデフォルト範囲。日帰りできてしまう至近距離は除外し、
// 泊まりがいのあるエリアを中心に幅広く検索する。
const DEFAULT_RANGE = { min: 80, max: Infinity };

/**
 * 自宅座標から見て、指定した移動範囲(band)に該当する都道府県一覧を返す。
 * 判定は都道府県庁所在地の座標との直線距離ベースの簡易版。
 */
export function prefecturesInBand(
  homeLat: number,
  homeLng: number,
  band: TravelBand
): Array<Prefecture & { distanceKm: number }> {
  return filterByRange(homeLat, homeLng, BAND_RANGES[band]);
}

/**
 * 移動範囲が指定されなかった場合のデフォルト候補
 * (日帰り圏内の至近距離は除外し、自宅に近い順に返す)
 */
export function defaultPrefectures(
  homeLat: number,
  homeLng: number
): Array<Prefecture & { distanceKm: number }> {
  return filterByRange(homeLat, homeLng, DEFAULT_RANGE);
}

function filterByRange(
  homeLat: number,
  homeLng: number,
  range: { min: number; max: number }
): Array<Prefecture & { distanceKm: number }> {
  return PREFECTURES.map((pref) => ({
    ...pref,
    distanceKm: haversineDistanceKm(homeLat, homeLng, pref.lat, pref.lng),
  }))
    .filter((p) => p.distanceKm >= range.min && p.distanceKm < range.max)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
