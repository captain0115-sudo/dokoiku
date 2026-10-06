/**
 * アゴダ(A8.net経由)への比較リンク(2026-10-06追加)。
 *
 * 楽天トラベルの報酬料率1%に対し、アゴダはA8.net経由で4%(確定率約58%)。
 * 楽天以外の空室・価格はAPIで取得できないため、価格は表示せず「同じ日程で
 * アゴダでも比較する」導線として、都道府県の代表都市の検索結果に送る。
 *
 * A8.netのリダイレクタ(px.a8.net/svt/ejp)を実際にたどって検証した結果:
 * - `search?city=<ID>&checkIn=...` 形式は日付・人数と計測タグ(cid)が保持される
 * - `search?textToSearch=<日本語>` 形式は文字コードが変換され、アゴダのトップに
 *   飛ばされてしまう(ホテル名での検索リンクは使えない)
 * 都市IDは各都市ページ(agoda.com/ja-jp/city/<slug>.html)から取得した実値。
 */

const A8_AGODA_MAT = "4BEA4U+1XNQK2+4X1W+BW0YB";

/** 都道府県(楽天のmiddleClassCode)→ アゴダの代表都市(県庁所在地)の都市ID */
const AGODA_CITY_IDS: Record<string, number> = {
  hokkaido: 3435, aomori: 8950, iwate: 88747, miyagi: 10345, akita: 9190,
  yamagata: 3143, fukushima: 18824, ibaraki: 107030, tochigi: 105942, gunma: 21511,
  saitama: 18827, chiba: 5375, tokyo: 5085, kanagawa: 4590, niigata: 9732,
  toyama: 3492, ishikawa: 18826, fukui: 19358, yamanashi: 108843, nagano: 1124,
  gifu: 10163, shizuoka: 57, aichi: 13740, mie: 107516, shiga: 108285,
  kyoto: 1784, osaka: 9590, hyogo: 5235, nara: 13313, wakayama: 16872,
  tottori: 5937, shimane: 108312, okayama: 4280, hiroshima: 10554, yamaguchi: 18822,
  tokushima: 18816, kagawa: 88749, ehime: 18809, kochi: 10249, fukuoka: 16527,
  saga: 8563, nagasaki: 193, kumamoto: 1568, oita: 107890, miyazaki: 13561,
  kagoshima: 6263, okinawa: 18820,
};

export function buildAgodaCompareUrl(params: {
  middleClassCode: string;
  checkinDate: string; // YYYY-MM-DD
  nights: number;
  adults: number;
}): string | null {
  const cityId = AGODA_CITY_IDS[params.middleClassCode];
  if (!cityId) return null;
  const target = new URL("https://www.agoda.com/ja-jp/search");
  target.searchParams.set("city", String(cityId));
  target.searchParams.set("checkIn", params.checkinDate);
  target.searchParams.set("los", String(Math.max(1, params.nights)));
  target.searchParams.set("rooms", "1");
  target.searchParams.set("adults", String(Math.max(1, params.adults)));
  return `https://px.a8.net/svt/ejp?a8mat=${A8_AGODA_MAT}&a8ejpredirect=${encodeURIComponent(
    target.toString()
  )}`;
}
