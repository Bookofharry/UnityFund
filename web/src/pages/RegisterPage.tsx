import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { AuthLayout, authInputClass, authLabelClass, authButtonClass } from '../components/auth/AuthLayout';

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
      const { user, accessToken, refreshToken } = await authApi.register(data);
      setSession(user, accessToken, refreshToken);
      navigate('/onboarding');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Registration failed';
      setServerError(msg);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Set up your organization's financial operating system.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{serverError}</div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className={authLabelClass}>First name</label>
            <input id="firstName" {...register('firstName')} placeholder="Adaeze" className={authInputClass} />
            {errors.firstName && <p className="mt-1 text-xs text-red-600" role="alert">{errors.firstName.message}</p>}
          </div>
          <div>
            <label htmlFor="lastName" className={authLabelClass}>Last name</label>
            <input id="lastName" {...register('lastName')} placeholder="Okafor" className={authInputClass} />
            {errors.lastName && <p className="mt-1 text-xs text-red-600" role="alert">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="email" className={authLabelClass}>Email</label>
          <input id="email" {...register('email')} type="email" autoComplete="email" placeholder="you@organization.com" className={authInputClass} />
          {errors.email && <p className="mt-1 text-xs text-red-600" role="alert">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className={authLabelClass}>Password</label>
          <input id="password" {...register('password')} type="password" autoComplete="new-password" placeholder="At least 8 characters" className={authInputClass} />
          {errors.password && <p className="mt-1 text-xs text-red-600" role="alert">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className={authButtonClass}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
