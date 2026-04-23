import { FORM_INPUT } from './formStyles';

type Props = {
  urlInputValue: string;
  previewSrc: string | null;
  busy: boolean;
  error: string | null;
  /** Client-side validation (e.g. URL format / length). Shown below the URL field. */
  validationError?: string | null;
  onUrlChange: (value: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  onPreviewError: () => void;
};

export function ImageInputField({
  urlInputValue,
  previewSrc,
  busy,
  error,
  validationError,
  onUrlChange,
  onFileChange,
  onRemove,
  onPreviewError,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>Image URL</span>
            <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-slate-600 ring-1 ring-slate-200/80">
              Optional
            </span>
          </div>
          <input
            type="url"
            value={urlInputValue}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://..."
            aria-invalid={validationError ? true : undefined}
            className={`${FORM_INPUT} text-sm ${
              validationError ? 'border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-500/20' : ''
            }`}
          />
          {validationError ? (
            <p className="text-sm font-medium text-red-600" role="alert">
              {validationError}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50/50">
              <input type="file" accept="image/*" className="sr-only" onChange={onFileChange} disabled={busy} />
              <svg className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {busy ? 'Processing...' : 'Upload image'}
            </label>
            {previewSrc ? (
              <button
                type="button"
                className="text-sm font-medium text-slate-500 underline decoration-slate-300 underline-offset-2 transition hover:text-violet-600"
                onClick={onRemove}
              >
                Remove
              </button>
            ) : null}
          </div>
        </div>
        {previewSrc ? (
          <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl border border-slate-200/90 bg-slate-100 shadow-inner sm:h-28 sm:w-44">
            <img
              src={previewSrc}
              alt=""
              className="h-full w-full object-cover"
              onError={onPreviewError}
            />
            <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-black/5" />
          </div>
        ) : (
          <div className="flex h-32 w-full shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 text-center sm:h-28 sm:w-44">
            <p className="px-3 text-xs text-slate-400">Preview</p>
          </div>
        )}
      </div>
      {error ? (
        <p className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
          <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  );
}
