"use client";

import { useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 本番環境でのエラー内容を把握できるよう、コンソールには残しておく
    console.error(error);
  }, [error]);

  return (
    <main className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="flex justify-center mb-8">
        <Logo />
      </div>
      <p className="font-mono text-sub text-xs tracking-wideLabel mb-2 uppercase">
        Error
      </p>
      <h1 className="font-display font-black text-2xl text-ink mb-3">
        予期しないエラーが発生しました
      </h1>
      <p className="text-sub font-body text-sm mb-8">
        一時的な不具合の可能性があります。お手数ですが、もう一度お試しください。
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-block px-6 py-3 rounded-full bg-accent text-white font-display font-bold text-sm hover:brightness-110 transition"
        >
          もう一度試す
        </button>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-full border border-line text-ink font-display font-bold text-sm hover:border-accent/50 transition"
        >
          トップに戻る
        </Link>
      </div>
    </main>
  );
}
