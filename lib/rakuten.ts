import { haversineDistanceKm } from "./distance";

const RAKUTEN_ENDPOINT =
  "https://openapi.rakuten.co.jp/engine/api/Travel/VacantHotelSearch/20170426";
// ご利用中の楽天ウェブサービスのバージョンに応じて末尾の日付を最新のものに更新してください。
// 例: 2026年7月時点の最新バージョンは Rakuten Developers の
// 「楽天トラベル空室検索API」ページで確認できます。

export type HotelResult = {
  hotelNo: number;
  hotelName: string;
  hotelMinCharge: number;
  latitude: number;
  longitude: number;
  hotelImageUrl: string;
  hotelInformationUrl: string;
  planListUrl: string; // チェックイン/チェックアウト・人数条件を反映したプラン一覧URL
  reviewAverage: number | null;
  distanceKm: number;
  areaName?: string; // どのエリア(都道府県)の検索で見つかったか。route側で付与
};

/**
 * 宿泊人数の内訳。
 * 楽天APIは子供を「小学生高学年/低学年」、幼児を「食事・布団の有無」で
 * 細かく分けているが、MVPでは代表的なパターンに簡略化している。
 * - children: 小学生の人数(高学年/低学年の区別はせず lowClassNum として送る)
 * - infants: 幼児の人数(添い寝・布団ありの一般的なケースとして infantWithBNum で送る)
 */
export type GuestCounts = {
  adults: number;
  children?: number;
  infants?: number;
  rooms?: number;
};

/** 追加の絞り込み条件 */
export type SearchFilters = {
  onsen?: boolean; // 温泉宿のみ
  nonSmoking?: boolean; // 禁煙ルームのみ
  maxCharge?: number; // 上限予算(円)
};

export type SearchParams = {
  checkinDate: string; // YYYY-MM-DD
  checkoutDate: string; // YYYY-MM-DD
  latitude: number;
  longitude: number;
  searchRadiusKm: number; // 0.1〜3.0 の範囲に丸められる
  guests?: GuestCounts;
  filters?: SearchFilters;
};

/**
 * 楽天トラベル空室検索APIを呼び出し、
 * 自宅座標からの距離(km)を付与して返す。
 * 駅・ランドマークなど、ごく近距離(3km以内)の検索に向いている。
 */
export async function searchVacantHotels(
  params: SearchParams
): Promise<HotelResult[]> {
  // APIの検索半径は 0.1〜3.0(km)、小数点以下1桁までの範囲
  const radius = clampSearchRadius(params.searchRadiusKm);

  return requestVacantHotels(
    {
      latitude: String(params.latitude),
      longitude: String(params.longitude),
      searchRadius: String(radius),
      datumType: "1", // 世界測地系
    },
    params.checkinDate,
    params.checkoutDate,
    params.guests,
    params.filters,
    params.latitude,
    params.longitude
  );
}

export type AreaSearchParams = {
  checkinDate: string;
  checkoutDate: string;
  areaLat: number; // 検索の中心地点(都道府県庁所在地など)
  areaLng: number;
  homeLat: number; // 距離表示用の自宅座標
  homeLng: number;
  guests?: GuestCounts;
  filters?: SearchFilters;
};

/**
 * 都道府県の代表地点(県庁所在地など)を中心に、緯度経度検索を行う。
 * 楽天のエリアコード検索(largeClassCode/middleClassCode)は
 * smallClassCode(市区町村レベル)まで必須のため単独では使えず、
 * 代わりに動作実績のある緯度経度検索(searchRadius)を都道府県ごとに
 * 繰り返すことで、広い移動範囲での検索を実現している。
 * 検索半径はAPI上限の3.0kmを使用(代表地点周辺のみのサンプリング検索)。
 */
export async function searchVacantHotelsByArea(
  params: AreaSearchParams
): Promise<HotelResult[]> {
  return requestVacantHotels(
    {
      latitude: String(params.areaLat),
      longitude: String(params.areaLng),
      searchRadius: "3",
      datumType: "1",
    },
    params.checkinDate,
    params.checkoutDate,
    params.guests,
    params.filters,
    params.homeLat,
    params.homeLng
  );
}

async function requestVacantHotels(
  areaOrLocationParams: Record<string, string>,
  checkinDate: string,
  checkoutDate: string,
  guests: GuestCounts | undefined,
  filters: SearchFilters | undefined,
  homeLat: number,
  homeLng: number
): Promise<HotelResult[]> {
  const applicationId = process.env.RAKUTEN_APPLICATION_ID;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;

  if (!applicationId) {
    throw new Error("RAKUTEN_APPLICATION_ID is not set");
  }
  if (!accessKey) {
    throw new Error("RAKUTEN_ACCESS_KEY is not set");
  }

  const adultNum = guests?.adults ?? 1;
  const childNum = guests?.children ?? 0;
  const infantNum = guests?.infants ?? 0;
  const roomNum = guests?.rooms ?? 1;

  const query = new URLSearchParams({
    applicationId,
    accessKey,
    format: "json",
    checkinDate,
    checkoutDate,
    adultNum: String(adultNum),
    lowClassNum: String(childNum), // 子供(小学生)。MVPでは学年区分をせず1本化
    infantWithBNum: String(infantNum), // 幼児(布団のみ)。MVPでの代表的な扱い
    roomNum: String(roomNum),
    responseType: "small",
    hits: "30",
    ...areaOrLocationParams,
  });

  if (affiliateId) {
    query.set("affiliateId", affiliateId);
  }

  const squeezeConditions: string[] = [];
  if (filters?.onsen) squeezeConditions.push("onsen");
  if (filters?.nonSmoking) squeezeConditions.push("kinen");
  if (squeezeConditions.length > 0) {
    query.set("squeezeCondition", squeezeConditions.join(","));
  }
  if (filters?.maxCharge) {
    query.set("maxCharge", String(filters.maxCharge));
  }

  const res = await fetch(`${RAKUTEN_ENDPOINT}?${query.toString()}`, {
    headers: {
      accessKey, // ヘッダーでの指定も可能なため、念のため両方に付与
      // 楽天ウェブサービスの「許可されたWebサイト」に登録したドメインと
      // 一致させる必要があります。ローカル開発中は登録ドメインと異なるため、
      // 403エラーになる場合があります(その場合は本番ドメインでの動作確認、
      // またはローカル開発用ドメインの追加登録をご検討ください)。
      // 2026-07-30 時点の動作確認により、楽天ウェブサービス側で実際に
      // 「許可されたWebサイト」として登録・機能しているのは
      // https://dokoiku.com であることが判明した(https://www.dokoiku.tokyo /
      // https://dokoiku.tokyo はいずれも403 HTTP_REFERRER_NOT_ALLOWED)。
      // 実ドメインと不一致だが、登録変更には人間の確認・作業(楽天側の設定変更)が
      // 必要なため、動作を壊さないようフォールバック値は変更していない。
      // 詳細はユーザーへの報告を参照。
      Origin: process.env.RAKUTEN_ORIGIN ?? "https://dokoiku.com",
      Referer: process.env.RAKUTEN_ORIGIN ?? "https://dokoiku.com",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Rakuten API error (${res.status}): ${body}`);
  }

  const data = await res.json();

  if (!data.hotels) {
    return [];
  }

  const results: HotelResult[] = data.hotels.map((h: any) => {
    const basic = h.hotel[0].hotelBasicInfo;
    return {
      hotelNo: basic.hotelNo,
      hotelName: basic.hotelName,
      hotelMinCharge: basic.hotelMinCharge,
      latitude: basic.latitude,
      longitude: basic.longitude,
      hotelImageUrl: basic.hotelImageUrl,
      hotelInformationUrl: basic.hotelInformationUrl,
      planListUrl: buildPlanUrl(
        basic.planListUrl || basic.hotelInformationUrl,
        checkinDate,
        checkoutDate,
        guests
      ),
      reviewAverage: basic.reviewAverage,
      distanceKm: haversineDistanceKm(
        homeLat,
        homeLng,
        basic.latitude,
        basic.longitude
      ),
    };
  });

  return results;
}

function clampSearchRadius(km: number): number {
  // 現行APIの許容範囲: 0.1〜3.0km、小数点以下1桁まで
  const clamped = Math.min(Math.max(km, 0.1), 3.0);
  return Math.round(clamped * 10) / 10;
}

/**
 * 楽天トラベルのプラン一覧ページURLに、チェックイン/チェックアウト日・人数の
 * クエリパラメータを付与する。
 *
 * planListUrl自体には検索条件が embed されていないことが確認できたため、
 * 楽天トラベルの検索フォームが解釈する以下のクエリパラメータを追加している
 * (f_nen/f_tuki/f_hi = 年/月/日、f_otona_su = 大人数、f_heya_su = 部屋数)。
 * 子供・幼児の内訳(f_s1/f_s2, f_y1〜y4)は公開ドキュメントがなく、
 * 観測されたURL例からの推測のため、ズレる可能性がある点はご了承ください。
 */
function buildPlanUrl(
  baseUrl: string,
  checkinDate: string,
  checkoutDate: string,
  guests: GuestCounts | undefined
): string {
  try {
    const url = new URL(baseUrl);
    const [y1, m1, d1] = checkinDate.split("-");
    const [y2, m2, d2] = checkoutDate.split("-");

    url.searchParams.set("f_nen1", y1);
    url.searchParams.set("f_tuki1", String(Number(m1)));
    url.searchParams.set("f_hi1", String(Number(d1)));
    url.searchParams.set("f_nen2", y2);
    url.searchParams.set("f_tuki2", String(Number(m2)));
    url.searchParams.set("f_hi2", String(Number(d2)));
    url.searchParams.set("f_otona_su", String(guests?.adults ?? 1));
    url.searchParams.set("f_heya_su", String(guests?.rooms ?? 1));
    // 子供(小学生)・幼児は推測ベースのため、0件のときは触らずデフォルトのまま
    if (guests?.children) {
      url.searchParams.set("f_s2", String(guests.children));
    }
    if (guests?.infants) {
      url.searchParams.set("f_y3", String(guests.infants));
    }

    return url.toString();
  } catch {
    // URLとして不正な場合は加工せずそのまま返す
    return baseUrl;
  }
}
