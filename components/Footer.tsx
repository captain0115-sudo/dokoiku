import Link from "next/link";

export default function Footer() {
  return (
    <footer className="max-w-3xl mx-auto px-4 py-8 mt-4">
      <div className="border-t border-line pt-6 flex flex-col gap-2">
        <p className="text-sub text-xs font-body">
          【PR】本サイトは楽天アフィリエイトプログラムに参加しており、
          掲載する宿泊施設へのリンクから成果報酬を受け取る場合があります。
        </p>
        <div className="flex gap-4">
          <Link
            href="/privacy"
            className="text-sub text-xs font-body underline hover:text-ink"
          >
            プライバシーポリシー
          </Link>
        </div>
      </div>
    </footer>
  );
}
