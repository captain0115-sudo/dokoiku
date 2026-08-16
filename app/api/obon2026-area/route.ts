import { NextRequest, NextResponse } from "next/server";
import { findPrefecture } from "@/lib/prefectures";
import { searchVacantHotelsByArea, type HotelResult } from "@/lib/rakuten";
import { resolvePastDateRange } from "@/lib/dates";

// /obon2026 の各エリアカードで、サーバー側の逐次取得(ISR生成時)が
// 楽天API側のレート制限(429)で失敗した場合に、実際のユーザーのブラウザから
// 個別に再取得するための専用エンドポイント(2026-08-14追加)。
// サイト内の他ルートと同時に実行されるタイミングがISR生成時とは異なるため、
// 同じ瞬間の429に巻き込まれにくく、ISRキャッシュが1時間固定される問題を
// ユーザー側で実質的に解消できる。任意のlat/lngを受け付けず、対象6県のみに限定する。

// /obon2026本体と同じテーマ日付・同じ「過去日付なら今日にスライド」ロジックを使う
// (片方だけ直しても、もう片方が過去日付のままだと同じ理由で全滅するため)。
const THEME_CHECKIN_DATE = "2026-08-22";
const THEME_CHECKOUT_DATE = "2026-08-24";
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
