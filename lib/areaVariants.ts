import type { SearchFilters } from "./rakuten";
import { thisWeekendRange, tonightRange, type DateRange } from "./dates";

/**
 * 都道府県ページのバリエーション定義。
 * ロングテールSEO対策として、通常の「週末の空室」に加えて
 * 「温泉宿限定」「今夜泊まれる宿(直前予約)」の切り口を用意し、
 * それぞれ別URL(/areas/[code]、/areas/[code]/onsen、/areas/[code]/tonight)で
 * インデックスさせる。
 */
export type AreaVariantKey = "weekend" | "onsen" | "tonight" | "budget";

export type AreaVariant = {
  key: AreaVariantKey;
  /** ベースURL(/areas/[code])に続けるパス。weekendは空文字 */
  pathSuffix: string;
  /** 「他の探し方」ナビに出す短いラベル */
  navLabel: string;
  buildTitle: (prefName: string) => string;
  buildDescription: (prefName: string, catchphrase: string) => string;
  buildHeading: (prefName: string) => string;
  /** 通常の紹介文に足す一文(このバリエーション特有の説明)。無ければ空文字 */
  buildIntroExtra: (prefName: string) => string;
  dateRange: () => DateRange;
  /**
   * ページ下部に載せるFAQ(任意)。実際にサーチコンソールで確認した検索クエリの
   * 言い回しに沿った質問文にする(創作クエリを作らない)。未指定ならFAQセクション自体を出さない。
   */
  buildFaq?: (prefName: string) => { q: string; a: string }[];
  filters?: SearchFilters;
  /**
   * 表示時に追加で適用する上限金額(円)。
   * 楽天APIのmaxChargeフィルタは「1部屋あたりの目安額」基準で判定されており、
   * 実際に表示する金額(人数条件に一致した実料金、2026-08-13対応)とは
   * 乖離することがある(実測で最大2倍程度)。「◯円以下」と明示するページでは
   * 実際に表示する金額の側でも再度絞り込み、誇大な表示を防ぐ。
   */
  maxDisplayCharge?: number;
  emptyMessage: string;
};

export const AREA_VARIANTS: Record<AreaVariantKey, AreaVariant> = {
  weekend: {
    key: "weekend",
    pathSuffix: "",
    navLabel: "週末の空室(通常)",
    buildTitle: (name) => `${name}の空室ホテル一覧｜今すぐ・価格が安い順 - どこいく`,
    buildDescription: (name, catchphrase) =>
      `${name}で今空いているホテルを価格が安い順に一覧表示。日付を指定して、行き先を${name}に限定した検索もできます。${catchphrase}が魅力のエリアです。`,
    buildHeading: (name) => `${name}のホテル空室状況`,
    buildIntroExtra: () => "",
    dateRange: thisWeekendRange,
    emptyMessage: "この日程では、条件に合う空室が見つかりませんでした。",
  },
  onsen: {
    key: "onsen",
    pathSuffix: "/onsen",
    navLabel: "温泉宿だけ探す",
    buildTitle: (name) => `${name}の温泉宿 空室一覧｜価格が安い順 - どこいく`,
    buildDescription: (name, catchphrase) =>
      `${name}で今空いている温泉宿だけを価格が安い順に一覧表示。日付を指定した検索もできます。${catchphrase}が魅力のエリアです。`,
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
    buildTitle: (name) => `${name}で今夜泊まれる宿｜直前予約・価格順 - どこいく`,
    buildDescription: (name, catchphrase) =>
      `${name}で今夜からすぐ泊まれる空室ホテルを価格が安い順に一覧表示。直前予約・弾丸旅行にも。${catchphrase}が魅力のエリアです。`,
    buildHeading: (name) => `${name}で今夜泊まれる宿(直前予約)`,
    buildIntroExtra: (name) =>
      `急な出張や弾丸旅行にも対応できるよう、今日チェックイン・翌日チェックアウトの条件で${name}内の直前予約可能な宿を探せます。`,
    dateRange: tonightRange,
    emptyMessage: "本日チェックインの条件では、空室が見つかりませんでした。",
  },
  budget: {
    key: "budget",
    pathSuffix: "/budget",
    navLabel: "1万円以下の宿だけ探す",
    buildTitle: (name) => `${name}の格安ホテル｜1万円以下・空室あり - どこいく`,
    buildDescription: (name, catchphrase) =>
      `${name}で1泊1万円以下の予算重視ホテルだけを価格が安い順に一覧表示。日付を指定した検索もできます。${catchphrase}が魅力のエリアです。`,
    buildHeading: (name) => `${name}の格安ホテル(1万円以下)`,
    buildIntroExtra: (name) =>
      `こちらは1泊あたり1万円以下という予算条件で絞り込んだ結果で、${name}内の指定人数での実料金が1万円以下の宿泊施設のみを表示しています。`,
    dateRange: thisWeekendRange,
    filters: { maxCharge: 10000 },
    maxDisplayCharge: 10000,
    emptyMessage: "この日程では、1万円以下の条件に合う空室が見つかりませんでした。",
    // 2026-09-02: GSC実クエリ(「◯◯ 格安ホテル」「◯◯ ホテル 安い」等)の言い回しに沿ったFAQ。
    // 表示回数はあるがクリック0という状態を受けて追加(nara/budget等で確認済み)。
    buildFaq: (name) => [
      {
        q: `${name}で1泊1万円以下のホテルはどう探せばいい?`,
        a: `このページでは、指定した人数での実料金が1泊1万円以下の宿だけを、価格の安い順に絞り込んで表示しています。楽天トラベルの在庫と連動しているため、表示されているのは現時点で予約可能な空室のみです。`,
      },
      {
        q: `${name}の格安ホテルは今日・明日でも予約できる?`,
        a: `このページの表示日程は週末の例ですが、直前予約(当日チェックイン)を探したい場合は「今夜泊まれる宿」のページで同じ${name}内の空室を確認できます。トップページの検索フォームから、ご自身の希望日程で改めて絞り込むことも可能です。`,
      },
      {
        q: "表示されている金額は本当にその値段で泊まれますか?",
        a: "検索時に指定した人数で実際に予約できるプランの料金を表示しています(部屋単位の目安ではなく、指定人数条件に一致する料金です)。最終的な金額・空室状況は、予約ページ(楽天トラベル)で改めてご確認ください。",
      },
    ],
  },
};

export const AREA_VARIANT_LIST: AreaVariant[] = Object.values(AREA_VARIANTS);
