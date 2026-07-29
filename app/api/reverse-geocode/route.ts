import { NextRequest, NextResponse } from "next/server";

/**
 * 緯度経度 → 住所文字列。
 * 「現在地を使う」ボタン用。無料のNominatim(OpenStreetMap)を利用。
 * 利用ポリシー上、User-Agentの設定とリクエスト頻度への配慮が必要。
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const lat = params.get("lat");
  const lng = params.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat, lng は必須です" }, { status: 400 });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lng)}&accept-language=ja&zoom=18`;

    const res = await fetch(url, {
      headers: {
        // Nominatimの利用ポリシー上、識別可能なUser-Agentが必須
        "User-Agent": "dokoiku-app/0.1 (personal project)",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `逆ジオコーディングに失敗しました(${res.status})` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const addr = data.address ?? {};

    // 日本語住所として自然になりそうな順に組み立てる
    const parts = [
      addr.state, // 都道府県
      addr.city ?? addr.town ?? addr.county, // 市区町村
      addr.suburb ?? addr.neighbourhood, // 町域
      addr.road, // 通り(あれば)
    ].filter(Boolean);

    const address = parts.length > 0 ? parts.join("") : data.display_name;

    if (!address) {
      return NextResponse.json(
        { error: "現在地から住所を特定できませんでした" },
        { status: 404 }
      );
    }

    return NextResponse.json({ address });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "逆ジオコーディング中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
