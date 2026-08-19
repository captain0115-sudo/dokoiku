import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "ページが見つかりません | どこいく",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="flex justify-center mb-8">
        <Logo />
      </div>
      <p className="font-mono text-sub text-xs tracking-wideLabel mb-2 uppercase">
        404
      </p>
      <h1 className="font-display font-black text-2xl text-ink mb-3">
        このページは見つかりませんでした
      </h1>
      <p className="text-sub font-body text-sm mb-8">
        URLが間違っているか、ページが移動した可能性があります。
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-3 rounded-full bg-accent text-white font-display font-bold text-sm hover:brightness-110 transition"
      >
        トップに戻って検索する
      </Link>
    </main>
  );
}
