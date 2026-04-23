import { Button } from './Button';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorMessage({ message, onRetry, onDismiss }: ErrorMessageProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
      <div className="flex items-start justify-between gap-3">
        <p>{message}</p>
        {onDismiss ? (
          <button
            type="button"
            aria-label="Dismiss error"
            onClick={onDismiss}
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-red-700 transition hover:bg-red-100"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : null}
      </div>
      {onRetry && (
        <Button
          type="button"
          variant="ghost"
          onClick={onRetry}
          className="mt-2 px-0 text-sm font-medium text-red-800 underline hover:bg-red-100 focus:ring-red-400"
        >
          Try again
        </Button>
      )}
    </div>
  );
}
