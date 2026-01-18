import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authApi, getErrorMessage } from '../services/api';
import { useAuth } from '../context/useAuth';

// Zod schema pre validáciu
const loginSchema = z.object({
  email: z.string().refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
    message: 'Zadajte platný email.',
  }),
  password: z.string().refine((val) => val.length >= 8, {
    message: 'Heslo musí mať aspoň 8 znakov.',
  }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError('');

    try {
      const response = await authApi.login(data);
      const { token, user } = response.data;
      login(user, token);
      navigate('/');
    } catch (err) {
      setApiError(getErrorMessage(err));
    }
  };

  return (
    <div className="w-full min-h-screen flex bg-gray-50">
      {/* LEFT COLUMN - FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full flex flex-col justify-center gap-5">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-base">{'</>'}</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">BitEvents</span>
          </div>

          {/* Title & Subtitle */}
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Vitajte späť</h1>
            <p className="text-sm text-gray-600">
              Ešte nemáte účet?{' '}
              <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                Zaregistrujte sa zadarmo
              </a>
            </p>
          </div>

          {/* API Error Alert */}
          {apiError && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Emailová adresa
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="jan@example.com"
                  autoComplete="username"
                  {...register('email')}
                  style={{ paddingLeft: '27px' }}
                  className={` w-full pl-11 pr-4 py-4 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Heslo
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                  style={{ paddingLeft: '27px' }}
                  className={`w-full pl-11 pr-12 py-4 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Skryť heslo' : 'Zobraziť heslo'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="remember-me" className="text-sm text-gray-700 cursor-pointer gap-2">
                  Zapämätať si ma
                </label>
              </div>
              <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                Zabudli ste heslo?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600! hover:bg-indigo-700! text-white! font-bold py-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Prihlasujem...</span>
                </>
              ) : (
                <span>Prihlásiť sa</span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN - EMPTY GRADIENT */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-800 to-gray-900"></div>
    </div>
  );
};
