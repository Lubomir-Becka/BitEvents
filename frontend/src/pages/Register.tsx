import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { authApi, getErrorMessage } from '../services/api';
import { useAuth } from '../context/useAuth';

// Zod schema pre validáciu registrácie
const registerSchema = z
  .object({
    fullName: z.string().refine((val) => val.length >= 2, {
      message: 'Meno musí mať aspoň 2 znaky.',
    }),
    email: z.string().refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Zadajte platný email.',
    }),
    password: z.string().refine((val) => val.length >= 8, {
      message: 'Heslo musí mať aspoň 8 znakov.',
    }),
    confirmPassword: z.string(),
    isOrganizer: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Heslá sa nezhodujú.',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      isOrganizer: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setApiError('');

    try {
      const response = await authApi.register({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        isOrganizer: data.isOrganizer,
      });
      const { token, user } = response.data;
      // Some backends ignore the flag; enforce it locally so the UI matches the choice.
      const userWithRole = { ...user, isOrganizer: !!data.isOrganizer };
      login(userWithRole, token);
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
            <span className="text-2xl font-bold text-gray-900">BltEvents</span>
          </div>

          {/* Title & Subtitle */}
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Vytvor si účet</h1>
            <p className="text-sm text-gray-600">
              Už máš účet?{' '}
              <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                Prihlásiť sa
              </a>
            </p>
          </div>

          {/* API Error Alert */}
          {apiError && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Full Name Field */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Celé meno
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Ján Novák"
                  autoComplete="name"
                  {...register('fullName')}
                  style={{ paddingLeft: '27px' }}
                  className={`w-full pl-11 pr-4 py-4 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 ${
                    errors.fullName ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="mt-2 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

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
                  className={`w-full pl-11 pr-4 py-4 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 ${
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
                  autoComplete="new-password"
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

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Potvrdiť heslo
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  style={{ paddingLeft: '27px' }}
                  className={`w-full pl-11 pr-12 py-4 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showConfirmPassword ? 'Skryť heslo' : 'Zobraziť heslo'}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Organizer Checkbox */}
            <label style={{ paddingLeft: '4px' }} htmlFor="isOrganizer" className="flex items-center p-3 border rounded-md bg-indigo-50 border-indigo-100 cursor-pointer hover:bg-indigo-100 transition-colors gap-2">
              <input
                id="isOrganizer"
                type="checkbox"
                {...register('isOrganizer')}
                className="h-4 w-4 mt-0.5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <div className="ml-3">
                <span className="block text-sm font-medium text-gray-900">
                  Som organizátor IT eventov
                </span>
                <span className="block text-xs text-gray-500 mt-1">
                  Budú ti spr9nástroje na spravovanie tvojich akcií
                </span>
              </div>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600! hover:bg-indigo-700! text-white! font-bold py-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Registrujem...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Vytvoriť účet</span>
                </>
              )}
            </button>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center">
              Pokračovaním súhlasíš s našimi{' '}
              <a href="/terms" className="text-indigo-600 hover:underline">
                podmienkami
              </a>
              {' '}a{' '}
              <a href="/privacy" className="text-indigo-600 hover:underline">
                ochranou údajov
              </a>
            </p>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN - EMPTY GRADIENT */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-gray-800 to-gray-900"></div>
    </div>
  );
};
