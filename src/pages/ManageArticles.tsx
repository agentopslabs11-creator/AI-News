import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  Zap,
  Image as ImageIcon,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { LanguageBadge } from '../components/common/LanguageBadge';
import { newspaperService } from '../services/newspaper';
import { Article, Category, LanguageCode } from '../types';

export const ManageArticles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterLang, setFilterLang] = useState<string>('');
  const [filterCat, setFilterCat] = useState<number | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Create / Edit Modal
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [isBreaking, setIsBreaking] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [saving, setSaving] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Multi-select / Bulk Delete
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [arts, cats] = await Promise.all([
        newspaperService.getAdminArticles({
          language: filterLang || undefined,
          category_id: filterCat,
          status: filterStatus || undefined,
        }),
        newspaperService.getAdminCategories(),
      ]);
      setArticles(arts);
      setCategories(cats);
      setSelectedIds((prev) => prev.filter((id) => arts.some((a) => a.id === id)));
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterLang, filterCat, filterStatus]);

  const handleToggleSelectAll = () => {
    if (selectedIds.length === articles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(articles.map((a) => a.id));
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    try {
      setBulkDeleting(true);
      const res = await newspaperService.bulkDeleteArticles(selectedIds);
      setFeedback({
        type: 'success',
        message: `${res.deleted_count || selectedIds.length} articles deleted successfully.`,
      });
      setSelectedIds([]);
      setShowBulkDeleteModal(false);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.detail || 'Bulk delete failed.' });
    } finally {
      setBulkDeleting(false);
    }
  };

  // Open Create
  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setLanguage('en');
    setDescription('');
    setContent('');
    setImageUrl('');
    setCategoryId(categories.length > 0 ? categories[0].id : undefined);
    setIsBreaking(false);
    setIsFeatured(false);
    setStatus('published');
    setShowEditor(true);
  };

  // Open Edit
  const handleOpenEdit = (art: Article) => {
    setEditingId(art.id);
    setTitle(art.title);
    setSlug(art.slug);
    setLanguage(art.language);
    setDescription(art.description || '');
    setContent(art.content);
    setImageUrl(art.image_url || '');
    setCategoryId(art.category_id || undefined);
    setIsBreaking(art.is_breaking);
    setIsFeatured(art.is_featured);
    setStatus(art.status);
    setShowEditor(true);
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setFeedback({ type: 'error', message: 'Title and content are required.' });
      return;
    }

    try {
      setSaving(true);
      const payload: Partial<Article> = {
        title: title.trim(),
        slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        language,
        description: description.trim() || null,
        content: content.trim(),
        image_url: imageUrl.trim() || null,
        category_id: categoryId,
        is_breaking: isBreaking,
        is_featured: isFeatured,
        status,
      };

      if (editingId) {
        await newspaperService.updateArticle(editingId, payload);
        setFeedback({ type: 'success', message: 'Article updated successfully.' });
      } else {
        await newspaperService.createArticle(payload);
        setFeedback({ type: 'success', message: 'Article created and published.' });
      }
      setShowEditor(false);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.detail || 'Operation failed.' });
    } finally {
      setSaving(false);
    }
  };

  // Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await newspaperService.deleteArticle(deleteTarget.id);
      setDeleteTarget(null);
      setFeedback({ type: 'success', message: 'Article deleted successfully.' });
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Delete failed.' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-brand-border">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">
            Wire & Editorial News
          </span>
          <h1 className="font-headline text-2xl sm:text-3xl font-black text-brand-charcoal mt-1">
            Manage Articles & Wire Dispatches
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Author and edit multilingual news stories across English, Telugu, and Hindi categories.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-blue text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-800 transition-colors shadow-subtle flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </button>
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
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter toolbar & Bulk Actions */}
      <div className="bg-white border border-brand-border rounded-xl p-4 shadow-subtle flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
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

          <select
            value={filterCat || ''}
            onChange={(e) => setFilterCat(e.target.value ? Number(e.target.value) : undefined)}
            className="px-3 py-1.5 border border-brand-border rounded-lg bg-white outline-none focus:border-brand-blue"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 border border-brand-border rounded-lg bg-white outline-none focus:border-brand-blue"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-lg">
            <span className="font-bold text-red-900 text-xs">
              {selectedIds.length} article{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-700 transition-colors shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-gray-500 hover:text-gray-800 underline text-xs"
            >
              Deselect All
            </button>
          </div>
        )}
      </div>

      {/* Articles Table */}
      <div className="bg-white border border-brand-border rounded-xl overflow-hidden shadow-subtle">
        {loading ? (
          <div className="p-12 text-center text-xs text-brand-muted">Loading articles...</div>
        ) : articles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-brand-border text-brand-muted font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={articles.length > 0 && selectedIds.length === articles.length}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue cursor-pointer"
                      title="Select / Deselect All Articles"
                    />
                  </th>
                  <th className="px-5 py-3.5">Headline & Category</th>
                  <th className="px-4 py-3.5">Language</th>
                  <th className="px-4 py-3.5">Flags</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Created</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {articles.map((art) => {
                  const isSelected = selectedIds.includes(art.id);
                  return (
                    <tr
                      key={art.id}
                      className={`hover:bg-gray-50/70 transition-colors ${
                        isSelected ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <td className="px-4 py-4 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(art.id)}
                          className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue cursor-pointer"
                        />
                      </td>
                      <td className="px-5 py-4 max-w-sm">
                      <div className="font-headline font-bold text-sm text-brand-charcoal truncate">
                        {art.title}
                      </div>
                      <div className="text-[10px] text-brand-muted mt-0.5">
                        {art.category?.name || 'Unassigned'} • /{art.slug}
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <LanguageBadge language={art.language} size="sm" />
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap space-x-1">
                      {art.is_breaking && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-brand-yellow/30 text-amber-900 border border-amber-200 text-[10px] font-bold">
                          <Zap className="w-3 h-3" /> Breaking
                        </span>
                      )}
                      {art.is_featured && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-brand-green/30 text-brand-charcoal text-[10px] font-bold">
                          Featured
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          art.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {art.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-brand-muted">
                      {new Date(art.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(art)}
                        className="p-1.5 rounded border border-brand-border hover:bg-gray-100 text-brand-charcoal"
                        title="Edit Article"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(art)}
                        className="p-1.5 rounded border border-red-200 hover:bg-red-50 text-red-600"
                        title="Delete Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-xs text-brand-muted space-y-2">
            <FileText className="w-10 h-10 text-brand-muted mx-auto" />
            <h4 className="font-bold text-brand-charcoal">No articles found</h4>
            <p>Click "New Article" to publish your first story.</p>
          </div>
        )}
      </div>

      {/* Article Editor Modal */}
      {showEditor && (
        <Modal
          isOpen={showEditor}
          onClose={() => setShowEditor(false)}
          title={editingId ? 'Edit Article' : 'Compose New Article'}
          maxWidth="4xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block font-bold uppercase tracking-wider text-brand-charcoal">
                  Language Desk
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                  className="w-full px-3 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-blue"
                >
                  <option value="en">English</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="hi">हिंदी (Hindi)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold uppercase tracking-wider text-brand-charcoal">
                  Category
                </label>
                <select
                  value={categoryId || ''}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-blue"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold uppercase tracking-wider text-brand-charcoal">
                  Publishing Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-blue"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold uppercase tracking-wider text-brand-charcoal">
                Article Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Enter compelling, accurate newspaper headline..."
                className="w-full px-3.5 py-2 text-sm border border-brand-border rounded-lg outline-none focus:border-brand-blue font-headline font-bold text-brand-blue"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold uppercase tracking-wider text-brand-charcoal">
                Short Description / Subdeck
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="One or two sentences summarizing the news angle..."
                className="w-full px-3.5 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-blue"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold uppercase tracking-wider text-brand-charcoal">
                Featured Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-blue"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold uppercase tracking-wider text-brand-charcoal">
                Article Content Body
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={7}
                placeholder="Full article copy and paragraphs..."
                className="w-full px-3.5 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-blue leading-relaxed font-sans"
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="rounded border-gray-300 text-brand-blue"
                />
                <span>Mark as Breaking News (Ticker Alert)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-gray-300 text-brand-blue"
                />
                <span>Feature in Homepage Hero</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
              <button
                type="button"
                onClick={() => setShowEditor(false)}
                className="px-4 py-2 rounded-lg border border-brand-border font-bold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-brand-blue text-white font-bold uppercase tracking-wider hover:bg-blue-800 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update Article' : 'Publish Article'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <Modal
          isOpen={showBulkDeleteModal}
          onClose={() => setShowBulkDeleteModal(false)}
          title="Delete Multiple Articles"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 space-y-1">
              <p className="font-bold">
                Are you sure you want to permanently delete {selectedIds.length} selected article{selectedIds.length > 1 ? 's' : ''}?
              </p>
              <p className="text-[11px] text-red-700">
                This action is irreversible. All selected articles will be permanently removed from the wire feed and database.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 rounded-lg border border-brand-border font-bold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDeleteConfirm}
                disabled={bulkDeleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold uppercase tracking-wider hover:bg-red-700 disabled:opacity-50"
              >
                {bulkDeleting ? 'Deleting...' : `Confirm Delete (${selectedIds.length})`}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Delete Article"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs font-sans">
            <p>
              Are you sure you want to permanently delete article <strong>"{deleteTarget.title}"</strong>?
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
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold uppercase tracking-wider hover:bg-red-700"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
