import type { SearchFilters } from "./rakuten";
import { thisWeekendRange, tonightRange, type DateRange } from "./dates";

/**
 * 都道府県ページのバリエーション定義。
 * ロングテールSEO対策として、通常の「週末の空室」に加えて
 * 「温泉宿限定」「今夜泊まれる宿(直前予約)」の切り口を用意し、
 * それぞれ別URL(/areas/[code]、/areas/[code]/onsen、/areas/[code]/tonight)で
 * インデックスさせる。
 */
export type AreaVariantKey = "weekend" | "onsen" | "tonight";

export type AreaVariant = {
  key: AreaVariantKey;
  /** ベースURL(/areas/[code])に続けるパス。weekendは空文字 */
  pathSuffix: string;
  /** 「他の探し方」ナビに出す短いラベル */
  navLabel: string;
  buildTitle: (prefName: string, catchphrase: string) => string;
  buildDescription: (prefName: string, catchphrase: string) => string;
  buildHeading: (prefName: string) => string;
  /** 通常の紹介文に足す一文(このバリエーション特有の説明)。無ければ空文字 */
  buildIntroExtra: (prefName: string) => string;
  dateRange: () => DateRange;
  filters?: SearchFilters;
  emptyMessage: string;
};

export const AREA_VARIANTS: Record<AreaVariantKey, AreaVariant> = {
  weekend: {
    key: "weekend",
    pathSuffix: "",
    navLabel: "週末の空室(通常)",
    buildTitle: (name, catchphrase) => `${name}のホテル空室状況(${catchphrase}) | どこいく`,
    buildDescription: (name, catchphrase) =>
      `${catchphrase}が魅力の${name}で、今空いているホテルを価格順に一覧表示。日付を指定して、行き先を${name}に限定した検索もできます。`,
    buildHeading: (name) => `${name}のホテル空室状況`,
    buildIntroExtra: () => "",
    dateRange: thisWeekendRange,
    emptyMessage: "この日程では、条件に合う空室が見つかりませんでした。",
  },
  onsen: {
    key: "onsen",
    pathSuffix: "/onsen",
    navLabel: "温泉宿だけ探す",
    buildTitle: (name, catchphrase) => `${name}の温泉宿 空室状況(${catchphrase}) | どこいく`,
    buildDescription: (name, catchphrase) =>
      `${catchphrase}が魅力の${name}で、今空いている温泉宿だけを価格順に一覧表示。日付を指定した検索もできます。`,
    buildHeading: (name) => `${name}の温泉宿 空室状況`,
    buildIntroExtra: (name) =>
      `こちらは楽天トラベルの温泉宿条件で絞り込んだ結果で、${name}内の温泉付き宿泊施設のみを表示しています。`,
    dateRange: thisWeekendRange,
    filters: { onsen: true },
    emptyMessage: "この日程では、条件に合う温泉宿の空室が見つかりませんでした。",
  },
  tonight: {
    key: "tonight",
    pathSuffix: "/tonight",
    navLabel: "今夜泊まれる宿(直前予約)",
    buildTitle: (name, catchphrase) => `${name}で今夜泊まれる宿(直前予約) | どこいく`,
    buildDescription: (name, catchphrase) =>
      `${catchphrase}が魅力の${name}で、今夜からすぐ泊まれる空室ホテルを価格順に一覧表示。直前予約・弾丸旅行にも。`,
    buildHeading: (name) => `${name}で今夜泊まれる宿(直前予約)`,
    buildIntroExtra: (name) =>
      `急な出張や弾丸旅行にも対応できるよう、今日チェックイン・翌日チェックアウトの条件で${name}内の直前予約可能な宿を探せます。`,
    dateRange: tonightRange,
    emptyMessage: "本日チェックインの条件では、空室が見つかりませんでした。",
  },
};

export const AREA_VARIANT_LIST: AreaVariant[] = Object.values(AREA_VARIANTS);
