type Props = {
  onSelect: () => void;
};

export function OrdersMenuItem({ onSelect }: Props) {
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
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9h6m-6 4h6m2-8h.01"
          />
        </svg>
      </span>
      My orders
    </button>
  );
}
