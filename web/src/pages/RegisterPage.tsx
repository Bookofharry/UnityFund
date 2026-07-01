import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const schema = z.object({
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type Fields = z.infer<typeof schema>;

export function RegisterPage() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Fields>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Fields) => {
    setServerError('');
    try {
      const { user, accessToken } = await authApi.register(data);
      setSession(user, accessToken);
      navigate('/onboarding');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Registration failed';
      setServerError(msg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <circle cx="10" cy="14" r="8" fill="#4f46e5" />
              <circle cx="18" cy="14" r="8" fill="#1a2b6e" />
              <circle cx="14" cy="14" r="5" fill="#818cf8" />
            </svg>
            <span className="text-2xl font-bold text-navy-800">UnityFund</span>
          </Link>
          <p className="mt-3 text-sm text-gray-500">Create your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl bg-white p-8 shadow">
          {serverError && (
            <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First name</label>
              <input id="firstName" {...register('firstName')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              {errors.firstName && <p className="mt-1 text-xs text-red-600" role="alert">{errors.firstName.message}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last name</label>
              <input id="lastName" {...register('lastName')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              {errors.lastName && <p className="mt-1 text-xs text-red-600" role="alert">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input id="email" {...register('email')} type="email" autoComplete="email"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            {errors.email && <p className="mt-1 text-xs text-red-600" role="alert">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input id="password" {...register('password')} type="password" autoComplete="new-password"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            {errors.password && <p className="mt-1 text-xs text-red-600" role="alert">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
