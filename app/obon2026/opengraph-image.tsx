import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "どこいく | お盆休み2026の空室ホテル特集";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Obon2026OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#F6F7F9",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="48" height="48" viewBox="0 0 26 26" fill="none">
            <path
              d="M13 2C8.58 2 5 5.58 5 10c0 6 8 14 8 14s8-8 8-14c0-4.42-3.58-8-8-8z"
              fill="none"
              stroke="#24417A"
              strokeWidth="1.8"
            />
            <circle cx="13" cy="10" r="3" fill="#0E7C66" />
          </svg>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#1C2530" }}>
            どこいく
          </div>
        </div>
        <div
          style={{
            fontSize: 60,
            fontWeight: 900,
            color: "#1C2530",
            marginTop: 32,
          }}
        >
          お盆休み2026の空室ホテル特集
        </div>
        <div style={{ fontSize: 28, color: "#6B7680", marginTop: 20 }}>
          8月13日〜16日を例に、6エリアの空室を価格順に
        </div>
        <div style={{ fontSize: 22, color: "#0E7C66", marginTop: 32 }}>
          行き先じゃなく、日付から探すホテル検索
        </div>
      </div>
    ),
    { ...size }
  );
}
