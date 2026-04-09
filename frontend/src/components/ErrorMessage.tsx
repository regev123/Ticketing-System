import { Button } from './Button';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
      <p>{message}</p>
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
