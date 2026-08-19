import { Suspense } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import HomeSearch from "@/components/HomeSearch";
import { thisWeekendRange, tomorrowRange } from "@/lib/dates";

const FAQ_ITEMS = [
  {
    q: "行き先を決めずに検索して大丈夫ですか?",
    a: "検索結果ではホテル名・写真・口コミ評価・自宅からの距離を確認してから選べます。自動で予約されることはなく、実際に泊まるホテルは表示された候補の中から自分で選んで予約ページに進む形です。",
  },
  {
    q: "表示されている価格は本当にその金額で泊まれますか?",
    a: "検索時に指定した人数で実際に予約できるプランの料金を表示しています(部屋単位の目安ではなく、指定人数条件に一致する料金です)。最終的な金額・空室状況は、予約ページ(楽天トラベル)で改めてご確認ください。",
  },
  {
    q: "どこいくで直接予約できますか?",
    a: "どこいくは日付・距離を起点にホテルを検索・比較するためのサービスです。実際の予約は提携先の楽天トラベルのページで行います。",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

// 2026-08-20: それまで"use client"のページ全体だったため、useSearchParams+Suspenseの
// 構造上、生HTML(サーバーレンダリング結果)にH1すら含まれていないことが判明していた
// (2026-08-14のIA改善時に既知の課題として記録、[[ia-ux-proposal-2026-08-14]]参照)。
// H1・特徴紹介・使い方・こんな時に・FAQ等の静的な部分をサーバーコンポーネントに戻し、
// 検索フォーム・検索結果(useState/useSearchParamsが必要な部分)だけを
// components/HomeSearch.tsx (クライアントコンポーネント)に切り出した。
export default function Home() {
  const weekend = thisWeekendRange();
  const tomorrow = tomorrowRange();

  return (
    <main className="max-w-3xl mx-auto px-4 py-14">
      <header className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-accentSoft via-surface to-white px-6 py-10 sm:px-10 sm:py-14 mb-10">
        {/* 画像アセット不要な範囲での装飾(ぼかした円の重なりで奥行きを演出) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-accent/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-price/10 blur-3xl"
        />
        <div className="relative">
          <div className="mb-5">
            <Logo />
          </div>
          <h1 className="font-display font-black text-3xl md:text-5xl text-ink leading-tight">
            行き先じゃなく、
            <br className="sm:hidden" />
            日付から。
          </h1>
          <p className="text-sub mt-4 font-body text-sm md:text-base max-w-md">
            日付と自宅からの範囲で、今空いているホテルを価格順に見つけます。
          </p>
          <Link
            href="/obon2026"
            className="inline-flex items-center gap-1.5 mt-6 px-4 py-2 rounded-full bg-white/70 border border-line text-ink text-xs font-mono font-semibold hover:bg-white transition"
          >
            🌻 季節特集: 夏休み後半(8/22〜8/24)の空室ホテルを見る
          </Link>
        </div>
      </header>

      <Suspense
        fallback={
          <div
            id="search-form"
            className="h-64 rounded-2xl border border-line bg-surface animate-pulse"
            aria-hidden="true"
          />
        }
      >
        <HomeSearch />
      </Suspense>

      {/* SEO監査(2026-08-13)で指摘: H2見出しが一切なくサービス説明が薄いとのことで追加。
          既存機能の説明のみで、実績・効果を誇張する表現は入れない。 */}
      <section className="mt-14">
        <h2 className="font-display font-bold text-xl text-ink mb-4">
          どこいくの特徴
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="font-body font-semibold text-sm text-ink mb-1">
              行き先じゃなく日付から探す
            </p>
            <p className="text-sub text-xs font-body leading-relaxed">
              先に「いつ空いているか」を決めてから、その日程で泊まれる宿を探せます。行き先を先に決めなくても検索できます。
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="font-body font-semibold text-sm text-ink mb-1">
              価格順で一覧表示
            </p>
            <p className="text-sub text-xs font-body leading-relaxed">
              検索結果は宿泊料金の安い順に並びます。一件ずつ開いて比較する手間を減らせます。
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="font-body font-semibold text-sm text-ink mb-1">
              自宅からの範囲・地方で絞り込み
            </p>
            <p className="text-sub text-xs font-body leading-relaxed">
              自宅から◯km圏内、または地方単位(関東・関西など)で検索範囲を指定できます。複数エリアの空室を一度に比較できます。
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display font-bold text-xl text-ink mb-4">
          使い方
        </h2>
        <ol className="grid gap-3 sm:grid-cols-3 list-none">
          <li className="rounded-2xl border border-line bg-surface p-4">
            <p className="font-mono text-xs text-accent mb-1">STEP 1</p>
            <p className="text-sub text-xs font-body leading-relaxed">
              チェックイン・チェックアウトの日付を入力します。
            </p>
          </li>
          <li className="rounded-2xl border border-line bg-surface p-4">
            <p className="font-mono text-xs text-accent mb-1">STEP 2</p>
            <p className="text-sub text-xs font-body leading-relaxed">
              行き先の範囲(自宅からの距離、または地方)を必要に応じて指定します。
            </p>
          </li>
          <li className="rounded-2xl border border-line bg-surface p-4">
            <p className="font-mono text-xs text-accent mb-1">STEP 3</p>
            <p className="text-sub text-xs font-body leading-relaxed">
              検索ボタンを押すと、条件に合う宿が価格順に一覧表示されます。
            </p>
          </li>
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="font-display font-bold text-xl text-ink mb-4">
          こんな時に
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href={`/?checkin=${weekend.checkinDate}&checkout=${weekend.checkoutDate}#search-form`}
            className="block rounded-2xl border border-line bg-surface p-4 hover:border-accent hover:bg-accentSoft transition"
          >
            <p className="text-2xl mb-2" aria-hidden="true">🗓️</p>
            <p className="font-body font-semibold text-sm text-ink mb-1">
              週末の予定がまだ決まっていない
            </p>
            <p className="text-sub text-xs font-body leading-relaxed">
              行き先を決める前に、今週末空いている日程から旅先を考えたい時に。タップで今週末の日程を入力します。
            </p>
          </Link>
          <Link
            href={`/?checkin=${tomorrow.checkinDate}&checkout=${tomorrow.checkoutDate}&band=shortTrip#search-form`}
            className="block rounded-2xl border border-line bg-surface p-4 hover:border-accent hover:bg-accentSoft transition"
          >
            <p className="text-2xl mb-2" aria-hidden="true">💼</p>
            <p className="font-body font-semibold text-sm text-ink mb-1">
              出張や帰省のついでに
            </p>
            <p className="text-sub text-xs font-body leading-relaxed">
              日程は決まっているが行き先の候補は絞れていない時に。タップで明日の日程・小旅行圏(〜250km)を入力します。
            </p>
          </Link>
          <Link
            href="/#search-form"
            className="block rounded-2xl border border-line bg-surface p-4 hover:border-accent hover:bg-accentSoft transition"
          >
            <p className="text-2xl mb-2" aria-hidden="true">💴</p>
            <p className="font-body font-semibold text-sm text-ink mb-1">
              1軒にこだわらず、安さ優先で
            </p>
            <p className="text-sub text-xs font-body leading-relaxed">
              特定のホテルではなく、条件に合う中で価格が安い宿を優先して選びたい時に。安い順表示が標準です。
            </p>
          </Link>
        </div>
      </section>

      {/* IA改善提案(2026-08-14)への対応:「行き先を決めずに予約」という逆転した
          行動フローへの心理的不安に先回りして答えるFAQセクション */}
      <section className="mt-10 mb-4">
        <h2 className="font-display font-bold text-xl text-ink mb-4">
          よくある質問
        </h2>
        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.q}
              className="rounded-2xl border border-line bg-surface p-4 group"
            >
              <summary className="font-body font-semibold text-sm text-ink cursor-pointer list-none flex items-center justify-between gap-2">
                {item.q}
                <span className="text-sub text-xs font-mono shrink-0 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="text-sub text-xs font-body leading-relaxed mt-2">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </main>
  );
}
