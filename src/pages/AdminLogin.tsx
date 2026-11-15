import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, Activity } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { RiseShineLogo } from '../components/common/RiseShineLogo';
import { apiClient } from '../services/api';

interface ApiHealthState {
  status?: string;
  api_status?: string;
  database_connected?: boolean;
  database_type?: string;
  admin_accounts_ready?: number;
  error?: string;
}

export const AdminLogin: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectUrl = (location.state as any)?.from?.pathname || '/admin';
  const sessionExpired = (location.state as any)?.sessionExpired;

  const [email, setEmail] = useState('agentopslabs@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Backend & Database Diagnostics State
  const [apiHealth, setApiHealth] = useState<ApiHealthState | null>(null);

  useEffect(() => {
    let isCurrent = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    apiClient
      .get<ApiHealthState>('/health', { signal: controller.signal })
      .then((res) => {
        if (!isCurrent) return;
        setApiHealth(res.data);
      })
      .catch((err) => {
        if (!isCurrent) return;
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
          setApiHealth({ error: 'Health check timed out (8s)' });
        } else {
          const status = err.response?.status;
          setApiHealth({
            error: status ? `HTTP ${status}` : (err.message || 'Cannot reach API backend')
          });
        }
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      isCurrent = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);

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
      console.error('Login error detail:', err);
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      
      if (typeof detail === 'string') {
        setErrorMessage(detail);
      } else if (Array.isArray(detail)) {
        setErrorMessage(detail.map((d: any) => d.msg || JSON.stringify(d)).join(', '));
      } else if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else if (status === 401) {
        setErrorMessage('Authentication Failed (401): Invalid administrator email or password.');
      } else if (status === 404) {
        setErrorMessage('Endpoint Not Found (404): The API route /api/auth/login was not reachable on this domain.');
      } else if (status === 500) {
        setErrorMessage('Server Error (500): Database connection error on Vercel backend.');
      } else if (err.message && !status) {
        setErrorMessage(`Network Error: ${err.message}. Failed to reach the API backend.`);
      } else {
        setErrorMessage(`Authentication Error (HTTP ${status || 'Unknown'}): ${err.message || 'Please check credentials and backend status.'}`);
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
          <div className="text-center space-y-2 mb-6">
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

          {/* Live Backend & Database Connection Indicator */}
          <div className="mb-6 p-2.5 rounded-lg border text-xs font-mono flex flex-col gap-1.5 bg-gray-50/80 border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-sans font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-brand-blue" />
                <span>Backend API:</span>
              </span>
              {apiHealth === null ? (
                <span className="text-gray-400">Pinging /api/health...</span>
              ) : apiHealth.error ? (
                <span className="text-red-600 font-bold">Offline ({apiHealth.error})</span>
              ) : (apiHealth.api_status === 'healthy' || apiHealth.status === 'online') ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  <span>Online</span>
                </span>
              ) : (
                <span className="text-amber-700 font-bold">Degraded</span>
              )}
            </div>

            {apiHealth && !apiHealth.error && (
              <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                <span className="text-gray-500 font-sans font-bold text-[11px] uppercase tracking-wider">
                  Database:
                </span>
                {apiHealth.database_connected ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    <span>Connected ({apiHealth.database_type || 'PostgreSQL'})</span>
                  </span>
                ) : (
                  <span className="text-amber-700 font-bold">Disconnected</span>
                )}
              </div>
            )}
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
              <div className="flex-1">
                <div className="font-bold">Authentication Notice:</div>
                <div className="mt-0.5">{errorMessage}</div>
              </div>
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

            {/* Quick Fill Buttons (email only, credentials are secure) */}
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <span className="font-semibold">Quick select:</span>
              <button
                type="button"
                onClick={() => setEmail('agentopslabs@gmail.com')}
                className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-brand-charcoal font-medium border border-gray-200 transition-colors"
              >
                agentopslabs
              </button>
              <button
                type="button"
                onClick={() => setEmail('admin@risenshine.com')}
                className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-brand-charcoal font-medium border border-gray-200 transition-colors"
              >
                admin
              </button>
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
          <div className="mt-6 pt-5 border-t border-brand-border text-center text-[11px] text-brand-muted space-y-1">
            <p>Authorized access only. Public registration is permanently disabled.</p>
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
