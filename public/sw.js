// どこいく PWA Service Worker(app-ka-pwa-plan-2026-09-16.md Phase 1)
//
// 方針: ホテル空室データ(/api/*)は絶対にキャッシュしない。空室・価格はリアルタイム性が
// 命であり、古いキャッシュを誤って表示すると「実際には無い空室」を見せてしまうことに
// なるため([[room-content-restrictions]]的な「実データのみ表示」方針と同じ理由)。
// キャッシュするのは静的アセット(JS/CSS/画像/アイコン)とオフラインフォールバック画面のみ。

const CACHE_VERSION = "dokoiku-pwa-v1";
const OFFLINE_URL = "/offline.html";

const APP_SHELL = [OFFLINE_URL, "/brand/icon-192.png", "/brand/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // GET以外(POST等)には一切介入しない
  if (request.method !== "GET") return;

  // 同一オリジン以外(Googleフォント・GA・Vercel Analytics・楽天の画像等)には介入しない
  if (new URL(request.url).origin !== self.location.origin) return;

  // ホテル空室データ等のAPIは常にネットワークから取得する(キャッシュしない)
  if (request.url.includes("/api/")) return;

  // ページ遷移(HTMLナビゲーション): ネットワーク優先、失敗時のみオフライン画面を表示
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  // 静的アセット(_next/static・画像・フォント等): キャッシュ優先、裏で最新版を取得して
  // 次回用に更新する(stale-while-revalidate)
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "image" ||
    request.destination === "font" ||
    request.url.includes("/_next/static/")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
  }
});
