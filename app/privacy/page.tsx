import Logo from "@/components/Logo";

export const metadata = {
  title: "プライバシーポリシー | どこいく",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-14">
      <div className="mb-8">
        <Logo />
      </div>

      <h1 className="font-display font-black text-2xl text-ink mb-6">
        プライバシーポリシー
      </h1>

      <div className="prose-sm font-body text-ink space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="font-display font-bold text-base mb-2">
            1. 取得する情報
          </h2>
          <p className="text-sub">
            本サービス「どこいく」は、ホテル検索のために以下の情報を利用します。
          </p>
          <ul className="list-disc list-inside text-sub mt-2 space-y-1">
            <li>
              検索条件として入力された住所、またはブラウザから取得した現在地情報
              (「現在地を使う」ボタンを押した場合のみ)
            </li>
            <li>チェックイン・チェックアウト日、宿泊人数などの検索条件</li>
          </ul>
          <p className="text-sub mt-2">
            これらの情報は検索リクエストの処理にのみ利用し、サーバー上に
            保存・蓄積することはありません。
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-base mb-2">
            2. 外部サービスとの連携
          </h2>
          <p className="text-sub">
            ホテルの空室・価格情報の取得には楽天トラベル空室検索APIを、
            住所から位置情報への変換には国土地理院の逆ジオコーディングサービスを、
            現在地から住所への変換には Nominatim(OpenStreetMap)を利用しています。
            検索条件はこれらの外部サービスに送信されます。
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-base mb-2">
            3. アフィリエイトについて
          </h2>
          <p className="text-sub">
            本サービスは楽天アフィリエイトプログラムに参加しており、
            掲載しているホテルへのリンクを経由して予約が成立した場合、
            運営者が成果報酬を受け取ることがあります。
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-base mb-2">
            4. お問い合わせ
          </h2>
          <p className="text-sub">
            本ポリシーに関するお問い合わせは、サービス運営者までご連絡ください。
          </p>
        </section>
      </div>
    </main>
  );
}
