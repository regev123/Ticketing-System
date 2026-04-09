/**
 * Shared Tailwind classes for form controls (DRY, one place to tweak design).
 */

export const FORM_INPUT =
  'w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/25';

export const FORM_INPUT_SM =
  'w-full rounded-lg border border-slate-200/90 bg-white px-2.5 py-2 text-sm text-slate-900 shadow-sm transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20';

/** Native `<select>` — matches small inputs (admin section currency, etc.). */
export const FORM_SELECT_SM = `${FORM_INPUT_SM} cursor-pointer`;
