import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { newspaperService } from '../services/newspaper';
import { Category, LanguageCode } from '../types';

export const ManageCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Editor Modal
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [language, setLanguage] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // Delete target
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await newspaperService.getAdminCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setLanguage('');
    setShowEditor(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingId(c.id);
    setName(c.name);
    setSlug(c.slug);
    setLanguage(c.language || '');
    setShowEditor(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      const autoSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const payload = {
        name: name.trim(),
        slug: autoSlug,
        language: (language as LanguageCode) || null,
      };

      if (editingId) {
        await newspaperService.updateCategory(editingId, payload);
        setFeedback({ type: 'success', message: 'Category updated successfully.' });
      } else {
        await newspaperService.createCategory(payload);
        setFeedback({ type: 'success', message: 'Category created successfully.' });
      }
      setShowEditor(false);
      loadCategories();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.detail || 'Operation failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await newspaperService.deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
      setFeedback({ type: 'success', message: 'Category deleted successfully.' });
      loadCategories();
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Delete failed.' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-brand-border">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">
            Taxonomy & Desks
          </span>
          <h1 className="font-headline text-2xl sm:text-3xl font-black text-brand-charcoal mt-1">
            Manage News Categories
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Configure editorial desks and category sections across multilingual portals.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-blue text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-800 transition-colors shadow-subtle flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

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

      {/* Categories Table */}
      <div className="bg-white border border-brand-border rounded-xl overflow-hidden shadow-subtle">
        {loading ? (
          <div className="p-12 text-center text-xs text-brand-muted">Loading categories...</div>
        ) : categories.length > 0 ? (
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-brand-border text-brand-muted font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Category Name</th>
                <th className="px-4 py-3.5">Slug Identifier</th>
                <th className="px-4 py-3.5">Language Target</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-headline font-bold text-sm text-brand-charcoal">
                    {c.name}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-brand-muted text-[11px]">
                    {c.slug}
                  </td>
                  <td className="px-4 py-3.5">
                    {c.language ? (
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100">
                        {c.language}
                      </span>
                    ) : (
                      <span className="text-[10px] text-brand-muted italic">All Editions</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 rounded border border-brand-border hover:bg-gray-100 text-brand-charcoal"
                      title="Edit Category"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(c)}
                      className="p-1.5 rounded border border-red-200 hover:bg-red-50 text-red-600"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-xs text-brand-muted">No categories found.</div>
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <Modal
          isOpen={showEditor}
          onClose={() => setShowEditor(false)}
          title={editingId ? 'Edit Category' : 'Create Category'}
          maxWidth="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            <div className="space-y-1">
              <label className="block font-bold uppercase tracking-wider text-brand-charcoal">
                Category Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Artificial Intelligence"
                className="w-full px-3 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-blue"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold uppercase tracking-wider text-brand-charcoal">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="artificial-intelligence"
                className="w-full px-3 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-blue font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold uppercase tracking-wider text-brand-charcoal">
                Language (Optional)
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-blue"
              >
                <option value="">Shared Across All Languages</option>
                <option value="en">English Only</option>
                <option value="te">Telugu Only</option>
                <option value="hi">Hindi Only</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border">
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
                className="px-4 py-2 rounded-lg bg-brand-blue text-white font-bold uppercase tracking-wider hover:bg-blue-800 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Delete Category"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs font-sans">
            <p>
              Are you sure you want to delete category <strong>"{deleteTarget.name}"</strong>? Articles assigned to this category will become unassigned.
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
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
