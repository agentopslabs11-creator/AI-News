import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  Layers,
  FileText,
  Tag,
  Video,
  Archive,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Megaphone,
} from 'lucide-react';
import { RiseShineLogo } from '../common/RiseShineLogo';
import { useAuth } from '../../hooks/useAuth';

export const AdminSidebar: React.FC = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navLinks = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Upload Edition', path: '/admin/upload', icon: Upload },
    { label: 'Manage Editions', path: '/admin/editions', icon: Layers },
    { label: 'Manage Ads (3+3)', path: '/admin/ads', icon: Megaphone },
    { label: 'Manage Articles', path: '/admin/articles', icon: FileText },
    { label: 'Manage Categories', path: '/admin/categories', icon: Tag },
    { label: 'Manage Videos', path: '/admin/videos', icon: Video },
    { label: 'Archive View', path: '/admin/archive', icon: Archive },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-brand-border min-h-screen flex flex-col justify-between p-4 sticky top-0 select-none shadow-[2px_0_8px_rgba(0,0,0,0.02)]">
      <div>
        {/* Logo and Brand */}
        <div className="pb-6 pt-2 px-2 border-b border-brand-border">
          <RiseShineLogo size="sm" linkToHome={false} />
          <div className="mt-2.5 flex items-center gap-1.5 px-2 py-1 rounded bg-blue-50 border border-blue-100 text-brand-blue text-[10px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Editorial Publishing CMS</span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="mt-6 space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted px-3 mb-2">
            Publishing Workspace
          </p>
          {navLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all relative ${
                  isActive
                    ? 'bg-brand-green text-brand-charcoal shadow-sm'
                    : 'text-brand-charcoal hover:bg-gray-50 hover:text-brand-blue'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-brand-charcoal' : 'text-brand-blue'}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-brand-charcoal" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Info & Footer Actions */}
      <div className="pt-4 border-t border-brand-border space-y-3">
        {/* Return to Public Site */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg border border-brand-border hover:bg-gray-50 text-xs font-semibold text-brand-charcoal transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-brand-blue" />
            <span>View Live Paper</span>
          </span>
          <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">
            LIVE
          </span>
        </a>

        {/* Current Admin Tag */}
        <div className="px-3 py-2 bg-gray-50 rounded-lg border border-brand-border">
          <div className="text-[11px] font-bold text-brand-charcoal truncate">{admin?.name || 'Administrator'}</div>
          <div className="text-[10px] text-brand-muted truncate">{admin?.email || 'admin@risenshine.com'}</div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
