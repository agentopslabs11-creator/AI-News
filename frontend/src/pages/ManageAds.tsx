import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Image as ImageIcon,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { newspaperService } from '../services/newspaper';
import { Advertisement, AdvertisementInput } from '../types';

export const ManageAds: React.FC = () => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSide, setSelectedSide] = useState<'all' | 'left' | 'right'>('all');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [formData, setFormData] = useState<AdvertisementInput>({
    title: '',
    image_url: '',
    link_url: '',
    side: 'left',
    position: 1,
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const data = await newspaperService.getAdminAdvertisements(
        selectedSide === 'all' ? undefined : selectedSide
      );
      setAds(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load advertisements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [selectedSide]);

  const handleOpenAdd = (side: 'left' | 'right' = 'left', position: number = 1) => {
    setEditingAd(null);
    setFormData({
      title: '',
      image_url: '',
      link_url: '',
      side,
      position,
      is_active: true,
    });
    setIsModalOpen(true);
    setError(null);
  };

  const handleOpenEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      image_url: ad.image_url,
      link_url: ad.link_url || '',
      side: ad.side,
      position: ad.position,
      is_active: ad.is_active,
    });
    setIsModalOpen(true);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.image_url.trim() || !formData.link_url.trim()) {
      setError('Title, image URL, and target destination URL are required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      if (editingAd) {
        await newspaperService.updateAdvertisement(editingAd.id, formData);
        setSuccess(`Advertisement "${formData.title}" updated successfully.`);
      } else {
        await newspaperService.createAdvertisement(formData);
        setSuccess(`Advertisement "${formData.title}" created successfully.`);
      }
      try {
        localStorage.removeItem('rns_cache_ads');
      } catch {}
      setIsModalOpen(false);
      fetchAds();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d: any) => `${d.loc ? d.loc.slice(-1)[0] : 'field'}: ${d.msg}`).join(', '));
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Failed to save advertisement.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (ad: Advertisement) => {
    try {
      await newspaperService.updateAdvertisement(ad.id, { is_active: !ad.is_active });
      fetchAds();
    } catch (err: any) {
      setError('Failed to update status.');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await newspaperService.deleteAdvertisement(deleteId);
      setDeleteId(null);
      setSuccess('Advertisement slot removed successfully.');
      fetchAds();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError('Failed to delete advertisement.');
    }
  };

  const leftAds = ads.filter((a) => a.side === 'left').sort((a, b) => a.position - b.position);
  const rightAds = ads.filter((a) => a.side === 'right').sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-50 text-brand-blue text-xs font-bold uppercase tracking-wider mb-1">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Homepage Ad Manager</span>
          </div>
          <h1 className="font-headline text-3xl font-black text-brand-charcoal">
            Manage Advertisements (3 Left & 3 Right)
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Control the 3 left-hand and 3 right-hand display ads flanking the featured video player on the homepage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenAdd('left', 1)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-blue text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-800 transition-colors shadow-subtle"
          >
            <Plus className="w-4 h-4" />
            <span>Add Advertisement</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="font-bold underline">Dismiss</button>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="font-bold underline">Dismiss</button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 border-b border-brand-border pb-3">
        <button
          onClick={() => setSelectedSide('all')}
          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
            selectedSide === 'all'
              ? 'bg-brand-charcoal text-white'
              : 'text-brand-charcoal hover:bg-gray-100'
          }`}
        >
          All Slots ({ads.length})
        </button>
        <button
          onClick={() => setSelectedSide('left')}
          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
            selectedSide === 'left'
              ? 'bg-brand-blue text-white'
              : 'text-brand-charcoal hover:bg-gray-100'
          }`}
        >
          Left Column (3 Ads)
        </button>
        <button
          onClick={() => setSelectedSide('right')}
          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
            selectedSide === 'right'
              ? 'bg-brand-blue text-white'
              : 'text-brand-charcoal hover:bg-gray-100'
          }`}
        >
          Right Column (3 Ads)
        </button>
      </div>

      {/* Visual Live Layout Simulator */}
      <div className="border border-brand-border rounded-xl p-6 bg-white shadow-subtle">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-blue" />
            <h3 className="font-headline text-lg font-bold text-brand-charcoal">
              Homepage Top Section Preview
            </h3>
          </div>
          <span className="text-[11px] text-brand-muted">
            3 Left Ads • Center Video Player • 3 Right Ads
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column Preview (3 slots) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-[11px] font-black uppercase tracking-wider text-brand-blue flex items-center justify-between">
              <span>Left Ads (Slots 1, 2, 3)</span>
              <button
                onClick={() => handleOpenAdd('left', leftAds.length + 1)}
                className="text-[10px] underline hover:text-brand-charcoal"
              >
                + Add Left
              </button>
            </div>
            {[1, 2, 3].map((pos) => {
              const ad = leftAds.find((a) => a.position === pos);
              return ad ? (
                <div
                  key={ad.id}
                  className="border border-brand-border rounded-lg p-2.5 bg-white shadow-xs hover:border-brand-blue transition-all relative group"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={ad.image_url}
                      alt={ad.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80';
                      }}
                      className="w-16 h-12 rounded object-cover border border-brand-border flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-blue-50 text-brand-blue border border-blue-200">
                          Slot #{ad.position}
                        </span>
                        {!ad.is_active && (
                          <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-brand-charcoal truncate mt-0.5">
                        {ad.title}
                      </p>
                      <a
                        href={ad.link_url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-brand-muted hover:text-brand-blue truncate flex items-center gap-0.5"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span className="truncate">{ad.link_url || 'No link'}</span>
                      </a>
                    </div>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-brand-border flex items-center justify-end gap-2 text-xs">
                    <button
                      onClick={() => handleOpenEdit(ad)}
                      className="text-brand-blue hover:underline text-[11px] font-bold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(ad)}
                      className="text-gray-600 hover:underline text-[11px]"
                    >
                      {ad.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => setDeleteId(ad.id)}
                      className="text-red-600 hover:underline text-[11px]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={`empty-left-${pos}`}
                  onClick={() => handleOpenAdd('left', pos)}
                  className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-brand-blue hover:bg-blue-50/20 cursor-pointer transition-all"
                >
                  <p className="text-xs font-bold text-brand-muted">+ Left Slot #{pos} Empty</p>
                  <span className="text-[10px] text-brand-blue">Click to assign ad</span>
                </div>
              );
            })}
          </div>

          {/* Center Column: Video Player Representation */}
          <div className="lg:col-span-6 border-2 border-dashed border-brand-border rounded-xl p-6 bg-gray-50/60 flex flex-col items-center justify-center text-center min-h-[360px]">
            <div className="w-16 h-16 rounded-full bg-brand-yellow/30 flex items-center justify-center text-brand-charcoal mb-3">
              <Megaphone className="w-8 h-8 text-brand-blue" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-brand-blue mb-1">
              Center Section
            </span>
            <h4 className="font-headline text-xl font-black text-brand-charcoal">
              Featured Video Player Display
            </h4>
            <p className="text-xs text-brand-muted max-w-sm mt-1 mb-4 leading-relaxed">
              The featured YouTube news broadcast is centered here, flanked by 3 left and 3 right advertisements.
            </p>
            <a
              href="/admin/videos"
              className="text-xs font-bold text-brand-blue hover:underline inline-flex items-center gap-1"
            >
              <span>Manage Broadcast Videos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Right Column Preview (3 slots) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-[11px] font-black uppercase tracking-wider text-brand-blue flex items-center justify-between">
              <span>Right Ads (Slots 1, 2, 3)</span>
              <button
                onClick={() => handleOpenAdd('right', rightAds.length + 1)}
                className="text-[10px] underline hover:text-brand-charcoal"
              >
                + Add Right
              </button>
            </div>
            {[1, 2, 3].map((pos) => {
              const ad = rightAds.find((a) => a.position === pos);
              return ad ? (
                <div
                  key={ad.id}
                  className="border border-brand-border rounded-lg p-2.5 bg-white shadow-xs hover:border-brand-blue transition-all relative group"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={ad.image_url}
                      alt={ad.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80';
                      }}
                      className="w-16 h-12 rounded object-cover border border-brand-border flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          Slot #{ad.position}
                        </span>
                        {!ad.is_active && (
                          <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-brand-charcoal truncate mt-0.5">
                        {ad.title}
                      </p>
                      <a
                        href={ad.link_url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-brand-muted hover:text-brand-blue truncate flex items-center gap-0.5"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span className="truncate">{ad.link_url || 'No link'}</span>
                      </a>
                    </div>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-brand-border flex items-center justify-end gap-2 text-xs">
                    <button
                      onClick={() => handleOpenEdit(ad)}
                      className="text-brand-blue hover:underline text-[11px] font-bold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(ad)}
                      className="text-gray-600 hover:underline text-[11px]"
                    >
                      {ad.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => setDeleteId(ad.id)}
                      className="text-red-600 hover:underline text-[11px]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={`empty-right-${pos}`}
                  onClick={() => handleOpenAdd('right', pos)}
                  className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-brand-blue hover:bg-blue-50/20 cursor-pointer transition-all"
                >
                  <p className="text-xs font-bold text-brand-muted">+ Right Slot #{pos} Empty</p>
                  <span className="text-[10px] text-brand-blue">Click to assign ad</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ads Table */}
      <div className="border border-brand-border rounded-xl bg-white overflow-hidden shadow-subtle">
        <div className="p-4 border-b border-brand-border flex items-center justify-between">
          <h3 className="font-headline text-lg font-bold text-brand-charcoal">
            All Configured Advertisement Records
          </h3>
          <span className="text-xs text-brand-muted">
            Total configured: {ads.length}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-brand-muted">Loading advertisements...</div>
        ) : ads.length === 0 ? (
          <div className="p-12 text-center text-xs text-brand-muted">
            No advertisements configured yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-brand-border font-bold uppercase tracking-wider text-brand-muted text-[10px]">
                <tr>
                  <th className="py-3 px-4">Side & Slot</th>
                  <th className="py-3 px-4">Preview</th>
                  <th className="py-3 px-4">Ad Title</th>
                  <th className="py-3 px-4">Target URL</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {ads.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          ad.side === 'left'
                            ? 'bg-blue-50 text-brand-blue border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {ad.side.toUpperCase()} • Slot {ad.position}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <img
                        src={ad.image_url}
                        alt={ad.title}
                        className="w-14 h-10 object-cover rounded border border-brand-border"
                      />
                    </td>
                    <td className="py-3 px-4 font-bold text-brand-charcoal max-w-xs truncate">
                      {ad.title}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate">
                      <a
                        href={ad.link_url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-blue hover:underline inline-flex items-center gap-1"
                      >
                        <span className="truncate">{ad.link_url || 'No URL'}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(ad)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          ad.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}
                      >
                        {ad.is_active ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Disabled</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(ad)}
                        className="p-1.5 rounded hover:bg-gray-100 text-brand-blue"
                        title="Edit advertisement"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(ad.id)}
                        className="p-1.5 rounded hover:bg-gray-100 text-red-600"
                        title="Delete advertisement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAd ? `Edit Advertisement #${editingAd.id}` : 'Create Advertisement Slot'}
        maxWidth="xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-charcoal uppercase mb-1">
                Sidebar Side *
              </label>
              <select
                value={formData.side}
                onChange={(e) =>
                  setFormData({ ...formData, side: e.target.value as 'left' | 'right' })
                }
                className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg outline-none focus:border-brand-blue"
              >
                <option value="left">Left Column (Slot 1-3)</option>
                <option value="right">Right Column (Slot 1-3)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-charcoal uppercase mb-1">
                Position Slot (1, 2, or 3) *
              </label>
              <select
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: parseInt(e.target.value, 10) })
                }
                className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg outline-none focus:border-brand-blue"
              >
                <option value={1}>Slot 1 (Top)</option>
                <option value={2}>Slot 2 (Middle)</option>
                <option value={3}>Slot 3 (Bottom)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-charcoal uppercase mb-1">
              Advertisement Title / Sponsor Name *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Next-Gen Cloud Compute Foundry"
              className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg outline-none focus:border-brand-blue"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-charcoal uppercase mb-1">
              Banner Image URL *
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg outline-none focus:border-brand-blue"
              required
            />
            {formData.image_url && (
              <div className="mt-2">
                <p className="text-[10px] text-brand-muted mb-1">Live Image Preview:</p>
                <img
                  src={formData.image_url}
                  alt="Preview"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80';
                  }}
                  className="w-full h-28 object-cover rounded-lg border border-brand-border"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-charcoal uppercase mb-1">
              Destination Target Link URL *
            </label>
            <input
              type="url"
              value={formData.link_url}
              onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
              placeholder="https://example.com/partner-page"
              className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg outline-none focus:border-brand-blue"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded border-brand-border text-brand-blue focus:ring-brand-blue"
            />
            <label htmlFor="isActiveCheck" className="text-xs font-bold text-brand-charcoal cursor-pointer">
              Set as Active Advertisement (Visible on Homepage)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-brand-border text-xs font-bold text-brand-charcoal hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-brand-blue text-white text-xs font-bold hover:bg-blue-800 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingAd ? 'Save Changes' : 'Create Advertisement'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Confirm Advertisement Deletion"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-brand-charcoal leading-relaxed">
            Are you sure you want to remove this advertisement slot? The homepage slot will be cleared until re-assigned.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setDeleteId(null)}
              className="px-4 py-2 border border-brand-border text-xs font-bold rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default ManageAds;
