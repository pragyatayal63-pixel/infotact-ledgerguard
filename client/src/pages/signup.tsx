import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { ApiError } from '../api/client';

const TENANT_REGEX = /^[a-z0-9_-]{2,30}$/;

export default function Signup() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [tenantManuallyEdited, setTenantManuallyEdited] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generate suggested tenantId slug from company name
  const handleCompanyChange = (value: string) => {
    setCompanyName(value);
    if (!tenantManuallyEdited) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 30);
      setTenantId(slug);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    const cleanTenant = tenantId.trim().toLowerCase();
    if (!TENANT_REGEX.test(cleanTenant)) {
      setErrorMessage('Tenant ID must be 2 to 30 characters containing only lowercase letters, numbers, hyphens, or underscores.');
      return;
    }

    try {
      await register({
        companyName: companyName.trim(),
        tenantId: cleanTenant,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.code) {
          case 'EMAIL_EXISTS':
            setErrorMessage('An account with this email address already exists.');
            break;
          case 'TENANT_EXISTS':
            setErrorMessage('This tenant ID is already registered. Please choose a different identifier.');
            break;
          case 'WEAK_PASSWORD':
            setErrorMessage('Password must be at least 8 characters long.');
            break;
          case 'INVALID_EMAIL':
            setErrorMessage('Please provide a valid work email address.');
            break;
          case 'INVALID_TENANT_ID':
            setErrorMessage('Tenant ID must be 2-30 characters (lowercase letters, numbers, hyphens, underscores).');
            break;
          case 'NETWORK_ERROR':
            setErrorMessage('Unable to reach backend server at http://localhost:5000.');
            break;
          default:
            setErrorMessage(err.message || 'Failed to create account.');
        }
      } else {
        setErrorMessage('An unexpected error occurred during registration.');
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

        {/* Create Account Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-7 sm:p-8 space-y-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Create an Account</h2>
            <p className="text-xs text-slate-500 mt-1">
              Start monitoring multi-tenant infrastructure and billing events
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleCreateAccount} className="space-y-3.5 text-xs">
            {/* Full Name */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-xs"
                required
                disabled={isLoading}
              />
            </div>

            {/* Work Email */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@company.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-xs"
                required
                disabled={isLoading}
              />
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => handleCompanyChange(e.target.value)}
                placeholder="Acme Corp"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-xs"
                required
                disabled={isLoading}
              />
            </div>

            {/* Tenant ID Slug */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-semibold">
                  Tenant Identifier (Slug)
                </label>
                <span className="text-[10px] text-slate-400 font-normal">
                  2-30 lowercase chars, digits, - or _
                </span>
              </div>
              <input
                type="text"
                value={tenantId}
                onChange={(e) => {
                  setTenantId(e.target.value.toLowerCase());
                  setTenantManuallyEdited(true);
                }}
                placeholder="acme-corp"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-xs font-mono"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Password (min. 8 characters)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-xs"
                required
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer mt-3 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Sign In
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
