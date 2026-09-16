"use client";

import { useEffect, useState } from "react";

// PWA化計画Phase 1(どこいく/app-ka-pwa-plan-2026-09-16.md)のインストール導線。
// Android/Chromeはネイティブのbeforeinstallpromptを使った「追加する」ボタン、
// iOS Safariはこのイベントが存在しないため「共有→ホーム画面に追加」の手順を案内する
// バナーを表示する。実際のインストール完了はcomponents/PwaAnalytics.tsxで計測している。

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISS_KEY = "dokoiku_install_prompt_dismissed_at";
const DISMISS_DAYS = 14;

function isDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    if (Number.isNaN(dismissedAt)) return false;
    const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
    return daysSince < DISMISS_DAYS;
  } catch {
    // プライベートモード等でlocalStorageが使えない場合は「未却下」扱いにする
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // 保存できなくても致命的ではない(次回also表示されるだけ)
  }
}

function isIos(): boolean {
  return (
    /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream
  );
}

function isStandalone(): boolean {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

type BannerKind = "android" | "ios" | null;

export default function InstallPrompt() {
  const [banner, setBanner] = useState<BannerKind>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    null
  );

  useEffect(() => {
    if (isStandalone() || isDismissedRecently()) return;

    if (isIos()) {
      setBanner("ios");
      return;
    }

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setBanner("android");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  function dismiss() {
    markDismissed();
    setBanner(null);
  }

  async function handleInstallClick() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setBanner(null);
  }

  if (!banner) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 border-t border-line bg-surface shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/icon-192.png"
          alt=""
          className="w-10 h-10 rounded-xl shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-body font-semibold text-xs text-ink">
            どこいくをホーム画面に追加
          </p>
          <p className="text-sub text-[11px] font-body leading-snug">
            {banner === "android"
              ? "アプリのようにすぐ開けるようになります。"
              : "共有ボタン(□↑)から「ホーム画面に追加」を選ぶと、アプリのように使えます。"}
          </p>
        </div>
        {banner === "android" && (
          <button
            type="button"
            onClick={handleInstallClick}
            className="pill-button pill-button-active text-xs shrink-0"
          >
            追加する
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          aria-label="閉じる"
          className="text-sub text-lg leading-none shrink-0 px-1"
        >
          ×
        </button>
      </div>
    </div>
  );
}
