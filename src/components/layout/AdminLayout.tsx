import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AdminSidebar } from '../admin/AdminSidebar';
import { Shield, Sparkles } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-brand-green rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
          Securing Editorial Environment...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/admin/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return (
    <div className="min-h-screen bg-white text-brand-charcoal flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-brand-border bg-white px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="font-headline font-bold text-lg text-brand-charcoal">
              Editorial Control Center
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-green/30 text-brand-charcoal font-bold">
              Neon PostgreSQL Connected
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-brand-muted">
            <span className="flex items-center gap-1.5 text-brand-charcoal">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Production Pipeline Active</span>
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-8 bg-white max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
