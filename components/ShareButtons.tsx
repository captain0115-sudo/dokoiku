/**
 * X(旧Twitter)への軽量なシェアボタン。
 * JS不要のintentリンクのみで完結させ、外部SDK読み込みは行わない
 * (ページ表示速度・確実性への影響を避けるため)。
 */
export default function ShareButtons({
  url,
  text,
}: {
  url: string;
  text: string;
}) {
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(url)}`;

  return (
    <a
      href={shareUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="pill-button pill-button-inactive text-xs inline-flex items-center gap-1.5"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.9 2H22l-7.6 8.7L23.3 22h-6.9l-5.4-6.9L4.8 22H1.7l8.1-9.3L1 2h7l4.9 6.3L18.9 2Zm-1.2 18h1.9L7.4 3.9H5.4L17.7 20Z" />
      </svg>
      Xでシェア
    </a>
  );
}
