type Props = {
  onSelect: () => void;
};

export function ChangePasswordMenuItem({ onSelect }: Props) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-900 focus:outline-none focus-visible:bg-violet-50 focus-visible:text-violet-900"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-violet-100 group-hover:text-violet-700">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          />
        </svg>
      </span>
      Change password
    </button>
  );
}
