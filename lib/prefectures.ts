/**
 * 47都道府県のマスタデータ。
 * lat/lng は都道府県庁所在地のおおよその座標(距離帯の判定用、簡易値)。
 * middleClassCode は楽天トラベルの区分コード(largeClassCode=japan配下)。
 * catchphrase は都道府県別ページの紹介文を個別化するための短い特徴フレーズ。
 * capital は都道府県庁所在地の市名(2026-09-17追加)。GSC実クエリで
 * 「大分市 ホテル 直前予約」のように県名ではなく県庁所在地名で検索される
 * ケースが多数確認されたため、FAQ等で県庁所在地名にも言及できるようにする。
 * 東京都のみ「東京都庁所在地」という言い方が一般的でないため、慣用的に
 * 使われる「東京」を入れている。
 */
export type Prefecture = {
  name: string;
  middleClassCode: string;
  lat: number;
  lng: number;
  catchphrase: string;
  capital: string;
};

export const PREFECTURES: Prefecture[] = [
  { name: "北海道", middleClassCode: "hokkaido", lat: 43.0642, lng: 141.3469, catchphrase: "雄大な自然と海鮮グルメ", capital: "札幌市" },
  { name: "青森県", middleClassCode: "aomori", lat: 40.8244, lng: 140.7400, catchphrase: "りんごとねぶたの祭り", capital: "青森市" },
  { name: "岩手県", middleClassCode: "iwate", lat: 39.7036, lng: 141.1527, catchphrase: "三陸の海と豊かな山々", capital: "盛岡市" },
  { name: "宮城県", middleClassCode: "miyagi", lat: 38.2688, lng: 140.8721, catchphrase: "牛たんと松島の絶景", capital: "仙台市" },
  { name: "秋田県", middleClassCode: "akita", lat: 39.7186, lng: 140.1024, catchphrase: "名湯とお米どころ", capital: "秋田市" },
  { name: "山形県", middleClassCode: "yamagata", lat: 38.2404, lng: 140.3633, catchphrase: "さくらんぼと蔵王の温泉", capital: "山形市" },
  { name: "福島県", middleClassCode: "fukushima", lat: 37.7503, lng: 140.4676, catchphrase: "会津の歴史と温泉地", capital: "福島市" },
  { name: "茨城県", middleClassCode: "ibaraki", lat: 36.3418, lng: 140.4468, catchphrase: "水戸の梅と広大な田園風景", capital: "水戸市" },
  { name: "栃木県", middleClassCode: "tochigi", lat: 36.5658, lng: 139.8836, catchphrase: "日光の世界遺産と温泉", capital: "宇都宮市" },
  { name: "群馬県", middleClassCode: "gunma", lat: 36.3912, lng: 139.0608, catchphrase: "草津・伊香保など名湯揃い", capital: "前橋市" },
  { name: "埼玉県", middleClassCode: "saitama", lat: 35.8570, lng: 139.6489, catchphrase: "都心へのアクセスと自然", capital: "さいたま市" },
  { name: "千葉県", middleClassCode: "chiba", lat: 35.6047, lng: 140.1233, catchphrase: "海と大型テーマパーク", capital: "千葉市" },
  { name: "東京都", middleClassCode: "tokyo", lat: 35.6895, lng: 139.6917, catchphrase: "定番から穴場まで揃う大都市", capital: "東京" },
  { name: "神奈川県", middleClassCode: "kanagawa", lat: 35.4478, lng: 139.6425, catchphrase: "港町の風情と温泉地", capital: "横浜市" },
  { name: "新潟県", middleClassCode: "niigata", lat: 37.9026, lng: 139.0232, catchphrase: "日本酒とスキーリゾート", capital: "新潟市" },
  { name: "富山県", middleClassCode: "toyama", lat: 36.6953, lng: 137.2113, catchphrase: "立山連峰と新鮮な海の幸", capital: "富山市" },
  { name: "石川県", middleClassCode: "ishikawa", lat: 36.5947, lng: 136.6256, catchphrase: "金沢の伝統文化と温泉", capital: "金沢市" },
  { name: "福井県", middleClassCode: "fukui", lat: 36.0652, lng: 136.2216, catchphrase: "越前がにと恐竜の街", capital: "福井市" },
  { name: "山梨県", middleClassCode: "yamanashi", lat: 35.6642, lng: 138.5686, catchphrase: "富士山とぶどう畑", capital: "甲府市" },
  { name: "長野県", middleClassCode: "nagano", lat: 36.6513, lng: 138.1810, catchphrase: "アルプスの山々と高原リゾート", capital: "長野市" },
  { name: "岐阜県", middleClassCode: "gifu", lat: 35.3912, lng: 136.7223, catchphrase: "飛騨高山の街並みと温泉", capital: "岐阜市" },
  { name: "静岡県", middleClassCode: "shizuoka", lat: 34.9769, lng: 138.3831, catchphrase: "富士山と伊豆・熱海の温泉", capital: "静岡市" },
  { name: "愛知県", middleClassCode: "aichi", lat: 35.1802, lng: 136.9066, catchphrase: "名古屋グルメとものづくりの街", capital: "名古屋市" },
  { name: "三重県", middleClassCode: "mie", lat: 34.7303, lng: 136.5086, catchphrase: "伊勢神宮と美しいリアス海岸", capital: "津市" },
  { name: "滋賀県", middleClassCode: "shiga", lat: 35.0045, lng: 135.8686, catchphrase: "琵琶湖のほとりの静かな街", capital: "大津市" },
  { name: "京都府", middleClassCode: "kyoto", lat: 35.0212, lng: 135.7556, catchphrase: "古都の寺社仏閣と町家の風情", capital: "京都市" },
  { name: "大阪府", middleClassCode: "osaka", lat: 34.6863, lng: 135.5200, catchphrase: "食い倒れグルメと活気ある街", capital: "大阪市" },
  { name: "兵庫県", middleClassCode: "hyogo", lat: 34.6913, lng: 135.1830, catchphrase: "神戸の異国情緒と有馬温泉", capital: "神戸市" },
  { name: "奈良県", middleClassCode: "nara", lat: 34.6851, lng: 135.8329, catchphrase: "古都の史跡と鹿の名所", capital: "奈良市" },
  { name: "和歌山県", middleClassCode: "wakayama", lat: 34.2261, lng: 135.1675, catchphrase: "高野山と白浜の温泉", capital: "和歌山市" },
  { name: "鳥取県", middleClassCode: "tottori", lat: 35.5039, lng: 134.2378, catchphrase: "鳥取砂丘と日本海の幸", capital: "鳥取市" },
  { name: "島根県", middleClassCode: "shimane", lat: 35.4723, lng: 133.0505, catchphrase: "出雲大社と縁結びの地", capital: "松江市" },
  { name: "岡山県", middleClassCode: "okayama", lat: 34.6618, lng: 133.9344, catchphrase: "桃太郎伝説と晴れの国", capital: "岡山市" },
  { name: "広島県", middleClassCode: "hiroshima", lat: 34.3966, lng: 132.4596, catchphrase: "宮島と平和記念公園", capital: "広島市" },
  { name: "山口県", middleClassCode: "yamaguchi", lat: 34.1859, lng: 131.4714, catchphrase: "海峡の景観とふぐ料理", capital: "山口市" },
  { name: "徳島県", middleClassCode: "tokushima", lat: 34.0658, lng: 134.5593, catchphrase: "鳴門の渦潮と阿波おどり", capital: "徳島市" },
  { name: "香川県", middleClassCode: "kagawa", lat: 34.3401, lng: 134.0434, catchphrase: "うどん県と瀬戸内の島々", capital: "高松市" },
  { name: "愛媛県", middleClassCode: "ehime", lat: 33.8417, lng: 132.7661, catchphrase: "道後温泉とみかんの産地", capital: "松山市" },
  { name: "高知県", middleClassCode: "kochi", lat: 33.5597, lng: 133.5311, catchphrase: "カツオと雄大な太平洋", capital: "高知市" },
  { name: "福岡県", middleClassCode: "fukuoka", lat: 33.6064, lng: 130.4181, catchphrase: "屋台グルメと九州の玄関口", capital: "福岡市" },
  { name: "佐賀県", middleClassCode: "saga", lat: 33.2494, lng: 130.2988, catchphrase: "有田焼と嬉野・武雄の温泉", capital: "佐賀市" },
  { name: "長崎県", middleClassCode: "nagasaki", lat: 32.7448, lng: 129.8737, catchphrase: "異国情緒漂う港町", capital: "長崎市" },
  { name: "熊本県", middleClassCode: "kumamoto", lat: 32.7898, lng: 130.7417, catchphrase: "熊本城と阿蘇の大自然", capital: "熊本市" },
  { name: "大分県", middleClassCode: "oita", lat: 33.2382, lng: 131.6126, catchphrase: "別府・由布院の名湯揃い", capital: "大分市" },
  { name: "宮崎県", middleClassCode: "miyazaki", lat: 31.9111, lng: 131.4239, catchphrase: "南国の気候と神話の地", capital: "宮崎市" },
  { name: "鹿児島県", middleClassCode: "kagoshima", lat: 31.5602, lng: 130.5581, catchphrase: "桜島と黒豚・温泉文化", capital: "鹿児島市" },
  { name: "沖縄県", middleClassCode: "okinawa", lat: 26.2124, lng: 127.6809, catchphrase: "青い海と独自の文化", capital: "那覇市" },
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

/** 都道府県コードから、それが属する地方(region)を逆引きする */
export function regionKeyForPrefecture(middleClassCode: string): RegionKey | undefined {
  const entry = Object.entries(REGION_PREFECTURE_CODES).find(([, codes]) =>
    codes.includes(middleClassCode)
  );
  return entry ? (entry[0] as RegionKey) : undefined;
}
