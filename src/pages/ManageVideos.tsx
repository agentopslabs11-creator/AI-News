import React, { useState, useEffect } from 'react';
import { Video, Plus, Edit, Trash2, Play, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { LanguageBadge } from '../components/common/LanguageBadge';
import { newspaperService } from '../services/newspaper';
import { VideoItem, LanguageCode } from '../types';

export const ManageVideos: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Editor Modal
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [saving, setSaving] = useState(false);

  // Preview Modal
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<VideoItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const data = await newspaperService.getAdminVideos();
      setVideos(data);
    } catch (err) {
      console.error('Failed to load videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setYoutubeUrl('');
    setLanguage('en');
    setStatus('published');
    setShowEditor(true);
  };

  const handleOpenEdit = (v: VideoItem) => {
    setEditingId(v.id);
    setTitle(v.title);
    setDescription(v.description || '');
    setYoutubeUrl(v.youtube_url);
    setLanguage(v.language);
    setStatus(v.status);
    setShowEditor(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !youtubeUrl.trim()) {
      setFeedback({ type: 'error', message: 'Title and YouTube URL are required.' });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        youtube_url: youtubeUrl.trim(),
        language,
        status,
      };

      if (editingId) {
        await newspaperService.updateVideo(editingId, payload);
        setFeedback({ type: 'success', message: 'Video entry updated.' });
      } else {
        await newspaperService.createVideo(payload);
        setFeedback({ type: 'success', message: 'YouTube video published successfully.' });
      }
      setShowEditor(false);
      loadVideos();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.detail || 'Invalid YouTube URL.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await newspaperService.deleteVideo(deleteTarget.id);
      setDeleteTarget(null);
      setFeedback({ type: 'success', message: 'Video entry deleted.' });
      loadVideos();
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Deletion failed.' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-brand-border">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">
            Multimedia Wire
          </span>
          <h1 className="font-headline text-2xl sm:text-3xl font-black text-brand-charcoal mt-1">
            Manage Video Broadcasts
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Publish and embed verified YouTube journalism and technological briefs.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-blue text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-800 transition-colors shadow-subtle flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Video</span>
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

      {/* Video Table */}
      <div className="bg-white border border-brand-border rounded-xl overflow-hidden shadow-subtle">
        {loading ? (
          <div className="p-12 text-center text-xs text-brand-muted">Loading video library...</div>
        ) : videos.length > 0 ? (
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-brand-border text-brand-muted font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Video Title & ID</th>
                <th className="px-4 py-3.5">Language</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Published</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {videos.map((vid) => (
                <tr key={vid.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() => setPreviewVideo(vid)}
                        className="w-16 h-10 rounded bg-black flex-shrink-0 relative overflow-hidden cursor-pointer group"
                      >
                        <img
                          src={vid.thumbnail_url || `https://img.youtube.com/vi/${vid.youtube_video_id}/hqdefault.jpg`}
                          alt={vid.title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 text-white fill-current" />
                        </div>
                      </div>
                      <div className="min-w-0 max-w-sm">
                        <div className="font-headline font-bold text-sm text-brand-charcoal truncate">
                          {vid.title}
                        </div>
                        <div className="text-[10px] text-brand-muted font-mono truncate">
                          ID: {vid.youtube_video_id}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <LanguageBadge language={vid.language} size="sm" />
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        vid.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {vid.status}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap text-brand-muted">
                    {new Date(vid.published_at).toLocaleDateString()}
                  </td>

                  <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => setPreviewVideo(vid)}
                      className="p-1.5 rounded border border-brand-border hover:bg-gray-100 text-brand-blue"
                      title="Play Preview"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(vid)}
                      className="p-1.5 rounded border border-brand-border hover:bg-gray-100 text-brand-charcoal"
                      title="Edit Video"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(vid)}
                      className="p-1.5 rounded border border-red-200 hover:bg-red-50 text-red-600"
                      title="Delete Video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-xs text-brand-muted">No videos published yet.</div>
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <Modal
          isOpen={showEditor}
          onClose={() => setShowEditor(false)}
          title={editingId ? 'Edit Video Entry' : 'Add YouTube Video Broadcast'}
          maxWidth="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            <div className="space-y-1">
              <label className="block font-bold uppercase tracking-wider text-brand-charcoal">
                YouTube URL
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                required
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-blue"
              />
              <p className="text-[10px] text-brand-muted">
                Accepts standard watch links, youtu.be share URLs, or embed URLs.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block font-bold uppercase tracking-wider text-brand-charcoal">
                Video Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Brief editorial video title..."
                className="w-full px-3 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-blue font-headline font-bold text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold uppercase tracking-wider text-brand-charcoal">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Context, transcript highlights, or speaker notes..."
                className="w-full px-3 py-2 border border-brand-border rounded-lg outline-none focus:border-brand-blue"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                {saving ? 'Validating...' : editingId ? 'Update' : 'Publish Video'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Preview Modal */}
      {previewVideo && (
        <Modal
          isOpen={!!previewVideo}
          onClose={() => setPreviewVideo(null)}
          title={`Preview: ${previewVideo.title}`}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black shadow-lg">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${previewVideo.youtube_video_id}?autoplay=1`}
                title={previewVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {previewVideo.description && (
              <p className="text-xs text-brand-muted leading-relaxed">
                {previewVideo.description}
              </p>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Delete Video Entry"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs font-sans">
            <p>
              Are you sure you want to delete video broadcast <strong>"{deleteTarget.title}"</strong>?
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
