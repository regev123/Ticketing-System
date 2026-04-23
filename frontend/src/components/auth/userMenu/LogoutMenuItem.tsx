type Props = {
  onSelect: () => void;
};

export function LogoutMenuItem({ onSelect }: Props) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:bg-red-50 focus-visible:text-red-800"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-red-100 group-hover:text-red-600">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </span>
      Sign out
    </button>
  );
}
