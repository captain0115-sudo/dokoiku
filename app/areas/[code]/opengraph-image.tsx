import { ImageResponse } from "next/og";
import { findPrefecture } from "@/lib/prefectures";

export const runtime = "edge";
export const alt = "どこいく | 都道府県別ホテル空室状況";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: { code: string } };

export default function AreaOpengraphImage({ params }: Props) {
  const pref = findPrefecture(params.code);
  const name = pref?.name ?? "どこいく";
  const catchphrase = pref?.catchphrase;

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
            fontSize: 64,
            fontWeight: 900,
            color: "#1C2530",
            marginTop: 32,
          }}
        >
          {name}のホテル空室状況
        </div>
        {catchphrase && (
          <div style={{ fontSize: 28, color: "#6B7680", marginTop: 20 }}>
            {catchphrase}
          </div>
        )}
        <div style={{ fontSize: 22, color: "#0E7C66", marginTop: 32 }}>
          行き先じゃなく、日付から探すホテル検索
        </div>
      </div>
    ),
    { ...size }
  );
}
