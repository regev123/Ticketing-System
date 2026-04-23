const GLOBAL_SUCCESS_EVENT = 'ticketing:global-success';

type GlobalSuccessDetail = {
  message: string;
};

export function emitGlobalSuccess(message: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<GlobalSuccessDetail>(GLOBAL_SUCCESS_EVENT, {
      detail: { message },
    })
  );
}

export function subscribeGlobalSuccess(listener: (message: string) => void): () => void {
  if (typeof window === 'undefined') return () => undefined;

  const handler = (event: Event) => {
    const custom = event as CustomEvent<GlobalSuccessDetail>;
    const message = custom.detail?.message;
    if (message) listener(message);
  };

  window.addEventListener(GLOBAL_SUCCESS_EVENT, handler as EventListener);
  return () => window.removeEventListener(GLOBAL_SUCCESS_EVENT, handler as EventListener);
}
