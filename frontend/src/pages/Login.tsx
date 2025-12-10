import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../context/useAuth';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const validateForm = () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setApiError('Zadajte platný email.');
      return false;
    }
    if (password.length < 8) {
      setApiError('Heslo musí mať aspoň 8 znakov.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await authApi.login({ email, password });
      const { token, user } = response.data;
      login(user, token);
      navigate('/');
    } catch (err) {
      const error = err as { response?: { data?: { message: string } } };
      setApiError(error.response?.data?.message || 'Prihlásenie zlyhalo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600 opacity-5 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="backdrop-blur-xl bg-white/10 border border-blue-400/20 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                ▶ BitEvents
              </div>
            </div>
            <p className="text-blue-100 text-lg font-light">Tvoj komunitný IT event plán</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400/50 text-red-100 rounded-xl text-sm font-medium backdrop-blur-sm">
              ✕ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-blue-100 text-sm font-semibold mb-2">
                E-mailová adresa
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tvoj@example.com"
                className="w-full px-4 py-3 bg-blue-950/40 border border-blue-400/30 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition backdrop-blur-sm"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-blue-100 text-sm font-semibold mb-2">
                Heslo
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tvoje heslo"
                  className="w-full px-4 py-3 bg-blue-950/40 border border-blue-400/30 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition backdrop-blur-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300/70 hover:text-blue-200 transition"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-3 rounded-xl font-semibold transition disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-base shadow-lg hover:shadow-blue-500/50 disabled:shadow-none"
            >
              {loading ? '⏳ Prihlasuje sa...' : '✓ Prihlásiť sa'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-blue-400/20"></div>
            <span className="px-3 text-blue-300/70 text-sm">alebo</span>
            <div className="flex-1 border-t border-blue-400/20"></div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-blue-200/70 mb-3">Nemáš ešte účet?</p>
            <a
              href="/register"
              className="inline-block w-full bg-blue-400/20 hover:bg-blue-400/30 text-blue-100 border border-blue-400/30 py-3 rounded-xl font-semibold transition text-center backdrop-blur-sm"
            >
              Vytvoriť nový účet
            </a>
          </div>

          {/* Footer */}
          <p className="text-xs text-blue-300/50 text-center mt-6">
            Pokračovaním súhlasíš s našimi podmienkami a ochranou údajov
          </p>
        </div>
      </div>
    </div>
  );
};
