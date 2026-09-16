"use client";

import { useEffect } from "react";

/**
 * PWA化計画Phase 1(どこいく/app-ka-pwa-plan-2026-09-16.md)。public/sw.jsを登録する。
 * Service Worker未対応ブラウザでは何もしない。登録失敗時もサイトの通常利用には
 * 影響しないため、エラーは握りつぶしてよい。
 */
export default function PwaServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}
