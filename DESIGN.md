# DESIGN.md — どこいく

> このファイルはAIエージェントが正確な日本語UIを生成するためのデザイン仕様書です。
> セクションヘッダーは英語、値の説明は日本語で記述しています。
> 値はすべて`tailwind.config.ts`・`app/globals.css`・実際のコンポーネント実装から
> 実測したものです(2026-09-01時点、推測・創作なし)。

---

## 1. Visual Theme & Atmosphere

- **デザイン方針**: シンプル・実務的。装飾より「価格・距離・日付」という実用情報を
  素早く読ませることを優先する。ホテル予約サイトにありがちな煽り演出(セール感・
  カウントダウン等)は使わない
- **密度**: 情報密度は中程度、余白多め。1カラム中心の構成(`max-w-3xl mx-auto`)
- **キーワード**: フラット、静か、数字重視、信頼感、クールグレー基調

---

## 2. Color Palette & Roles

### Primary（ブランドカラー）

- **Primary** (`#24417A`): トークン名 `accent`。ボタン・選択状態・リンク・CTAに使用
- **Primary Soft** (`#EAF0FA`): トークン名 `accentSoft`。選択中カードの淡い背景
  (ホバーではなくボーダー/バックグラウンドでの強調に使用、Dark版は未定義)

### Semantic（意味的な色）

- **Price / 価格ハイライト** (`#0E7C66`): トークン名 `price`。深いティール。
  価格表示専用の独自セマンティックカラー(汎用のSuccessカラーではない)
- **Danger / Warning / Success（汎用）**: **未定義**。エラー・警告UIは現状サイト内に
  存在しないため、追加する場合は既存パレットと衝突しない色を新規に定義すること
  (既存の`price`(緑系)と紛らわしい緑をSuccessに使わない)

### Neutral（ニュートラル）

- **Text Primary** (`#1C2530`): トークン名 `ink`。本文の基本色
- **Text Secondary** (`#6B7680`): トークン名 `sub`。補足テキスト・キャプション・ラベル
- **Border** (`#E3E7EB`): トークン名 `line`。罫線・境界・カードのボーダー
- **Background** (`#F6F7F9`): トークン名 `bg`。ページ全体の背景(`<body>`に適用)
- **Surface** (`#FFFFFF`): トークン名 `surface`。カード・入力欄の背景

**注意**: 色は必ず上記トークン名(`bg` `surface` `ink` `sub` `line` `accent`
`accentSoft` `price`)で参照し、hexコードを直書きしないこと(`tailwind.config.ts`
の`theme.extend.colors`に定義済み)。

---

## 3. Typography Rules

### 3.1 和文フォント

- **ゴシック体(本文)**: Noto Sans JP
- **ゴシック体(見出し/display)**: Zen Kaku Gothic New
- 明朝体は使用しない

### 3.2 欧文フォント

- **等幅(数字・ラベル用)**: IBM Plex Mono
- 本文・見出し用の欧文単独フォント指定はなし(和文フォントのラテン文字をそのまま使用)

### 3.3 font-family 指定

実際の`tailwind.config.ts`定義:

```css
/* display（見出し） */
font-family: "Zen Kaku Gothic New", sans-serif;

/* body（本文） */
font-family: "Noto Sans JP", sans-serif;

/* mono（数字・ラベル） */
font-family: "IBM Plex Mono", monospace;
```

Tailwindユーティリティ`font-display` / `font-body` / `font-mono`経由で指定する
(直書き禁止)。

**読み込みウェイト(`app/layout.tsx`で明示的に絞り込み済み、PageSpeed対策)**:
- Zen Kaku Gothic New: **700・900のみ**(`font-bold` / `font-black`)
- Noto Sans JP: 400・500・600(`font-normal` / `font-medium` / `font-semibold`)
- IBM Plex Mono: **400・600のみ**(通常 / `font-semibold`)

未読み込みのウェイト(Zen Kaku Gothic New の 400/500 など)をコード中で指定しても
実際には表示されないため使わないこと。

### 3.4 文字サイズ・ウェイト階層

実際にコードベースで使われているサイズ(Tailwindのデフォルトスケール):

| Role | Font | Size | Weight | 備考 |
|------|------|------|--------|------|
| Display (H1) | font-display | text-3xl (30px) / md:text-5xl (48px) | font-black (900) | トップページ見出し |
| Heading 2 | font-display | text-xl (20px) | font-bold (700) | セクション見出し |
| Body | font-body | text-sm (14px) / sm:text-base (16px) | font-normal〜font-medium | 本文・ホテル名 |
| Caption | font-body / font-mono | text-xs (12px) | font-normal | 補足説明、距離・評価表示 |
| Small | font-mono | text-[10px] / text-[11px] | font-semibold | バッジ・CTA文言・最小ラベル |
| Price | font-mono | text-base (16px) / sm:text-lg (18px) | font-semibold | 価格表示専用 |

### 3.5 行間・字間

- 個別の`line-height`上書きはほぼ使用せず、Tailwindのデフォルト行間 + 見出しのみ
  `leading-tight`を指定(H1)
- 独自トークン`letterSpacing.wideLabel: 0.12em`が定義済み(現状の主要コンポーネントでの
  使用は未確認、ラベル文言を広めに字間を取りたい場合に使う想定)
- 価格・距離などの数値には`.tabnum`クラス(`font-variant-numeric: tabular-nums`)を
  必ず適用し、桁がガタつかないようにする(`app/globals.css`で定義)

### 3.6 禁則処理・改行ルール

サイト内で明示的な禁則処理CSSは設定していない(ブラウザの標準的な日本語改行処理に依存)。
新規に長い文章を扱うUIを追加する場合は、既存の`.tabnum`と同様に`app/globals.css`へ
共通クラスとして追記すること。

### 3.7 OpenType 機能

現状`font-feature-settings`(`palt` / `kern`)は使用していない。

### 3.8 縦書き

該当なし(全ページ横書き)。

---

## 4. Component Stylings

### Buttons（`app/globals.css`の`.pill-button`系）

**Active（選択中）**
- Background: `accent` (`#24417A`)
- Text: `white`
- Border: `accent`

**Inactive（未選択）**
- Background: `surface` (`#FFFFFF`)
- Text: `sub` (`#6B7680`)
- Border: `line` (`#E3E7EB`)
- Hover: Border `accent/50`、Text `ink`

**共通**
- Padding: `px-3.5 py-2`(14px / 8px)
- Border Radius: `rounded-full`
- Font: `text-sm font-body`

### Inputs（`.board-input`）

- Background: `surface` (`#FFFFFF`)
- Border: 1px solid `line` (`#E3E7EB`)
- Border (focus): `accent` + `ring-2 ring-accent/20`
- Border Radius: `rounded-lg`(8px)
- Padding: `px-3 py-2.5`(12px / 10px)
- Font Size: `text-sm`(14px)
- Placeholder: `sub/60`

### Cards

- Background: `surface` (`#FFFFFF`)
- Border: 1px solid `line` (`#E3E7EB`)
- Border Radius: `rounded-2xl`(16px、セクションカード) / `rounded-xl`(12px、ホテルカード自体)
- Padding: `p-4`(16px)
- Shadow: `shadow-sm`のみ(Depth & Elevation参照)
- 選択中/強調状態(`HotelCard`の`highlighted`): `ring-2 ring-accent bg-accentSoft`

---

## 5. Layout Principles

### Spacing Scale

実際に使われているTailwindのスペーシング値(独自スケールの再定義はなし):

| Token | Value | 主な用途 |
|-------|-------|----------|
| XS | 8px (`2`) | アイコンとテキストの間隔 |
| S | 12px (`3`) | カード内要素の間隔、`gap-3` |
| M | 16px (`4`) | カードのpadding、`gap-4` |
| L | 24px (`6`) | セクション内の余白 |
| XL | 40px (`10`) | ヒーローセクションのpadding |
| XXL | 56px (`14`) | ページ全体の縦padding(`main`の`py-14`) |

### Container

- Max Width: `max-w-3xl`(768px、全ページ共通、`main`・`Footer`とも同じ値)
- Padding (horizontal): `px-4`(16px)

### Grid

- ホテルカード: `grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto] gap-3 sm:gap-4`
  (画像・本文・価格の3カラム、モバイルは画像+本文の2カラムで価格は下に折り返し)
- 特徴紹介セクション: `grid gap-4 sm:grid-cols-3`

---

## 6. Depth & Elevation

サイト全体で**`shadow-sm`(Tailwindデフォルト: `0 1px 2px 0 rgb(0 0 0 / 0.05)`)のみ**を
使用しており、これより強い影(レベル2・3相当のモーダル用シャドウ等)は現状どこにも
存在しない(コードベース全体をgrep済み)。

| Level | Shadow | 用途 |
|-------|--------|------|
| 0 | none | 通常のカード(ボーダーのみで区切る) |
| 1 | `shadow-sm` | 検索フォーム、ホテルリスト全体のコンテナ |
| 2以上 | **未使用** | 追加する場合はこのフラットなトーンを崩さないよう慎重に検討する |

---

## 7. Do's and Don'ts

### Do（推奨）

- 色は必ずTailwindのカラートークン(`bg` `surface` `ink` `sub` `line` `accent`
  `accentSoft` `price`)で参照する
- 価格・距離・日付などの数値には`.tabnum`を適用する
- カードの角丸は `rounded-xl`(12px・小要素) / `rounded-2xl`(16px・カード) /
  `rounded-3xl`(24px・ヒーロー等の大きな枠)の3段階に統一する
- ボタン系のUIは`rounded-full`のピル型に統一する
- 新しいブランド素材(アイコン・OGP画像等)を作る際は、実際に`getComputedStyle`等で
  現行の色を取得してから使う(過去にアイコンの背景色を取り違えた実例あり、目視・記憶
  だけで色を決めない)

### Don't（禁止）

- `line`(`#E3E7EB`)以外の色でボーダーを引かない
- `shadow-md`以上の強い影を追加しない(このサイトは終始`shadow-sm`のみのフラットな
  トーン)
- Zen Kaku Gothic Newに700/900以外のウェイト、IBM Plex Monoに400/600以外の
  ウェイトを指定しない(フォントファイルが読み込まれておらずフォールバック表示になる)
- `price`(緑系ティール)を汎用のSuccess/OK表現に流用しない(価格専用の意味を持つ色)

---

## 8. Responsive Behavior

### Breakpoints

Tailwindデフォルトのブレークポイントのうち、**`sm`(640px)と`md`(768px)のみ**を
実際に使用している(`lg` `xl`はコードベース全体で未使用)。

| Name | Width | 説明 |
|------|-------|------|
| Mobile | < 640px | 基本レイアウト(1カラム、価格は本文の下に折り返し) |
| sm | ≥ 640px | ホテルカードが画像+本文+価格の3カラムに |
| md | ≥ 768px | 一部の見出し・ボタンサイズが拡大(使用箇所は限定的) |

### タッチターゲット

明示的な最小サイズ指定はなし。ボタン類は`py-2`前後のpaddingで実用上44px相当を
概ね確保しているが、新規追加時はWCAG基準(44×44px)を意識すること。

### フォントサイズの調整

H1のみ`text-3xl`(30px、モバイル) → `md:text-5xl`(48px、デスクトップ)と明示的に
切り替えている。他の見出し・本文はモバイル/デスクトップで基本的に同じサイズを使う
(`sm:text-base`のような微調整のみ)。

---

## 9. Agent Prompt Guide

### クイックリファレンス

```
Primary Color: #24417A (accent)
Primary Soft: #EAF0FA (accentSoft)
Price Color: #0E7C66 (price)
Text Color: #1C2530 (ink) / Sub Text: #6B7680 (sub)
Border: #E3E7EB (line)
Background: #F6F7F9 (bg) / Surface: #FFFFFF (surface)
Font (display): "Zen Kaku Gothic New" — 700/900のみ
Font (body): "Noto Sans JP" — 400/500/600
Font (mono): "IBM Plex Mono" — 400/600のみ、数値には.tabnumを併用
Container: max-w-3xl mx-auto px-4
Radius: rounded-xl(12px) / rounded-2xl(16px) / rounded-3xl(24px) / rounded-full(ボタン)
Shadow: shadow-smのみ
```

### プロンプト例

```
どこいくのデザインシステムに従って、新しいセクションを作成してください。
- 背景: bg-surface、ボーダー: border-line、角丸: rounded-2xl、影: shadow-sm
- 見出しはfont-display font-bold text-xl text-ink
- 本文はfont-body text-sm text-sub
- 数値を含む場合は必ずtabnumクラスを付与し、font-mono text-priceで価格を強調する
- 新しい色を追加しない。既存トークン(bg/surface/ink/sub/line/accent/accentSoft/price)
  の組み合わせだけで表現する
```
