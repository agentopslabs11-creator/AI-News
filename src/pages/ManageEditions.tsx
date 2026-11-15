import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Upload,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Filter,
  FileCode,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { LanguageBadge } from '../components/common/LanguageBadge';
import { newspaperService } from '../services/newspaper';
import { NewspaperEdition, NewspaperEditionDetail, LanguageCode } from '../types';

export const ManageEditions: React.FC = () => {
  const [editions, setEditions] = useState<NewspaperEdition[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterLang, setFilterLang] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');

  // Modals
  const [previewDetail, setPreviewDetail] = useState<NewspaperEditionDetail | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Edit Metadata Modal
  const [editingEdition, setEditingEdition] = useState<NewspaperEdition | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState<'draft' | 'published'>('published');
  const [savingEdit, setSavingEdit] = useState(false);

  // Replace HTML Modal
  const [replaceTarget, setReplaceTarget] = useState<NewspaperEdition | null>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replacing, setReplacing] = useState(false);

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<NewspaperEdition | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Status message
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadEditions = async () => {
    try {
      setLoading(true);
      const data = await newspaperService.getAdminEditions({
        language: filterLang || undefined,
        status: filterStatus || undefined,
        publication_date: filterDate || undefined,
      });
      setEditions(data);
    } catch (err) {
      console.error('Failed to load editions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEditions();
  }, [filterLang, filterStatus, filterDate]);

  // Handle Preview
  const handlePreview = async (id: number) => {
    try {
      setLoadingPreview(true);
      const detail = await newspaperService.getAdminEditionDetail(id);
      setPreviewDetail(detail);
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Could not fetch edition HTML for preview.' });
    } finally {
      setLoadingPreview(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEdition) return;

    try {
      setSavingEdit(true);
      await newspaperService.updateEditionMetadata(editingEdition.id, {
        title: editTitle.trim(),
        description: editDesc.trim(),
        status: editStatus,
      });
      setEditingEdition(null);
      setFeedback({ type: 'success', message: 'Edition metadata updated successfully.' });
      loadEditions();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.detail || 'Update failed.' });
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle Replace HTML
  const handleReplaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replaceTarget || !replaceFile) return;

    try {
      setReplacing(true);
      await newspaperService.replaceEditionHTML(replaceTarget.id, replaceFile);
      setReplaceTarget(null);
      setReplaceFile(null);
      setFeedback({ type: 'success', message: 'HTML replaced in PostgreSQL! Previous latest news deleted and new latest news updated.' });
      loadEditions();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.detail || 'Replacement failed.' });
    } finally {
      setReplacing(false);
    }
  };

  // Toggle Publish / Unpublish
  const handleTogglePublish = async (edition: NewspaperEdition) => {
    try {
      if (edition.status === 'published') {
        await newspaperService.unpublishEdition(edition.id);
        setFeedback({ type: 'success', message: `Edition #${edition.id} unpublished to draft.` });
      } else {
        await newspaperService.publishEdition(edition.id);
        setFeedback({ type: 'success', message: `Edition #${edition.id} published live.` });
      }
      loadEditions();
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Action failed.' });
    }
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await newspaperService.deleteEdition(deleteTarget.id);
      setDeleteTarget(null);
      setFeedback({ type: 'success', message: 'Edition deleted successfully.' });
      loadEditions();
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Deletion failed.' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title & Upload Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-brand-border">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">
            Editions Desk
          </span>
          <h1 className="font-headline text-2xl sm:text-3xl font-black text-brand-charcoal mt-1">
            Manage Newspaper Editions
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Review, preview, replace HTML broadsheets, and control publishing state across English, Telugu, and Hindi editions.
          </p>
        </div>

        <Link
          to="/admin/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-blue text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-800 transition-colors shadow-subtle flex-shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Edition</span>
        </Link>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-bold text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white border border-brand-border rounded-xl p-4 shadow-subtle flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-brand-muted" />
          <span className="font-bold text-brand-charcoal uppercase text-[10px] tracking-wider">
            Filter Editions:
          </span>
        </div>

        {/* Language Filter */}
        <select
          value={filterLang}
          onChange={(e) => setFilterLang(e.target.value)}
          className="px-3 py-1.5 border border-brand-border rounded-lg bg-white outline-none focus:border-brand-blue"
        >
          <option value="">All Languages</option>
          <option value="en">English (EN)</option>
          <option value="te">తెలుగు (TE)</option>
          <option value="hi">हिंदी (HI)</option>
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 border border-brand-border rounded-lg bg-white outline-none focus:border-brand-blue"
        >
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>

        {/* Date Filter */}
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="px-3 py-1.5 border border-brand-border rounded-lg bg-white outline-none focus:border-brand-blue font-medium"
        />

        {(filterLang || filterStatus || filterDate) && (
          <button
            onClick={() => {
              setFilterLang('');
              setFilterStatus('');
              setFilterDate('');
            }}
            className="text-brand-blue font-bold hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Editions Data Table */}
      <div className="bg-white border border-brand-border rounded-xl overflow-hidden shadow-subtle">
        {loading ? (
          <div className="p-12 text-center text-xs text-brand-muted flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-brand-blue" />
            <span>Loading Newspaper Editions...</span>
          </div>
        ) : editions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-brand-border text-brand-muted font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Edition Title</th>
                  <th className="px-4 py-3.5">Language</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Size</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {editions.map((ed) => (
                  <tr key={ed.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Title */}
                    <td className="px-5 py-4">
                      <div className="font-headline font-bold text-sm text-brand-charcoal">
                        {ed.title}
                      </div>
                      <div className="text-[10px] text-brand-muted mt-0.5 truncate max-w-xs">
                        {ed.original_filename}
                      </div>
                    </td>

                    {/* Language Badge */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <LanguageBadge language={ed.language} size="sm" />
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 whitespace-nowrap font-medium text-brand-charcoal">
                      {ed.publication_date}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          ed.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{ed.status}</span>
                      </span>
                    </td>

                    {/* Content Size */}
                    <td className="px-4 py-4 whitespace-nowrap text-brand-muted font-mono text-[11px]">
                      {(ed.content_size / 1024).toFixed(1)} KB
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right whitespace-nowrap space-x-1.5">
                      {/* Preview Button */}
                      <button
                        onClick={() => handlePreview(ed.id)}
                        className="p-1.5 rounded border border-brand-border hover:bg-gray-100 text-brand-blue"
                        title="Preview Broadsheet"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit Metadata */}
                      <button
                        onClick={() => {
                          setEditingEdition(ed);
                          setEditTitle(ed.title);
                          setEditDesc(ed.description || '');
                          setEditStatus(ed.status === 'draft' ? 'draft' : 'published');
                        }}
                        className="p-1.5 rounded border border-brand-border hover:bg-gray-100 text-brand-charcoal"
                        title="Edit Metadata"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Replace HTML */}
                      <button
                        onClick={() => {
                          setReplaceTarget(ed);
                          setReplaceFile(null);
                        }}
                        className="p-1.5 rounded border border-brand-border hover:bg-gray-100 text-brand-charcoal"
                        title="Replace HTML File"
                      >
                        <FileCode className="w-4 h-4" />
                      </button>

                      {/* Toggle Publish */}
                      <button
                        onClick={() => handleTogglePublish(ed)}
                        className={`p-1.5 rounded border ${
                          ed.status === 'published'
                            ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                            : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        }`}
                        title={ed.status === 'published' ? 'Unpublish to Draft' : 'Publish Live'}
                      >
                        {ed.status === 'published' ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteTarget(ed)}
                        className="p-1.5 rounded border border-red-200 hover:bg-red-50 text-red-600"
                        title="Delete Edition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-xs text-brand-muted space-y-3">
            <Layers className="w-10 h-10 text-brand-muted mx-auto" />
            <h4 className="font-headline text-base font-bold text-brand-charcoal">
              No editions match the current filter.
            </h4>
            <p className="text-xs">Upload new HTML daily newspaper files to populate your archive.</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewDetail && (
        <Modal
          isOpen={!!previewDetail}
          onClose={() => setPreviewDetail(null)}
          title={`Broadsheet Preview: ${previewDetail.title}`}
          maxWidth="full"
        >
          <div className="space-y-3">
            <div className="p-2.5 bg-gray-50 border border-brand-border rounded flex items-center justify-between text-xs text-brand-muted">
              <span>Sandboxed preview rendered from PostgreSQL TEXT column</span>
              <div className="flex items-center gap-2">
                <LanguageBadge language={previewDetail.language} size="sm" />
                <span className="font-mono">{(previewDetail.content_size / 1024).toFixed(1)} KB</span>
              </div>
            </div>
            <div className="w-full h-[650px] border border-brand-border rounded overflow-hidden bg-white shadow-inner">
              <iframe
                title="Preview"
                srcDoc={previewDetail.html_content}
                sandbox="allow-same-origin"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Metadata Modal */}
      {editingEdition && (
        <Modal
          isOpen={!!editingEdition}
          onClose={() => setEditingEdition(null)}
          title={`Edit Edition #${editingEdition.id}`}
          maxWidth="md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-sans">
            <div className="space-y-1">
              <label className="block font-bold uppercase tracking-wider text-brand-charcoal">
                Edition Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-blue"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold uppercase tracking-wider text-brand-charcoal">
                Description / Notes
              </label>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-blue"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold uppercase tracking-wider text-brand-charcoal">
                Publishing Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-blue"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border">
              <button
                type="button"
                onClick={() => setEditingEdition(null)}
                className="px-4 py-2 rounded-lg border border-brand-border font-bold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="px-4 py-2 rounded-lg bg-brand-blue text-white font-bold uppercase tracking-wider hover:bg-blue-800 disabled:opacity-50"
              >
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Replace HTML Modal */}
      {replaceTarget && (
        <Modal
          isOpen={!!replaceTarget}
          onClose={() => setReplaceTarget(null)}
          title={`Replace HTML: ${replaceTarget.title}`}
          maxWidth="md"
        >
          <form onSubmit={handleReplaceSubmit} className="space-y-4 text-xs font-sans">
            <p className="text-brand-muted leading-relaxed">
              Upload a new HTML file to replace the broadsheet content for{' '}
              <strong>{replaceTarget.language.toUpperCase()}</strong> on{' '}
              <strong>{replaceTarget.publication_date}</strong>. The new HTML will be validated, saved directly into PostgreSQL, <strong>previous latest news will be deleted</strong>, and <strong>new latest news will be automatically extracted and shown</strong>.
            </p>

            <div className="border-2 border-dashed border-brand-border rounded-xl p-6 text-center space-y-2">
              <input
                type="file"
                accept=".html,.htm"
                onChange={(e) => setReplaceFile(e.target.files?.[0] || null)}
                required
                className="text-xs"
              />
              {replaceFile && (
                <div className="text-[11px] text-emerald-700 font-bold mt-1">
                  Selected: {replaceFile.name} ({(replaceFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border">
              <button
                type="button"
                onClick={() => setReplaceTarget(null)}
                className="px-4 py-2 rounded-lg border border-brand-border font-bold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!replaceFile || replacing}
                className="px-4 py-2 rounded-lg bg-brand-blue text-white font-bold uppercase tracking-wider hover:bg-blue-800 disabled:opacity-50"
              >
                {replacing ? 'Validating & Replacing...' : 'Confirm Replace'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Accidental Deletion Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Confirm Permanent Deletion"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-800">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="font-bold">Permanent Deletion Warning</p>
                <p className="mt-1">
                  Are you certain you wish to delete edition "{deleteTarget.title}" ({deleteTarget.language.toUpperCase()}, {deleteTarget.publication_date})?
                </p>
              </div>
            </div>
            <p className="text-brand-muted leading-relaxed">
              This action cannot be undone. Readers will no longer be able to access this edition from the live newspaper or historical archive.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg border border-brand-border font-bold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold uppercase tracking-wider hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
