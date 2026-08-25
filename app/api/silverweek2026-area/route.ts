import { NextRequest, NextResponse } from "next/server";
import { findPrefecture } from "@/lib/prefectures";
import { searchVacantHotelsByArea, type HotelResult } from "@/lib/rakuten";
import { resolvePastDateRange } from "@/lib/dates";

// /silverweek2026 の各エリアカードで、サーバー側の逐次取得(ISR生成時)が
// 楽天API側のレート制限(429)で失敗した場合に、実際のユーザーのブラウザから
// 個別に再取得するための専用エンドポイント(/obon2026-areaと同じ設計、2026-08-25追加)。

// /silverweek2026本体と同じテーマ日付・同じ「過去日付なら今日にスライド」ロジックを使う
// (片方だけ直しても、もう片方が過去日付のままだと同じ理由で全滅するため)。
const THEME_CHECKIN_DATE = "2026-09-21";
const THEME_CHECKOUT_DATE = "2026-09-23";
const ALLOWED_CODES = [
  "hokkaido",
  "tokyo",
  "kanagawa",
  "shizuoka",
  "osaka",
  "okinawa",
];

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("area");
  if (!code || !ALLOWED_CODES.includes(code)) {
    return NextResponse.json({ error: "invalid area" }, { status: 400 });
  }
  const pref = findPrefecture(code);
  if (!pref) {
    return NextResponse.json({ error: "invalid area" }, { status: 400 });
  }

  try {
    const { checkinDate, checkoutDate } = resolvePastDateRange(
      THEME_CHECKIN_DATE,
      THEME_CHECKOUT_DATE
    );
    const hotels = await searchVacantHotelsByArea({
      checkinDate,
      checkoutDate,
      areaLat: pref.lat,
      areaLng: pref.lng,
      homeLat: pref.lat,
      homeLng: pref.lng,
      guests: { adults: 1 },
    });
    const sorted: HotelResult[] = [...hotels]
      .sort((a, b) => a.hotelMinCharge - b.hotelMinCharge)
      .slice(0, 4);
    return NextResponse.json({ hotels: sorted });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "取得に失敗しました" },
      { status: 502 }
    );
  }
}
