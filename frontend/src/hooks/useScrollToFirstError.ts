import type { RefObject } from 'react';

type UseScrollToFirstErrorOptions = {
  selector?: string;
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
};

const DEFAULT_SELECTOR = '[aria-invalid="true"], [role="alert"]';

/**
 * Reusable form helper: scroll/focus the first invalid element after validation renders.
 */
export function useScrollToFirstError(
  formRef: RefObject<HTMLElement>,
  options: UseScrollToFirstErrorOptions = {}
) {
  const selector = options.selector ?? DEFAULT_SELECTOR;
  const behavior = options.behavior ?? 'smooth';
  const block = options.block ?? 'center';

  const scrollToFirstError = () => {
    // Wait for React to paint validation state before querying DOM.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const root = formRef.current;
        if (!root) return;

        const firstInvalid = root.querySelector<HTMLElement>(selector);
        if (!firstInvalid) return;

        firstInvalid.scrollIntoView({ behavior, block });

        if (typeof firstInvalid.focus === 'function') {
          firstInvalid.focus({ preventScroll: true });
        }
      });
    });
  };

  return { scrollToFirstError };
}
