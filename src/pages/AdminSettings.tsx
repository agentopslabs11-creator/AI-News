import React, { useState } from 'react';
import { ShieldCheck, Lock, Database, Server, CheckCircle, AlertTriangle, Key } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth';

export const AdminSettings: React.FC = () => {
  const { admin } = useAuth();

  // Change password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    try {
      setLoading(true);
      await authService.changePassword(currentPassword, newPassword);
      setMessage({ type: 'success', text: 'Password successfully updated with Argon2 encryption.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to update password. Verify your current password.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      {/* Title */}
      <div className="border-b border-brand-border pb-5">
        <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">
          Security & Configuration
        </span>
        <h1 className="font-headline text-2xl sm:text-3xl font-black text-brand-charcoal mt-1">
          Administrator Settings & System Profile
        </h1>
        <p className="text-xs text-brand-muted mt-1">
          Manage credentials, audit logging parameters, and verify Neon PostgreSQL storage integrity.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-brand-border rounded-xl p-6 shadow-subtle space-y-4">
        <h3 className="font-headline text-lg font-bold text-brand-charcoal flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-blue" />
          <span>Active Administrator Identity</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-gray-50 border border-brand-border">
            <span className="text-brand-muted block text-[10px] uppercase font-bold">Full Name</span>
            <span className="font-bold text-brand-charcoal text-sm mt-0.5 block">{admin?.name || 'Administrator'}</span>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 border border-brand-border">
            <span className="text-brand-muted block text-[10px] uppercase font-bold">Email Address</span>
            <span className="font-bold text-brand-charcoal text-sm mt-0.5 block">{admin?.email || 'admin@risenshine.com'}</span>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 border border-brand-border">
            <span className="text-brand-muted block text-[10px] uppercase font-bold">Security Role</span>
            <span className="font-bold text-brand-blue text-sm mt-0.5 uppercase block">{admin?.role || 'admin'}</span>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white border border-brand-border rounded-xl p-6 shadow-subtle space-y-5">
        <h3 className="font-headline text-lg font-bold text-brand-charcoal flex items-center gap-2">
          <Key className="w-5 h-5 text-brand-blue" />
          <span>Update Account Password</span>
        </h3>

        {message && (
          <div
            className={`p-3.5 rounded-lg text-xs flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md text-xs">
          <div className="space-y-1">
            <label className="block font-bold uppercase tracking-wider text-brand-charcoal">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-blue"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold uppercase tracking-wider text-brand-charcoal">
              New Password (Min 8 Characters)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-blue"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold uppercase tracking-wider text-brand-charcoal">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-blue"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-brand-blue text-white font-bold uppercase tracking-wider hover:bg-blue-800 transition-colors shadow-subtle disabled:opacity-50"
            >
              {loading ? 'Rehashing Password...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Production Infrastructure Spec */}
      <div className="bg-white border border-brand-border rounded-xl p-6 shadow-subtle space-y-4">
        <h3 className="font-headline text-lg font-bold text-brand-charcoal flex items-center gap-2">
          <Server className="w-5 h-5 text-brand-blue" />
          <span>Production Architecture Verification</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg border border-brand-border bg-gray-50/50 space-y-2">
            <div className="flex items-center gap-2 font-bold text-brand-charcoal">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Neon PostgreSQL</span>
            </div>
            <p className="text-brand-muted text-[11px] leading-relaxed">
              Permanent newspaper broadsheet HTML storage via TEXT column. SSL-enabled connection pooling.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-brand-border bg-gray-50/50 space-y-2">
            <div className="flex items-center gap-2 font-bold text-brand-charcoal">
              <Server className="w-4 h-4 text-brand-blue" />
              <span>Render Backend</span>
            </div>
            <p className="text-brand-muted text-[11px] leading-relaxed">
              FastAPI Python backend with HttpOnly cookies, BeautifulSoup4 sanitization, and Argon2 password security.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-brand-border bg-gray-50/50 space-y-2">
            <div className="flex items-center gap-2 font-bold text-brand-charcoal">
              <ShieldCheck className="w-4 h-4 text-brand-yellow fill-amber-300" />
              <span>Vercel Frontend</span>
            </div>
            <p className="text-brand-muted text-[11px] leading-relaxed">
              React + Vite + TypeScript editorial UI with sandboxed iframe e-paper reader and responsive Tailwind layouts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
