"use client";

import { useState } from "react";
import { REGION_LABELS, RegionKey } from "@/lib/prefectures";
import { BAND_LABELS, BAND_HINTS, TravelBand } from "@/lib/distanceBands";
import { tonightRange, tomorrowRange, thisWeekendRange, DateRange } from "@/lib/dates";

export type RangeMode = "none" | "band" | "region";

export type SearchValues = {
  address: string;
  checkinDate: string;
  checkoutDate: string;
  mode: RangeMode;
  band?: TravelBand;
  region?: RegionKey;
  sort: "asc" | "desc";
  adults: number;
  children: number;
  infants: number;
  onsen: boolean;
  nonSmoking: boolean;
  maxCharge?: number;
};

const BAND_KEYS = Object.keys(BAND_LABELS) as TravelBand[];
const REGION_KEYS = Object.keys(REGION_LABELS) as RegionKey[];

export default function SearchForm({
  onSearch,
  loading,
  initialMode,
  initialRegion,
  initialCheckinDate,
  initialCheckoutDate,
}: {
  onSearch: (values: SearchValues) => void;
  loading: boolean;
  initialMode?: RangeMode;
  initialRegion?: RegionKey;
  initialCheckinDate?: string;
  initialCheckoutDate?: string;
}) {
  const [address, setAddress] = useState("");
  const [checkinDate, setCheckinDate] = useState(initialCheckinDate ?? "");
  const [checkoutDate, setCheckoutDate] = useState(initialCheckoutDate ?? "");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [mode, setMode] = useState<RangeMode>(initialMode ?? "none");
  const [band, setBand] = useState<TravelBand>("shortTrip");
  const [region, setRegion] = useState<RegionKey>(initialRegion ?? "kanto");
  const [sort, setSort] = useState<"asc" | "desc">("asc");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [onsen, setOnsen] = useState(false);
  const [nonSmoking, setNonSmoking] = useState(false);
  const [maxCharge, setMaxCharge] = useState<string>("");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string>();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch({
      address,
      checkinDate,
      checkoutDate,
      mode,
      band: mode === "band" ? band : undefined,
      region: mode === "region" ? region : undefined,
      sort,
      adults,
      children,
      infants,
      onsen,
      nonSmoking,
      maxCharge: maxCharge ? Number(maxCharge) : undefined,
    });
  }

  function applyPreset(name: string, range: DateRange) {
    setCheckinDate(range.checkinDate);
    setCheckoutDate(range.checkoutDate);
    setActivePreset(name);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationError("この端末では現在地を取得できません");
      return;
    }
    setLocating(true);
    setLocationError(undefined);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `/api/reverse-geocode?lat=${latitude}&lng=${longitude}`
          );
          const data = await res.json();
          if (!res.ok) {
            setLocationError(data.error ?? "住所の取得に失敗しました");
            return;
          }
          setAddress(data.address);
        } catch {
          setLocationError("住所の取得中にエラーが発生しました");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocationError("位置情報の取得が許可されませんでした");
        setLocating(false);
      }
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface border border-line rounded-2xl shadow-sm p-6 md:p-8 grid gap-6 md:grid-cols-2"
    >
      <Field label="日付を選ぶ" full>
        <div className="flex gap-2 mb-1">
          <button
            type="button"
            onClick={() => applyPreset("tonight", tonightRange())}
            className={`pill-button ${
              activePreset === "tonight" ? "pill-button-active" : "pill-button-inactive"
            }`}
          >
            今夜
          </button>
          <button
            type="button"
            onClick={() => applyPreset("tomorrow", tomorrowRange())}
            className={`pill-button ${
              activePreset === "tomorrow" ? "pill-button-active" : "pill-button-inactive"
            }`}
          >
            明日
          </button>
          <button
            type="button"
            onClick={() => applyPreset("weekend", thisWeekendRange())}
            className={`pill-button ${
              activePreset === "weekend" ? "pill-button-active" : "pill-button-inactive"
            }`}
          >
            今週末
          </button>
        </div>
      </Field>

      <Field label="チェックイン">
        <input
          type="date"
          required
          value={checkinDate}
          onChange={(e) => {
            setCheckinDate(e.target.value);
            setActivePreset(null);
          }}
          className="board-input w-full"
        />
      </Field>

      <Field label="チェックアウト">
        <input
          type="date"
          required
          value={checkoutDate}
          onChange={(e) => {
            setCheckoutDate(e.target.value);
            setActivePreset(null);
          }}
          className="board-input w-full"
        />
      </Field>

      <Field label="起点となる住所" full>
        <div className="flex gap-2">
          <input
            type="text"
            required
            placeholder="例: 東京都渋谷区渋谷2-1-1"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="board-input w-full"
          />
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={locating}
            className="pill-button pill-button-inactive whitespace-nowrap disabled:opacity-50"
          >
            {locating ? "取得中…" : "📍 現在地を使う"}
          </button>
        </div>
        {locationError && (
          <p className="text-red-600 text-xs font-body mt-1">{locationError}</p>
        )}
      </Field>

      <Field label="行き先の範囲(任意)" full>
        <div className="flex gap-2 mb-3">
          <ModeButton
            active={mode === "none"}
            onClick={() => setMode("none")}
            label="指定しない"
          />
          <ModeButton
            active={mode === "band"}
            onClick={() => setMode("band")}
            label="距離で選ぶ"
          />
          <ModeButton
            active={mode === "region"}
            onClick={() => setMode("region")}
            label="地方で選ぶ"
          />
        </div>

        {mode === "none" && (
          <p className="text-sub text-xs font-body">
            自宅からある程度離れた(80km〜)エリアを中心に、幅広く空室を探します。
          </p>
        )}

        {mode === "band" && (
          <div className="flex gap-2 flex-wrap">
            {BAND_KEYS.map((key) => (
              <button
                type="button"
                key={key}
                onClick={() => setBand(key)}
                className={`pill-button flex flex-col items-center leading-tight ${
                  band === key ? "pill-button-active" : "pill-button-inactive"
                }`}
              >
                <span>{BAND_LABELS[key]}</span>
                <span className="text-[10px] opacity-80 font-mono">
                  {BAND_HINTS[key]}
                </span>
              </button>
            ))}
          </div>
        )}

        {mode === "region" && (
          <div className="flex gap-2 flex-wrap">
            {REGION_KEYS.map((key) => (
              <button
                type="button"
                key={key}
                onClick={() => setRegion(key)}
                className={`pill-button ${
                  region === key ? "pill-button-active" : "pill-button-inactive"
                }`}
              >
                {REGION_LABELS[key]}
              </button>
            ))}
          </div>
        )}
      </Field>

      <Field label="人数" full>
        <div className="flex gap-4 flex-wrap">
          <Stepper label="大人" value={adults} min={1} max={9} onChange={setAdults} />
          <Stepper
            label="子供(小学生)"
            value={children}
            min={0}
            max={9}
            onChange={setChildren}
          />
          <Stepper label="幼児" value={infants} min={0} max={9} onChange={setInfants} />
        </div>
      </Field>

      <Field label="絞り込み(任意)" full>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-body text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={onsen}
              onChange={(e) => setOnsen(e.target.checked)}
              className="w-4 h-4 accent-accent"
            />
            温泉宿のみ
          </label>
          <label className="flex items-center gap-2 text-sm font-body text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={nonSmoking}
              onChange={(e) => setNonSmoking(e.target.checked)}
              className="w-4 h-4 accent-accent"
            />
            禁煙ルームのみ
          </label>
          <label className="flex items-center gap-2 text-sm font-body text-ink">
            上限予算
            <input
              type="number"
              min={0}
              step={1000}
              placeholder="指定なし"
              value={maxCharge}
              onChange={(e) => setMaxCharge(e.target.value)}
              className="board-input w-28 text-right"
            />
            円
          </label>
        </div>
      </Field>

      <Field label="並び替え">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSort("asc")}
            className={`pill-button ${
              sort === "asc" ? "pill-button-active" : "pill-button-inactive"
            }`}
          >
            安い順
          </button>
          <button
            type="button"
            onClick={() => setSort("desc")}
            className={`pill-button ${
              sort === "desc" ? "pill-button-active" : "pill-button-inactive"
            }`}
          >
            高い順
          </button>
        </div>
      </Field>

      <div className="md:col-span-2 flex items-end">
        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto px-8 py-3 rounded-full bg-accent text-white font-display font-bold text-sm tracking-wide disabled:opacity-50 hover:brightness-110 transition"
        >
          {loading ? "検索中…" : "空室を探す"}
        </button>
      </div>
    </form>
  );
}

function ModeButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pill-button ${active ? "pill-button-active" : "pill-button-inactive"}`}
    >
      {label}
    </button>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-sub font-body">{label}</span>
      <div className="flex items-center gap-2 border border-line rounded-full px-1 py-1 bg-surface">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-7 h-7 rounded-full text-ink hover:bg-bg disabled:opacity-30 font-mono"
        >
          −
        </button>
        <span className="w-5 text-center font-mono text-sm tabnum">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-7 h-7 rounded-full text-ink hover:bg-bg disabled:opacity-30 font-mono"
        >
          ＋
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-2 ${full ? "md:col-span-2" : ""}`}>
      <span className="text-xs uppercase tracking-wideLabel text-sub font-mono">
        {label}
      </span>
      {children}
    </label>
  );
}
