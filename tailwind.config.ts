import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#F6F7F9",        // ページ背景(明るいクールグレー)
        surface: "#FFFFFF",   // カード・入力欄の背景
        ink: "#1C2530",       // 本文の基本色(濃紺寄りの黒)
        sub: "#6B7680",       // 補足テキスト
        line: "#E3E7EB",      // 罫線・境界
        accent: "#24417A",    // ボタン・選択状態(落ち着いた紺)
        accentSoft: "#EAF0FA",// 選択状態の淡い背景
        price: "#0E7C66",     // 価格のハイライト(深いティール)
      },
      fontFamily: {
        display: ["'Zen Kaku Gothic New'", "sans-serif"],
        body: ["'Noto Sans JP'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      letterSpacing: {
        wideLabel: "0.12em",
      },
    },
  },
  plugins: [],
};
export default config;
