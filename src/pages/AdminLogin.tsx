import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { RiseShineLogo } from '../components/common/RiseShineLogo';
import { useAuth } from '../hooks/useAuth';

export const AdminLogin: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const sessionExpired = queryParams.get('session_expired');
  const redirectUrl = queryParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('admin@risenshine.com');
  const [password, setPassword] = useState('RiseAdmin@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both administrator email and password.');
      return;
    }

    try {
      setLoading(true);
      await login({
        email: email.trim(),
        password,
        remember_me: rememberMe,
      });
      navigate(redirectUrl, { replace: true });
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setErrorMessage(detail);
      } else {
        setErrorMessage('Invalid administrative credentials or session locked.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-brand-charcoal flex flex-col justify-between font-sans">
      {/* Top Brand Bar */}
      <div className="p-6 sm:px-12 flex items-center justify-between border-b border-brand-border">
        <RiseShineLogo size="md" />
        <Link
          to="/"
          className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1"
        >
          <span>← Back to Newspaper</span>
        </Link>
      </div>

      {/* Login Card Centerpiece */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white border border-brand-border rounded-2xl p-8 sm:p-10 shadow-editorial">
          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue border border-blue-100 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="font-headline text-2xl sm:text-3xl font-black text-brand-charcoal">
              Staff Publishing Portal
            </h2>
            <p className="text-xs text-brand-muted">
              Secure authentication for authorized newspaper editorial administrators.
            </p>
          </div>

          {/* Session Expired Alert */}
          {sessionExpired && (
            <div className="mb-6 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Your session token has expired. Please sign in again.</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal">
                Editorial Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-muted absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@risenshine.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-brand-border rounded-lg outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 bg-white"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal">
                  Account Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 text-sm border border-brand-border rounded-lg outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-gray-400 hover:text-brand-charcoal absolute right-3 top-2.5"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember session checkbox */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue w-4 h-4"
                />
                <span className="text-brand-charcoal font-medium">Keep session active (7 days)</span>
              </label>

              <span className="text-brand-muted text-[11px]">
                Argon2 Encrypted
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-lg bg-brand-blue text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-800 transition-colors shadow-subtle flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Sign In to Publishing Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-8 pt-6 border-t border-brand-border text-center text-[11px] text-brand-muted space-y-1">
            <p>Authorized access only. Public registration is permanently disabled.</p>
            <p className="text-[10px] text-gray-400">Default: admin@risenshine.com / RiseAdmin@2026!</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center text-xs text-brand-muted border-t border-brand-border">
        Rise ’n’ Shine – The AI Newspaper Editorial System • All activity is logged and audited.
      </div>
    </div>
  );
};
