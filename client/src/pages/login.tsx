import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { ApiError } from '../api/client';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, authNotice, clearNotice } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotMsg, setForgotMsg] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    clearNotice();

    try {
      await login({ email: email.trim(), password });
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.code) {
          case 'INVALID_CREDENTIALS':
            setErrorMessage('Invalid email or password. Please check your credentials.');
            break;
          case 'COMPANY_SUSPENDED':
            setErrorMessage('This company account has been suspended. Please contact support.');
            break;
          case 'NETWORK_ERROR':
            setErrorMessage('Unable to reach the backend server at http://localhost:5000. Please ensure it is running.');
            break;
          default:
            setErrorMessage(err.message || 'An error occurred while signing in.');
        }
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 font-sans antialiased">
      <div className="w-full max-w-md space-y-6">
        {/* Branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-sm shadow-blue-600/30 mb-3">
            <ShieldCheck size={26} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            LedgerGuard
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Multi-Tenant Zero-Knowledge Billing Engine
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-7 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to access your multi-tenant billing dashboard
            </p>
          </div>

          {authNotice && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <span>{authNotice}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {forgotMsg && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
              Demo Mode: Password reset link simulation triggered.
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4 text-xs">
            {/* Email Field */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@companya.test"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-xs"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-700 font-semibold">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotMsg(true)}
                  className="text-[11px] text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-xs"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer mt-2 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>

          {/* Create Account Link */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-400">
          © 2026 LedgerGuard Inc. Multi-Tenant Zero-Knowledge Billing Engine.
        </p>
      </div>
    </div>
  );
}
