/**
 * 軽量A/Bテスト基盤(2026-10-02新設)。
 *
 * バックエンド(DB・Edge Config等)を持たない静的/サーバーレス構成のため、
 * 「本格的なオンライン強化学習」ではなく、下記の簡易ループで運用する:
 *   1. 訪問者ごとにクライアント側(localStorage)でバリアントを1回だけ抽選・固定
 *   2. 露出(ab_test_exposure)とコンバージョン(hotel_click等)の両方にバリアントIDを
 *      タグ付けしてGA4に送る
 *   3. 週次のGSC/GA4定例確認時に、GA4でバリアント別のコンバージョン率を比較する
 *   4. 明確な差がついたら、このファイルのweightを書き換えて勝ちパターンに寄せる
 *      (またはAB_TESTSから対象を外して固定文言に統一する)
 *
 * 現状のhotel_click発生数(週あたり一桁〜十数件)では、全パターンに均等配分したままだと
 * シグナルが貯まるまで時間がかかる。差が明確になるまでは焦って判定しないこと。
 */

export type AbTestId = "search_cta_copy";

export type AbVariant = { id: string; weight: number; label: string };

export const AB_TESTS: Record<AbTestId, { variants: AbVariant[] }> = {
  // トップページの検索ボタン文言テスト(2026-10-02開始)。
  // hotel_clickの大半がトップページで発生するため、検索導線の入口であるこのボタンを
  // 最初のテスト対象に選んだ(ユーザーとの対話で確認済み)。
  search_cta_copy: {
    variants: [
      { id: "control", weight: 1, label: "空室を探す" },
      { id: "urgency", weight: 1, label: "今すぐ空室を見る" },
      { id: "date_specific", weight: 1, label: "この日程で検索する" },
    ],
  },
};

const DEFAULT_VARIANT: Record<AbTestId, string> = {
  search_cta_copy: "control",
};

function storageKey(testId: AbTestId) {
  return `dokoiku_ab_${testId}`;
}

function pickWeighted(variants: AbVariant[]): AbVariant {
  const total = variants.reduce((sum, v) => sum + v.weight, 0);
  let r = Math.random() * total;
  for (const v of variants) {
    if (r < v.weight) return v;
    r -= v.weight;
  }
  return variants[variants.length - 1];
}

/**
 * クライアント側でのみ呼ぶこと(SSR時はデフォルトを返す)。
 * 初回訪問時はランダム抽選してlocalStorageに固定し、露出イベントを送る。
 * 2回目以降は保存済みのバリアントをそのまま返す(同一訪問者は常に同じ文言を見る)。
 */
export function resolveAbVariant(
  testId: AbTestId,
  sendExposureEvent: (testId: AbTestId, variantId: string) => void
): string {
  if (typeof window === "undefined") return DEFAULT_VARIANT[testId];
  const key = storageKey(testId);
  try {
    const existing = window.localStorage.getItem(key);
    if (existing && AB_TESTS[testId].variants.some((v) => v.id === existing)) {
      return existing;
    }
    const picked = pickWeighted(AB_TESTS[testId].variants);
    window.localStorage.setItem(key, picked.id);
    sendExposureEvent(testId, picked.id);
    return picked.id;
  } catch {
    // localStorageが使えない環境(プライベートモード等)ではデフォルトに固定する
    return DEFAULT_VARIANT[testId];
  }
}

export function getAbVariantLabel(testId: AbTestId, variantId: string): string {
  const found = AB_TESTS[testId].variants.find((v) => v.id === variantId);
  return found?.label ?? AB_TESTS[testId].variants[0].label;
}
