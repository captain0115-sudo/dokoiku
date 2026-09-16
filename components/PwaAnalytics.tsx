"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";
import { sendGAEvent } from "@next/third-parties/google";

/**
 * PWA化計画(どこいく/app-ka-pwa-plan-2026-09-16.md)のPhase 0: 計測基盤。
 * ホーム画面追加の導線(manifest.json・Service Worker)を作る前に、まず
 * 「どれだけホーム画面追加・スタンドアロン起動が発生しているか」を計測できるように
 * しておく。この数値がPhase 3(Androidストア掲載)着手可否の判断ゲートになる。
 *
 * 2026-09-16追記: Vercel Analyticsのカスタムイベント(track())は現在のプラン
 * (Hobby)では閲覧できない(Vercelダッシュボード側がPro限定の機能)ことが判明した
 * ため、既に導入済みのGA4(無料)にも同じイベントを送るようにした。track()呼び出し
 * 自体は将来Proに上げた場合に備えて残してある。
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
      sendGAEvent("event", "pwa_standalone_session");
    }

    // Android/Chromeで「ホーム画面に追加」を提案可能になったタイミング(まだインストールはされていない、
    // 導線を実装した後の母数把握用)
    function handleBeforeInstallPrompt() {
      track("pwa_install_promptable");
      sendGAEvent("event", "pwa_install_promptable");
    }
    // 実際にインストールが完了したタイミング(確実な成功シグナル)
    function handleAppInstalled() {
      track("pwa_installed");
      sendGAEvent("event", "pwa_installed");
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
