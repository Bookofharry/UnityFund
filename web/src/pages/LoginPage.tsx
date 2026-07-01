import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { AuthLayout, authInputClass, authLabelClass, authButtonClass } from '../components/auth/AuthLayout';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

type Fields = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Fields>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Fields) => {
    setServerError('');
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Login failed';
      setServerError(msg);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to manage your organization's funds.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{serverError}</div>
        )}

        <div>
          <label htmlFor="email" className={authLabelClass}>Email</label>
          <input
            id="email"
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder="you@organization.com"
            className={authInputClass}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600" role="alert">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className={authLabelClass}>Password</label>
          <input
            id="password"
            {...register('password')}
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            className={authInputClass}
          />
          {errors.password && <p className="mt-1 text-xs text-red-600" role="alert">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between">
          <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={isSubmitting} className={authButtonClass}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="text-center text-sm text-gray-500">
          No account?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline">Register</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
