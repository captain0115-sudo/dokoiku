"use client";

import { useEffect, useState } from "react";
import HotelCard from "@/components/HotelCard";
import type { HotelResult } from "@/lib/rakuten";

// サーバー側(ISR生成時)の取得が楽天APIのレート制限で失敗したエリアを、
// ユーザーのブラウザから個別に再取得して表示する(2026-08-14追加)。
// 失敗したまま1時間キャッシュに固定されるのを防ぐための補助的な仕組み。
export default function ObonAreaRetry({
  areaCode,
  prefName,
  nights,
}: {
  areaCode: string;
  prefName: string;
  nights: number;
}) {
  const [status, setStatus] = useState<"loading" | "ok" | "failed">("loading");
  const [hotels, setHotels] = useState<HotelResult[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/obon2026-area?area=${areaCode}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data.hotels) && data.hotels.length > 0) {
          setHotels(data.hotels);
          setStatus("ok");
        } else {
          setStatus("failed");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });
    return () => {
      cancelled = true;
    };
  }, [areaCode]);

  if (status === "loading") {
    return (
      <p className="text-sub font-body text-xs bg-surface border border-line rounded-xl p-4">
        {prefName}の空室情報を再取得しています…
      </p>
    );
  }

  if (status === "failed") {
    return (
      <p className="text-sub font-body text-xs bg-surface border border-line rounded-xl p-4">
        現在、{prefName}の空室情報を取得できませんでした。しばらくしてから再度お試しください。
      </p>
    );
  }

  return (
    <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm">
      <div className="px-3 divide-y divide-line">
        {hotels.map((hotel) => (
          <HotelCard
            key={hotel.hotelNo}
            hotel={hotel}
            nights={nights}
            distanceLabel={`${prefName}の中心部から`}
          />
        ))}
      </div>
    </div>
  );
}
