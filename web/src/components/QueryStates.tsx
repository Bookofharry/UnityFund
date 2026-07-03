import { BrandedLoaderBlock } from './BrandedLoader';

// Tiny reusable components for the three data-fetching states every page needs.

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return <BrandedLoaderBlock message={message} size="sm" />;
}

export function ErrorState({ message }: { message?: string }) {
  return (
    <div className="mt-12 rounded-xl border border-red-100 bg-red-50 p-6 text-center">
      <p className="font-medium text-red-700">Failed to load data</p>
      <p className="mt-1 text-sm text-red-500">
        {message ?? 'An error occurred. Please refresh the page or try again.'}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 rounded-lg border border-red-200 px-4 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
      >
        Retry
      </button>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <p className="mt-12 text-center text-sm text-gray-400">{message}</p>
  );
}
