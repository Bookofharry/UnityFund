import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { paymentsApi } from '../api/payments';
import { formatKobo } from '../lib/format';
import { BrandedLoader } from '../components/BrandedLoader';

const POLL_INTERVAL = 2000;
const TIMEOUT_MS = 90_000;
const TERMINAL = new Set(['successful', 'failed']);

export function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('paymentId') ?? '';
  const orgId = searchParams.get('orgId') ?? '';
  const { loading: authLoading } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  const { data: payment, isError, isLoading } = useQuery({
    queryKey: ['payment-callback', paymentId],
    queryFn: () => paymentsApi.get(orgId, paymentId),
    enabled: !!paymentId && !!orgId && !authLoading,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (timedOut || (status && TERMINAL.has(status))) return false;
      return POLL_INTERVAL;
    },
    retry: 1,
  });

  const status = payment?.status;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-md text-center">
        <p className="mb-1 text-lg font-bold text-indigo-700">UnityFund</p>

        {/* Loading auth */}
        {authLoading && <Spinner label="Loading..." />}

        {/* Missing params */}
        {!authLoading && (!paymentId || !orgId) && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Invalid Link</h2>
            <p className="mt-2 text-sm text-gray-500">This payment callback link is missing required parameters.</p>
            <Link to="/contributions" className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:underline">
              Back to Contributions
            </Link>
          </>
        )}

        {/* Error fetching payment */}
        {!authLoading && !!paymentId && !!orgId && isError && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <svg className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Unable to verify</h2>
            <p className="mt-2 text-sm text-gray-500">
              We couldn't check your payment status. Your payment may still have gone through — check your contributions shortly.
            </p>
            <Link to="/contributions" className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:underline">
              View Contributions
            </Link>
          </>
        )}

        {/* Polling — waiting for result */}
        {!authLoading && !isError && (isLoading || (status && !TERMINAL.has(status) && !timedOut)) && (
          <Spinner label="Verifying your payment..." sublabel="This should only take a moment." />
        )}

        {/* Timed out but not terminal */}
        {!authLoading && !isError && timedOut && status && !TERMINAL.has(status) && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <svg className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Payment processing</h2>
            <p className="mt-2 text-sm text-gray-500">
              Your payment is being confirmed. It may take a few minutes to reflect in your contributions.
            </p>
            <Link to="/contributions" className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:underline">
              View Contributions
            </Link>
          </>
        )}

        {/* Success */}
        {status === 'successful' && payment && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Payment Successful</h2>
            <p className="mt-2 text-3xl font-bold text-green-600">{formatKobo(payment.amount)}</p>
            <p className="mt-1 text-sm text-gray-500">Your contribution has been recorded.</p>
            <Link
              to="/contributions"
              className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              View Contributions
            </Link>
          </>
        )}

        {/* Failed */}
        {status === 'failed' && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Payment Failed</h2>
            <p className="mt-2 text-sm text-gray-500">
              Your payment could not be completed. Please try again from your contributions page.
            </p>
            <Link
              to="/contributions"
              className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Try Again
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function Spinner({ label, sublabel }: { label: string; sublabel?: string }) {
  return (
    <>
      <div className="mx-auto mb-4 flex justify-center">
        <BrandedLoader size="lg" />
      </div>
      <p className="font-medium text-gray-700">{label}</p>
      {sublabel && <p className="mt-1 text-sm text-gray-400">{sublabel}</p>}
    </>
  );
}
