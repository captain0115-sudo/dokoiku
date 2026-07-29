/**
 * 日付関連のユーティリティ。
 * 「今夜/明日/今週末」のクイック選択に使用する。
 */

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
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
  return {
    checkinDate: toDateString(now),
    checkoutDate: toDateString(addDays(now, 1)),
  };
}

/** 明日(明日チェックイン・明後日チェックアウト) */
export function tomorrowRange(now = new Date()): DateRange {
  const checkin = addDays(now, 1);
  return {
    checkinDate: toDateString(checkin),
    checkoutDate: toDateString(addDays(checkin, 1)),
  };
}

/**
 * 今週末(直近の土曜チェックイン・日曜チェックアウト)。
 * 今日が土曜/日曜の場合は今日を起点にする。
 */
export function thisWeekendRange(now = new Date()): DateRange {
  const day = now.getDay(); // 0:日 1:月 ... 6:土
  let daysUntilSaturday: number;

  if (day === 6) {
    daysUntilSaturday = 0; // 今日が土曜
  } else if (day === 0) {
    daysUntilSaturday = 6; // 今日が日曜 → 来週の土曜まで進める
  } else {
    daysUntilSaturday = 6 - day;
  }

  const checkin = addDays(now, daysUntilSaturday);
  return {
    checkinDate: toDateString(checkin),
    checkoutDate: toDateString(addDays(checkin, 1)),
  };
}
