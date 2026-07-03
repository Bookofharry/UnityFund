import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LockKeyhole } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

type Fields = z.infer<typeof schema>;

const inputClass =
  'mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white shadow-sm transition-colors placeholder:text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400';
const labelClass = 'block text-sm font-medium text-slate-300';

export function AdminLoginPage() {
  const { login, clearSession } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Fields>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Fields) => {
    setServerError('');
    try {
      const u = await login(data.email, data.password);
      const memberships = u.orgMemberships ?? u.memberships ?? [];
      const isPlatformAdmin = memberships.some((m) => m.role === 'platform_admin');
      if (!isPlatformAdmin) {
        clearSession();
        setServerError('This account does not have platform admin access.');
        return;
      }
      navigate('/admin');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Login failed';
      setServerError(msg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10">
            <LockKeyhole className="h-5 w-5 text-amber-400" aria-hidden="true" />
          </div>
          <p className="mt-4 text-lg font-bold text-white">
            UnityFund <span className="text-amber-400">Admin</span>
          </p>
          <p className="mt-1 text-sm text-slate-400">Platform administration sign-in</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-2xl border border-slate-700 bg-slate-800/60 p-8"
        >
          {serverError && (
            <div className="rounded-lg bg-red-500/10 px-3 py-2.5 text-sm text-red-400" role="alert">
              {serverError}
            </div>
          )}

          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input
              id="email"
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder="you@unityfund.dev"
              className={inputClass}
            />
            {errors.email && <p className="mt-1 text-xs text-red-400" role="alert">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className={labelClass}>Password</label>
            <input
              id="password"
              {...register('password')}
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              className={inputClass}
            />
            {errors.password && <p className="mt-1 text-xs text-red-400" role="alert">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-all duration-200 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Not a platform admin? Use the regular sign-in at /login.
        </p>
      </div>
    </div>
  );
}
