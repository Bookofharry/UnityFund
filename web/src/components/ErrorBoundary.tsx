import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // Replace with a real logger (Sentry, etc.) before going to production
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center">
          <div className="rounded-xl border border-red-100 bg-white p-8 shadow-sm">
            <p className="text-lg font-semibold text-gray-800">Something went wrong</p>
            <p className="mt-2 text-sm text-gray-500">
              {this.state.error.message ?? 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
