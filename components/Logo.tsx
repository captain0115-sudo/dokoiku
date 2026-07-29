export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M13 2C8.58 2 5 5.58 5 10c0 6 8 14 8 14s8-8 8-14c0-4.42-3.58-8-8-8z"
          fill="none"
          stroke="#24417A"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="13" cy="10" r="3" fill="#0E7C66" />
      </svg>
      <span className="font-display font-black text-2xl text-ink tracking-tight">
        どこいく
      </span>
    </div>
  );
}
