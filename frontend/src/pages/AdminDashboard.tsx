import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  Layers,
  FileText,
  Video,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Database,
  Shield,
  Calendar,
} from 'lucide-react';
import { newspaperService } from '../services/newspaper';
import { DashboardStats, ActivityLog } from '../types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const data = await newspaperService.getDashboardData();
        setStats(data.stats);
        setActivity(data.recent_activity);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-brand-border">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">
            Editorial Management
          </span>
          <h1 className="font-headline text-2xl sm:text-3xl font-black text-brand-charcoal mt-1">
            Publishing Dashboard Overview
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Monitor daily multi-language print editions, articles, broadcast entries, and system status.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-blue text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-800 transition-colors shadow-subtle"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Newspaper</span>
          </Link>
          <Link
            to="/admin/articles"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-brand-border bg-white text-brand-charcoal font-bold text-xs uppercase tracking-wider hover:bg-gray-50 transition-colors shadow-subtle"
          >
            <FileText className="w-4 h-4 text-brand-blue" />
            <span>Write Article</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Published Editions */}
        <div className="bg-white border border-brand-border rounded-xl p-5 shadow-subtle relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
              Published Editions
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="font-headline text-3xl font-black text-brand-blue">
            {stats?.total_published_editions ?? '—'}
          </div>
          <div className="mt-2 text-[11px] text-brand-muted flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Stored directly in Neon PostgreSQL</span>
          </div>
        </div>

        {/* Language Breakdown */}
        <div className="bg-white border border-brand-border rounded-xl p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
              By Language
            </span>
            <span className="text-[10px] font-bold bg-brand-green/40 text-brand-charcoal px-2 py-0.5 rounded">
              Active
            </span>
          </div>
          <div className="space-y-1.5 text-xs font-bold">
            <div className="flex justify-between items-center text-blue-900">
              <span>English (EN):</span>
              <span>{stats?.english_editions ?? 0}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-800 font-telugu">
              <span>తెలుగు (TE):</span>
              <span>{stats?.telugu_editions ?? 0}</span>
            </div>
            <div className="flex justify-between items-center text-amber-800 font-hindi">
              <span>हिंदी (HI):</span>
              <span>{stats?.hindi_editions ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Total Articles Published */}
        <div className="bg-white border border-brand-border rounded-xl p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
              Published Articles
            </span>
            <div className="w-8 h-8 rounded-lg bg-green-50 text-emerald-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="font-headline text-3xl font-black text-brand-charcoal">
            {stats?.total_articles ?? '—'}
          </div>
          <div className="mt-2 text-[11px] text-brand-muted flex items-center gap-1.5">
            <Link to="/admin/articles" className="text-brand-blue font-bold hover:underline">
              Manage stories →
            </Link>
          </div>
        </div>

        {/* Published Videos & Drafts */}
        <div className="bg-white border border-brand-border rounded-xl p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
              Videos & Drafts
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="font-headline text-3xl font-black text-brand-charcoal">
                {stats?.total_videos ?? '—'}
              </span>
              <span className="text-[11px] text-brand-muted ml-1">videos</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-yellow/30 text-amber-900 border border-amber-200">
                {stats?.draft_editions ?? 0} drafts
              </span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-brand-muted">
            <Link to="/admin/videos" className="text-brand-blue font-bold hover:underline">
              View broadcasts →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Launchpad & Architecture Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Launch Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-brand-charcoal">
            Publishing Actions
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/admin/upload"
              className="group p-5 rounded-xl border border-brand-border bg-white hover:border-brand-blue transition-all shadow-subtle flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors flex items-center justify-center flex-shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-headline text-base font-bold text-brand-charcoal group-hover:text-brand-blue">
                  Upload Daily Edition
                </h4>
                <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                  Sanitize and persist HTML newspaper files directly into PostgreSQL TEXT storage.
                </p>
              </div>
            </Link>

            <Link
              to="/admin/editions"
              className="group p-5 rounded-xl border border-brand-border bg-white hover:border-brand-blue transition-all shadow-subtle flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-green-50 text-emerald-700 group-hover:bg-brand-green group-hover:text-brand-charcoal transition-colors flex items-center justify-center flex-shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-headline text-base font-bold text-brand-charcoal group-hover:text-brand-blue">
                  Manage Editions
                </h4>
                <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                  Preview broadsheets, replace HTML files, publish drafts, and review histories.
                </p>
              </div>
            </Link>

            <Link
              to="/admin/articles"
              className="group p-5 rounded-xl border border-brand-border bg-white hover:border-brand-blue transition-all shadow-subtle flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-brand-yellow group-hover:text-brand-charcoal transition-colors flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-headline text-base font-bold text-brand-charcoal group-hover:text-brand-blue">
                  Publish Articles
                </h4>
                <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                  Draft breaking stories, assign categories, and feed multilingual wire readers.
                </p>
              </div>
            </Link>

            <Link
              to="/admin/videos"
              className="group p-5 rounded-xl border border-brand-border bg-white hover:border-brand-blue transition-all shadow-subtle flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors flex items-center justify-center flex-shrink-0">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-headline text-base font-bold text-brand-charcoal group-hover:text-brand-blue">
                  YouTube Broadcasts
                </h4>
                <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                  Embed and curate verified video journalism clips with language desks.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Database & Storage Architecture Card */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-brand-charcoal">
            Storage Integrity
          </h3>

          <div className="p-5 rounded-xl border border-brand-border bg-gray-50/50 space-y-4 shadow-subtle">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-brand-blue" />
              <h4 className="font-headline text-sm font-bold text-brand-charcoal">
                Neon PostgreSQL Storage Rule
              </h4>
            </div>
            <p className="text-xs text-brand-muted leading-relaxed">
              In strict accordance with system architecture specifications, 100% of newspaper broadsheet HTML is stored directly in PostgreSQL using a TEXT column.
            </p>
            <div className="space-y-2 text-[11px] font-medium border-t border-brand-border pt-3">
              <div className="flex items-center justify-between text-brand-charcoal">
                <span>External File Storage:</span>
                <span className="font-bold text-emerald-600">NONE (Compliant)</span>
              </div>
              <div className="flex items-center justify-between text-brand-charcoal">
                <span>HTML Sanitization:</span>
                <span className="font-bold text-emerald-600">BeautifulSoup4</span>
              </div>
              <div className="flex items-center justify-between text-brand-charcoal">
                <span>Auth Cryptography:</span>
                <span className="font-bold text-emerald-600">Argon2 + JWT</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Publishing Activity Audit Log */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-blue" />
            <h3 className="text-xs font-black uppercase tracking-widest text-brand-charcoal">
              Recent Publishing & Audit Activity
            </h3>
          </div>
          <span className="text-[11px] text-brand-muted">
            Last {activity.length} recorded events
          </span>
        </div>

        <div className="border border-brand-border rounded-xl overflow-hidden bg-white shadow-subtle">
          {activity.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-brand-border text-brand-muted font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Timestamp</th>
                    <th className="px-5 py-3">Action</th>
                    <th className="px-5 py-3">Entity</th>
                    <th className="px-5 py-3">Administrator</th>
                    <th className="px-5 py-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {activity.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3 text-brand-muted whitespace-nowrap">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                        {new Date(log.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 font-bold text-brand-blue whitespace-nowrap">
                        {log.action}
                      </td>
                      <td className="px-5 py-3 text-brand-charcoal uppercase text-[10px] font-bold">
                        {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
                      </td>
                      <td className="px-5 py-3 text-brand-charcoal truncate max-w-[150px]">
                        {log.admin_email || 'System'}
                      </td>
                      <td className="px-5 py-3 text-brand-muted truncate max-w-xs">
                        {log.details || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-brand-muted">
              No recent administrative actions recorded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
