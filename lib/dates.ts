/**
 * 日付関連のユーティリティ。
 * 「今夜/明日/今週末」のクイック選択に使用する。
 */

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * 実行環境のローカルタイムゾーンに関係なく、常にJST(日本時間)基準で
 * 日付を扱うためのヘルパー。
 *
 * 2026-09-06発見: Vercel(サーバー)はUTCで動作するため、`new Date()`を
 * そのまま`getFullYear()`/`getDate()`等のローカルゲッターで読むと、
 * JSTで見て日付が変わった後(0:00〜8:59 JST)でもUTC基準ではまだ前日のため、
 * 「今夜泊まれる宿」ページ等が丸9時間分、日本時間で言う「昨日」の日付で
 * 楽天APIを検索してしまい、過去日付として空室0件になる不具合があった。
 * 渡されたDateのUTC時刻に+9時間した上でUTCゲッター/セッターで読み書きすることで、
 * 実行環境のタイムゾーンに依存せずJSTの暦日を安定して扱えるようにする。
 */
function toJstShifted(d: Date): Date {
  return new Date(d.getTime() + JST_OFFSET_MS);
}

function toDateString(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

export type DateRange = { checkinDate: string; checkoutDate: string };

/** チェックイン・チェックアウト日から宿泊数(泊)を計算する */
export function nightsBetween(checkinDate: string, checkoutDate: string): number {
  const checkin = new Date(checkinDate);
  const checkout = new Date(checkoutDate);
  const diffMs = checkout.getTime() - checkin.getTime();
  const nights = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 1;
}

/** 今夜(今日チェックイン・翌日チェックアウト) */
export function tonightRange(now = new Date()): DateRange {
  const jstNow = toJstShifted(now);
  return {
    checkinDate: toDateString(jstNow),
    checkoutDate: toDateString(addDays(jstNow, 1)),
  };
}

/** 明日(明日チェックイン・明後日チェックアウト) */
export function tomorrowRange(now = new Date()): DateRange {
  const checkin = addDays(toJstShifted(now), 1);
  return {
    checkinDate: toDateString(checkin),
    checkoutDate: toDateString(addDays(checkin, 1)),
  };
}

/**
 * 特集ページ等で固定の日付(例: "2026-08-13")を使う場合、時間経過でその日付が
 * 過去になると楽天APIが「specify valid checkinDate」で全件エラーになる
 * (2026-08-14、/obon2026で実際に全エリア機能不全になる事象で発覚)。
 * チェックイン日が過去になっていたら、宿泊数を保ったまま「今日」までスライドさせる
 * ことで、期限管理を忘れても恒久的に壊れないようにする。
 */
export function resolvePastDateRange(
  checkinDate: string,
  checkoutDate: string,
  now = new Date()
): DateRange {
  const jstNow = toJstShifted(now);
  const todayStr = toDateString(jstNow);
  if (checkinDate >= todayStr) {
    return { checkinDate, checkoutDate };
  }
  const nights = nightsBetween(checkinDate, checkoutDate);
  return {
    checkinDate: todayStr,
    checkoutDate: toDateString(addDays(jstNow, nights)),
  };
}

/**
 * 今週末(直近の土曜チェックイン・日曜チェックアウト)。
 * 今日が土曜/日曜の場合は今日を起点にする。
 */
export function thisWeekendRange(now = new Date()): DateRange {
  const jstNow = toJstShifted(now);
  const day = jstNow.getUTCDay(); // 0:日 1:月 ... 6:土(JST基準)
  let daysUntilSaturday: number;

  if (day === 6) {
    daysUntilSaturday = 0; // 今日が土曜
  } else if (day === 0) {
    daysUntilSaturday = 6; // 今日が日曜 → 来週の土曜まで進める
  } else {
    daysUntilSaturday = 6 - day;
  }

  const checkin = addDays(jstNow, daysUntilSaturday);
  return {
    checkinDate: toDateString(checkin),
    checkoutDate: toDateString(addDays(checkin, 1)),
  };
}
