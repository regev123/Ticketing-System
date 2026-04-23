const GLOBAL_ERROR_EVENT = 'ticketing:global-error';

type GlobalErrorDetail = {
  message: string;
};

export function emitGlobalError(message: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<GlobalErrorDetail>(GLOBAL_ERROR_EVENT, {
      detail: { message },
    })
  );
}

export function subscribeGlobalError(listener: (message: string) => void): () => void {
  if (typeof window === 'undefined') return () => undefined;

  const handler = (event: Event) => {
    const custom = event as CustomEvent<GlobalErrorDetail>;
    const message = custom.detail?.message;
    if (message) listener(message);
  };

  window.addEventListener(GLOBAL_ERROR_EVENT, handler as EventListener);
  return () => window.removeEventListener(GLOBAL_ERROR_EVENT, handler as EventListener);
}
