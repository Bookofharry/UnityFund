import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2 } from 'lucide-react';
import { authApi } from '../api/auth';
import { AuthLayout, authInputClass, authLabelClass, authButtonClass } from '../components/auth/AuthLayout';

const schema = z.object({ email: z.string().email('Invalid email') });
type Fields = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Fields>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Fields) => {
    await authApi.requestReset(data.email);
    setSent(true);
  };

  return (
    <AuthLayout title="Reset your password" subtitle="We'll email you a link to get back into your account.">
      {sent ? (
        <div className="text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
          </div>
          <p className="mt-4 text-sm text-navy-800">If that email exists, a reset link has been sent.</p>
          <Link to="/login" className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className={authLabelClass}>Email</label>
            <input id="email" {...register('email')} type="email" placeholder="you@organization.com" className={authInputClass} />
            {errors.email && <p className="mt-1 text-xs text-red-600" role="alert">{errors.email.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className={authButtonClass}>
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </button>
          <Link to="/login" className="block text-center text-sm text-gray-500 hover:text-navy-800 hover:underline">
            Back to sign in
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}
