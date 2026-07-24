"use client";

type Props = {
  onHome: () => void;
  showHome: boolean;
};

export default function AppHeader({ onHome, showHome }: Props) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-rose-200/70 bg-sand-50/90 px-4 py-2.5 backdrop-blur-sm">
      <button
        type="button"
        onClick={onHome}
        className="flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-medium text-rose-600 transition hover:bg-rose-100/70 disabled:cursor-default disabled:text-ink-soft disabled:hover:bg-transparent"
        disabled={!showHome}
        aria-label="홈으로"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9" />
        </svg>
        홈
      </button>
      <span className="text-xs tracking-widest text-ink-soft">자리이타 수비학 타로</span>
    </header>
  );
}
