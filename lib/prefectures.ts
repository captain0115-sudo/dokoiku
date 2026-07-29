/**
 * 47都道府県のマスタデータ。
 * lat/lng は都道府県庁所在地のおおよその座標(距離帯の判定用、簡易値)。
 * middleClassCode は楽天トラベルの区分コード(largeClassCode=japan配下)。
 */
export type Prefecture = {
  name: string;
  middleClassCode: string;
  lat: number;
  lng: number;
};

export const PREFECTURES: Prefecture[] = [
  { name: "北海道", middleClassCode: "hokkaido", lat: 43.0642, lng: 141.3469 },
  { name: "青森県", middleClassCode: "aomori", lat: 40.8244, lng: 140.7400 },
  { name: "岩手県", middleClassCode: "iwate", lat: 39.7036, lng: 141.1527 },
  { name: "宮城県", middleClassCode: "miyagi", lat: 38.2688, lng: 140.8721 },
  { name: "秋田県", middleClassCode: "akita", lat: 39.7186, lng: 140.1024 },
  { name: "山形県", middleClassCode: "yamagata", lat: 38.2404, lng: 140.3633 },
  { name: "福島県", middleClassCode: "fukushima", lat: 37.7503, lng: 140.4676 },
  { name: "茨城県", middleClassCode: "ibaraki", lat: 36.3418, lng: 140.4468 },
  { name: "栃木県", middleClassCode: "tochigi", lat: 36.5658, lng: 139.8836 },
  { name: "群馬県", middleClassCode: "gunma", lat: 36.3912, lng: 139.0608 },
  { name: "埼玉県", middleClassCode: "saitama", lat: 35.8570, lng: 139.6489 },
  { name: "千葉県", middleClassCode: "chiba", lat: 35.6047, lng: 140.1233 },
  { name: "東京都", middleClassCode: "tokyo", lat: 35.6895, lng: 139.6917 },
  { name: "神奈川県", middleClassCode: "kanagawa", lat: 35.4478, lng: 139.6425 },
  { name: "新潟県", middleClassCode: "niigata", lat: 37.9026, lng: 139.0232 },
  { name: "富山県", middleClassCode: "toyama", lat: 36.6953, lng: 137.2113 },
  { name: "石川県", middleClassCode: "ishikawa", lat: 36.5947, lng: 136.6256 },
  { name: "福井県", middleClassCode: "fukui", lat: 36.0652, lng: 136.2216 },
  { name: "山梨県", middleClassCode: "yamanashi", lat: 35.6642, lng: 138.5686 },
  { name: "長野県", middleClassCode: "nagano", lat: 36.6513, lng: 138.1810 },
  { name: "岐阜県", middleClassCode: "gifu", lat: 35.3912, lng: 136.7223 },
  { name: "静岡県", middleClassCode: "shizuoka", lat: 34.9769, lng: 138.3831 },
  { name: "愛知県", middleClassCode: "aichi", lat: 35.1802, lng: 136.9066 },
  { name: "三重県", middleClassCode: "mie", lat: 34.7303, lng: 136.5086 },
  { name: "滋賀県", middleClassCode: "shiga", lat: 35.0045, lng: 135.8686 },
  { name: "京都府", middleClassCode: "kyoto", lat: 35.0212, lng: 135.7556 },
  { name: "大阪府", middleClassCode: "osaka", lat: 34.6863, lng: 135.5200 },
  { name: "兵庫県", middleClassCode: "hyogo", lat: 34.6913, lng: 135.1830 },
  { name: "奈良県", middleClassCode: "nara", lat: 34.6851, lng: 135.8329 },
  { name: "和歌山県", middleClassCode: "wakayama", lat: 34.2261, lng: 135.1675 },
  { name: "鳥取県", middleClassCode: "tottori", lat: 35.5039, lng: 134.2378 },
  { name: "島根県", middleClassCode: "shimane", lat: 35.4723, lng: 133.0505 },
  { name: "岡山県", middleClassCode: "okayama", lat: 34.6618, lng: 133.9344 },
  { name: "広島県", middleClassCode: "hiroshima", lat: 34.3966, lng: 132.4596 },
  { name: "山口県", middleClassCode: "yamaguchi", lat: 34.1859, lng: 131.4714 },
  { name: "徳島県", middleClassCode: "tokushima", lat: 34.0658, lng: 134.5593 },
  { name: "香川県", middleClassCode: "kagawa", lat: 34.3401, lng: 134.0434 },
  { name: "愛媛県", middleClassCode: "ehime", lat: 33.8417, lng: 132.7661 },
  { name: "高知県", middleClassCode: "kochi", lat: 33.5597, lng: 133.5311 },
  { name: "福岡県", middleClassCode: "fukuoka", lat: 33.6064, lng: 130.4181 },
  { name: "佐賀県", middleClassCode: "saga", lat: 33.2494, lng: 130.2988 },
  { name: "長崎県", middleClassCode: "nagasaki", lat: 32.7448, lng: 129.8737 },
  { name: "熊本県", middleClassCode: "kumamoto", lat: 32.7898, lng: 130.7417 },
  { name: "大分県", middleClassCode: "oita", lat: 33.2382, lng: 131.6126 },
  { name: "宮崎県", middleClassCode: "miyazaki", lat: 31.9111, lng: 131.4239 },
  { name: "鹿児島県", middleClassCode: "kagoshima", lat: 31.5602, lng: 130.5581 },
  { name: "沖縄県", middleClassCode: "okinawa", lat: 26.2124, lng: 127.6809 },
];

export function findPrefecture(middleClassCode: string): Prefecture | undefined {
  return PREFECTURES.find((p) => p.middleClassCode === middleClassCode);
}

export type RegionKey =
  | "hokkaido"
  | "tohoku"
  | "kanto"
  | "koshinetsu"
  | "hokuriku"
  | "tokai"
  | "kinki"
  | "chugoku"
  | "shikoku"
  | "kyushuOkinawa";

export const REGION_LABELS: Record<RegionKey, string> = {
  hokkaido: "北海道",
  tohoku: "東北",
  kanto: "関東",
  koshinetsu: "甲信越",
  hokuriku: "北陸",
  tokai: "東海",
  kinki: "近畿",
  chugoku: "中国",
  shikoku: "四国",
  kyushuOkinawa: "九州・沖縄",
};

const REGION_PREFECTURE_CODES: Record<RegionKey, string[]> = {
  hokkaido: ["hokkaido"],
  tohoku: ["aomori", "iwate", "miyagi", "akita", "yamagata", "fukushima"],
  kanto: ["ibaraki", "tochigi", "gunma", "saitama", "chiba", "tokyo", "kanagawa"],
  koshinetsu: ["niigata", "yamanashi", "nagano"],
  hokuriku: ["toyama", "ishikawa", "fukui"],
  tokai: ["gifu", "shizuoka", "aichi", "mie"],
  kinki: ["shiga", "kyoto", "osaka", "hyogo", "nara", "wakayama"],
  chugoku: ["tottori", "shimane", "okayama", "hiroshima", "yamaguchi"],
  shikoku: ["tokushima", "kagawa", "ehime", "kochi"],
  kyushuOkinawa: [
    "fukuoka",
    "saga",
    "nagasaki",
    "kumamoto",
    "oita",
    "miyazaki",
    "kagoshima",
    "okinawa",
  ],
};

export function prefecturesInRegion(region: RegionKey): Prefecture[] {
  const codes = REGION_PREFECTURE_CODES[region];
  return PREFECTURES.filter((p) => codes.includes(p.middleClassCode));
}
