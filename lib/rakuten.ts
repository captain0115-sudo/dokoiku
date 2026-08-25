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
  reviewCount: number | null;
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

  const requestUrl = `${RAKUTEN_ENDPOINT}?${query.toString()}`;
  const requestHeaders = {
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
  };

  // 楽天API呼び出しは単発だとタイムアウト・一時的な5xxで失敗しやすいため、
  // 1回だけ短い間隔をおいて再試行する(2026-08-13、広告経由の流入増を見込んだ改善。
  // 神奈川・沖縄など特集ページの一部エリアが取得失敗する事象が過去に発生していた)。
  // 403等クライアントエラー(設定不備)はリトライしても無駄なため即座に投げる。
  const data = await fetchWithRetry(requestUrl, requestHeaders);

  if (!data.hotels) {
    return [];
  }

  const results: HotelResult[] = data.hotels.map((h: any) => {
    const basic = h.hotel[0].hotelBasicInfo;
    // basic.hotelMinChargeは楽天の仕様上「1部屋1泊あたりの最安値の目安」であり、
    // 検索条件のadultNum(人数)に対応した金額とは限らない(実際に検証したところ、
    // 指定人数では成立しない安いプランの金額が混ざり、実際の1名利用料金より
    // 大幅に低く表示されるケースが確認された)。h.hotel[1].roomInfoには
    // 検索条件(人数・日程)に一致する実際のプランの日別料金(dailyCharge)が
    // 含まれているため、取得できる場合はそちらを優先して使う(2026-08-13対応)。
    const roomInfoEntries: any[] = h.hotel[1]?.roomInfo ?? [];
    const dailyChargeEntry = roomInfoEntries.find((e) => e.dailyCharge);
    const accurateCharge = dailyChargeEntry?.dailyCharge?.total;
    return {
      hotelNo: basic.hotelNo,
      hotelName: basic.hotelName,
      hotelMinCharge: accurateCharge ?? basic.hotelMinCharge,
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
      reviewCount: basic.reviewCount ?? null,
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

/**
 * 楽天APIへのfetchを実行し、5xxやネットワークエラーの場合のみ1回だけ再試行する。
 * 401/403/429等のクライアントエラーは設定・レート制限の問題でリトライしても
 * 解決しないため即座にthrowする。
 */
async function fetchWithRetry(
  url: string,
  headers: Record<string, string>,
  retriesLeft = 2
): Promise<any> {
  let res: Response;
  try {
    res = await fetch(url, { headers });
  } catch (err) {
    if (retriesLeft > 0) {
      await sleep(300);
      return fetchWithRetry(url, headers, retriesLeft - 1);
    }
    throw err;
  }

  if (!res.ok) {
    const body = await res.text();
    // 429(レート制限)は複数エリアを同時取得するページ(お盆特集等)で頻発することを確認済み。
    // 楽天側のエラーメッセージが「Try again in 1 seconds」等と案内するため、5xxより長めに待って
    // 再試行する(2026-08-13対応、以前は429を意図的にリトライ対象外にしていたが、
    // 短時間の待機であれば悪化させずに解消できることを確認したため対象に含めた)。
    if (res.status === 429 && retriesLeft > 0) {
      await sleep(1500);
      return fetchWithRetry(url, headers, retriesLeft - 1);
    }
    if (res.status >= 500 && retriesLeft > 0) {
      await sleep(300);
      return fetchWithRetry(url, headers, retriesLeft - 1);
    }
    throw new Error(`Rakuten API error (${res.status}): ${body}`);
  }

  return res.json();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
 *
 * 【2026-08-25修正】planListUrlは`https://hb.afl.rakuten.co.jp/hgc/{affiliateId}/
 * ?pc={実際の遷移先URLをエンコードしたもの}`という楽天アフィリエイトのディープリンク
 * 形式になっている。実際にリンクを辿って検証したところ、hb.afl.rakuten.co.jpの
 * リダイレクタは`pc=`パラメータの中身しか転送せず、その外側にトップレベルの
 * クエリを追加しても遷移先には一切伝わらないことを確認した(以前の実装は
 * `new URL(baseUrl)`に対して直接f_nen1等を追加していたため、日付・人数が
 * 常に失われ、ユーザーは条件未指定の一般プラン一覧に着地していた)。
 * そのため、`pc=`が存在する場合はその中の実URLに対してパラメータを付与し、
 * 再エンコードして`pc=`に書き戻す。存在しない場合(直接のtravel.rakuten.co.jp
 * URL等)は従来通りbaseUrl自体に直接付与する。
 */
function buildPlanUrl(
  baseUrl: string,
  checkinDate: string,
  checkoutDate: string,
  guests: GuestCounts | undefined
): string {
  try {
    const outer = new URL(baseUrl);
    const pcValue = outer.searchParams.get("pc");
    const target = pcValue ? new URL(pcValue) : outer;

    const [y1, m1, d1] = checkinDate.split("-");
    const [y2, m2, d2] = checkoutDate.split("-");

    target.searchParams.set("f_nen1", y1);
    target.searchParams.set("f_tuki1", String(Number(m1)));
    target.searchParams.set("f_hi1", String(Number(d1)));
    target.searchParams.set("f_nen2", y2);
    target.searchParams.set("f_tuki2", String(Number(m2)));
    target.searchParams.set("f_hi2", String(Number(d2)));
    target.searchParams.set("f_otona_su", String(guests?.adults ?? 1));
    target.searchParams.set("f_heya_su", String(guests?.rooms ?? 1));
    // 子供(小学生)・幼児は推測ベースのため、0件のときは触らずデフォルトのまま
    if (guests?.children) {
      target.searchParams.set("f_s2", String(guests.children));
    }
    if (guests?.infants) {
      target.searchParams.set("f_y3", String(guests.infants));
    }

    if (pcValue) {
      outer.searchParams.set("pc", target.toString());
      return outer.toString();
    }
    return target.toString();
  } catch {
    // URLとして不正な場合は加工せずそのまま返す
    return baseUrl;
  }
}
