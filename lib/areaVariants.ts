import type { SearchFilters } from "./rakuten";
import { thisWeekendRange, tonightRange, type DateRange } from "./dates";
import type { Prefecture } from "./prefectures";

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
  /**
   * 空室一覧セクションの見出し(H2)。オンページSEO監査(2026-09-07)で判明した点:
   * H1(buildHeading)はバリエーションごとのキーワード(格安ホテル・温泉宿等)を含むが、
   * この見出しが従来「{都道府県}の空室(件数)」で全バリエーション共通になっており、
   * H2でのキーワード反復機会を逃していた。バリエーションごとに自然な形で言い換える。
   */
  buildResultsHeading: (prefName: string, count: number) => string;
  /**
   * 「自分の日程で検索する」CTAボタンの文言。オンページSEO監査(2026-09-07)で
   * CTAにもキーワードを含めるべきと判断したが、絞り込み条件(価格上限・温泉宿等)が
   * 実際にトップページへ引き継がれる場合のみキーワードを足すこと(引き継がれないのに
   * 文言だけ足すと実際の挙動と食い違う、2026-09-03のmaxCharge引き継ぎ漏れと同種の
   * 問題になる)。未指定なら`自分の日程で{都道府県}を検索する`という基本形を使う。
   */
  buildCtaLabel?: (prefName: string) => string;
  /** 通常の紹介文に足す一文(このバリエーション特有の説明)。無ければ空文字 */
  buildIntroExtra: (prefName: string) => string;
  dateRange: () => DateRange;
  /**
   * ページ下部に載せるFAQ(任意)。実際にサーチコンソールで確認した検索クエリの
   * 言い回しに沿った質問文にする(創作クエリを作らない)。未指定ならFAQセクション自体を出さない。
   * prefNameだけでなくPrefecture全体を渡す(2026-09-17、capital等の他フィールドも
   * 使えるようにするため)。
   */
  buildFaq?: (pref: Prefecture) => { q: string; a: string }[];
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
    buildResultsHeading: (name, count) => `${name}のホテル空室一覧(${count}件)`,
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
    buildResultsHeading: (name, count) => `${name}の温泉宿 空室一覧(${count}件)`,
    buildCtaLabel: (name) => `自分の日程で${name}の温泉宿を検索する`,
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
    // 2026-09-09: GSC×SERPクラスタリング分析(SEOクラスタリング分析_2026-09-09.md)で、
    // このバリエーションが対応する「空き状況・空室・AI会話型」クラスタは掲載順位8〜20位台と
    // 好位置にありながらCTRがほぼ0%と判明。原因の一つとして、GSC実クエリに頻出する
    // 「空き状況」「空室状況」「空室」という言葉がタイトル・meta descriptionに一語も
    // 含まれていなかった(「直前予約」という同義だが非一致の言葉のみ)ことを特定し、
    // 検索意図の言葉をそのままタイトル冒頭に反映した。
    buildTitle: (name) => `${name}のホテル空室状況｜今夜泊まれる宿・直前予約 - どこいく`,
    buildDescription: (name, catchphrase) =>
      `${name}のホテルの空室状況を今すぐ確認。今夜からすぐ泊まれる空室ホテルを価格が安い順に一覧表示します。直前予約・弾丸旅行にも。${catchphrase}が魅力のエリアです。`,
    buildHeading: (name) => `${name}で今夜泊まれる宿(直前予約)`,
    buildResultsHeading: (name, count) => `${name}で今夜泊まれる宿 一覧(${count}件)`,
    buildIntroExtra: (name) =>
      `急な出張や弾丸旅行にも対応できるよう、今日チェックイン・翌日チェックアウトの条件で${name}内の直前予約可能な宿を探せます。`,
    dateRange: tonightRange,
    emptyMessage: "本日チェックインの条件では、空室が見つかりませんでした。",
    // 2026-09-17: GSC実クエリで「大分市 ホテル 直前予約」「京都市 ホテル 直前予約」等、
    // 都道府県名ではなく県庁所在地名で検索されるケースが多数(10都市以上)確認されたが、
    // ページ本文には都道府県名しか登場しておらず、検索語との一致度が低かった可能性がある。
    // 出張(「出張」自体を含むクエリは実際には0件だった)ではなく、県庁所在地名との
    // 表記ゆれが実態と判断し、FAQで自然な形で県庁所在地名に言及する。
    buildFaq: (pref) => [
      {
        q: `${pref.capital}でも今夜泊まれる宿はありますか?`,
        a: `このページは${pref.name}全体を対象に、今日チェックイン・翌日チェックアウトで予約できる宿を検索しています。${pref.capital}を含む${pref.name}内の空室が価格の安い順に表示されます。`,
      },
      {
        q: "急な出張で今日中にホテルを決めたいのですが、対応できますか?",
        a: "はい。このページは直前予約(当日チェックイン)に対応した空室のみを表示しています。楽天トラベルの在庫と連動しているため、表示されているのは現時点で予約可能な宿のみです。",
      },
    ],
  },
  budget: {
    key: "budget",
    pathSuffix: "/budget",
    navLabel: "1万円以下の宿だけ探す",
    buildTitle: (name) => `${name}の格安ホテル｜1万円以下・空室あり - どこいく`,
    buildDescription: (name, catchphrase) =>
      `${name}で1泊1万円以下の予算重視ホテルだけを価格が安い順に一覧表示。日付を指定した検索もできます。${catchphrase}が魅力のエリアです。`,
    buildHeading: (name) => `${name}の格安ホテル(1万円以下)`,
    buildResultsHeading: (name, count) => `${name}の格安ホテル一覧(${count}件)`,
    buildCtaLabel: (name) => `自分の日程で${name}の格安ホテルを検索する`,
    buildIntroExtra: (name) =>
      `こちらは1泊あたり1万円以下という予算条件で絞り込んだ結果で、${name}内の指定人数での実料金が1万円以下の宿泊施設のみを表示しています。`,
    dateRange: thisWeekendRange,
    filters: { maxCharge: 10000 },
    maxDisplayCharge: 10000,
    emptyMessage: "この日程では、1万円以下の条件に合う空室が見つかりませんでした。",
    // 2026-09-02: GSC実クエリ(「◯◯ 格安ホテル」「◯◯ ホテル 安い」等)の言い回しに沿ったFAQ。
    // 表示回数はあるがクリック0という状態を受けて追加(nara/budget等で確認済み)。
    buildFaq: (pref) => [
      {
        q: `${pref.name}で1泊1万円以下のホテルはどう探せばいい?`,
        a: `このページでは、指定した人数での実料金が1泊1万円以下の宿だけを、価格の安い順に絞り込んで表示しています。楽天トラベルの在庫と連動しているため、表示されているのは現時点で予約可能な空室のみです。`,
      },
      {
        q: `${pref.name}の格安ホテルは今日・明日でも予約できる?`,
        a: `このページの表示日程は週末の例ですが、直前予約(当日チェックイン)を探したい場合は「今夜泊まれる宿」のページで同じ${pref.name}内の空室を確認できます。トップページの検索フォームから、ご自身の希望日程で改めて絞り込むことも可能です。`,
      },
      {
        q: "表示されている金額は本当にその値段で泊まれますか?",
        a: "検索時に指定した人数で実際に予約できるプランの料金を表示しています(部屋単位の目安ではなく、指定人数条件に一致する料金です)。最終的な金額・空室状況は、予約ページ(楽天トラベル)で改めてご確認ください。",
      },
      // 2026-09-29: BigQuery定例確認で/areas/nara/budgetが全ページ中最多の表示回数(629)
      // ながらクリック0(平均掲載順位16.6=2ページ目)と判明。ページ内容自体は既に
      // 作り込み済み(上記FAQ等)のため、コンテンツの「量」ではなく検索意図に応える
      // 「質」を補う一問として、実際に鉄道会社の時刻表サイトで検証した所要時間
      // (京都から奈良まで約45分・大阪から約50分)を根拠に追加。奈良を拠点にせず
      // 日帰りする旅行者も多いという実態に即した、格安宿を探す動機の裏付けとなる内容。
      // 数値を創作しないという方針に従い、他県分は一般論のみに留める。
      ...(pref.middleClassCode === "nara"
        ? [
            {
              q: "奈良は大阪・京都から日帰りもできると聞きますが、宿泊する意味はありますか?",
              a: "京都駅から奈良駅までは電車で約45分、大阪駅からも約50分の距離で、日帰り観光も可能です。一方で、朝早くから鹿や寺社をゆっくり見て回りたい場合や、大阪・京都の宿泊料金が混雑期に高騰している場合は、奈良に1泊した方が結果的に安く・余裕を持って回れることがあります。このページでは、そうした比較の判断材料として奈良県内の1万円以下の空室を価格順に表示しています。",
            },
          ]
        : []),
    ],
  },
};

export const AREA_VARIANT_LIST: AreaVariant[] = Object.values(AREA_VARIANTS);
