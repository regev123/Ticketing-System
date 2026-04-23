import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FORM_SELECT_SM } from '../formStyles';

type FormSelectOption = {
  value: string;
  label: string;
  triggerLabel?: string;
};

type Props = {
  id: string;
  value: string;
  options: FormSelectOption[];
  onChange: (value: string) => void;
  ariaLabelledBy?: string;
  disabled?: boolean;
  /** Merged onto the trigger button (e.g. fixed height to align with another control). */
  className?: string;
};

const LIST_Z = 200;

/**
 * Shared custom select with portal listbox.
 * Keeps select UI consistent across admin forms.
 */
export function FormSelect({ id, value, options, onChange, ariaLabelledBy, disabled, className }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const [listPos, setListPos] = useState<{ top: number; left: number; minWidth: number } | null>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const updateListPosition = useCallback(() => {
    const el = buttonRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setListPos({
      top: r.bottom + 4,
      left: r.left,
      minWidth: r.width,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setListPos(null);
      return;
    }
    updateListPosition();
    const onScrollOrResize = () => updateListPosition();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open, updateListPosition]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (listRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !listRef.current || !listPos) return;
    const list = listRef.current;
    const r = list.getBoundingClientRect();
    const pad = 8;
    if (r.right > window.innerWidth - pad) {
      const newLeft = Math.max(pad, window.innerWidth - r.width - pad);
      if (Math.abs(newLeft - listPos.left) > 0.5) {
        setListPos((p) => (p ? { ...p, left: newLeft } : null));
      }
    }
  }, [open, listPos, options]);

  const listContent =
    open && listPos ? (
      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-labelledby={ariaLabelledBy}
        style={{
          position: 'fixed',
          top: listPos.top,
          left: listPos.left,
          minWidth: listPos.minWidth,
          width: 'max-content',
          maxWidth: 'min(calc(100vw - 1rem), 42rem)',
          zIndex: LIST_Z,
          boxSizing: 'border-box',
        }}
        className="max-h-[min(18rem,70vh)] overflow-y-auto overflow-x-auto rounded-2xl border border-violet-100/90 bg-white/95 p-1.5 shadow-[0_12px_48px_-8px_rgba(91,33,182,0.18),0_4px_16px_-4px_rgba(15,23,42,0.1)] ring-1 ring-violet-200/40 backdrop-blur-md [scrollbar-width:thin] [scrollbar-color:rgb(196_181_253)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-violet-200/90"
      >
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <li key={opt.value} role="presentation" className="whitespace-nowrap">
              <button
                type="button"
                role="option"
                aria-selected={selected}
                className={`flex w-full items-center whitespace-nowrap rounded-xl border-l-[3px] py-2.5 pl-3 pr-3 text-left text-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 focus-visible:ring-offset-1 ${
                  selected
                    ? 'border-violet-600 bg-gradient-to-r from-violet-600/[0.11] via-fuchsia-500/[0.08] to-transparent font-semibold text-violet-950 shadow-sm ring-1 ring-inset ring-violet-200/50'
                    : 'border-transparent text-slate-700 hover:border-violet-200/80 hover:bg-violet-50/95 hover:text-violet-900 active:bg-violet-100/60'
                }`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            </li>
          );
        })}
      </ul>
    ) : null;

  return (
    <div ref={rootRef} className="relative w-full min-w-0">
      <button
        ref={buttonRef}
        type="button"
        id={id}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        disabled={disabled}
        className={`${FORM_SELECT_SM} flex w-full items-center justify-between gap-2 text-left font-medium transition-shadow duration-200 ${
          open ? 'border-violet-300/80 shadow-md shadow-violet-500/10 ring-2 ring-violet-500/20' : ''
        } ${className ?? ''}`}
        onClick={() => {
          if (disabled) return;
          setOpen((o) => !o);
        }}
      >
        <span className="truncate">{selectedOption?.triggerLabel ?? selectedOption?.label ?? value}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-violet-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {typeof document !== 'undefined' && listContent ? createPortal(listContent, document.body) : null}
    </div>
  );
}
