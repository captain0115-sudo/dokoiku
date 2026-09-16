"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

/**
 * PWA化計画(どこいく/app-ka-pwa-plan-2026-09-16.md)のPhase 0: 計測基盤。
 * ホーム画面追加の導線(manifest.json・Service Worker)を作る前に、まず
 * 「どれだけホーム画面追加・スタンドアロン起動が発生しているか」を計測できるように
 * しておく。この数値がPhase 3(Androidストア掲載)着手可否の判断ゲートになる。
 */
export default function PwaAnalytics() {
  useEffect(() => {
    // 既にホーム画面から起動されている(スタンドアロン表示)かどうかを判定。
    // Android/ChromeはmatchMedia、iOS SafariはUAが異なりnavigator.standaloneで判定する。
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      track("pwa_standalone_session");
    }

    // Android/Chromeで「ホーム画面に追加」を提案可能になったタイミング(まだインストールはされていない、
    // 導線を実装した後の母数把握用)
    function handleBeforeInstallPrompt() {
      track("pwa_install_promptable");
    }
    // 実際にインストールが完了したタイミング(確実な成功シグナル)
    function handleAppInstalled() {
      track("pwa_installed");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  return null;
}
