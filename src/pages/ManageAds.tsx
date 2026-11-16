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
  Play,
  Clock,
  Tv,
  Film,
  UploadCloud,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { newspaperService } from '../services/newspaper';
import { Advertisement, AdvertisementInput, VideoItem, LanguageCode } from '../types';
import { isTodayDate, formatPublicationDate } from '../utils/date';

export const ManageAds: React.FC = () => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSide, setSelectedSide] = useState<'all' | 'left' | 'right'>('all');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Video state for Center Section
  const [allVideos, setAllVideos] = useState<VideoItem[]>([]);
  const [todaysVideo, setTodaysVideo] = useState<VideoItem | null>(null);
  const [videosLoading, setVideosLoading] = useState(true);

  // Direct video upload modal state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [videoFormData, setVideoFormData] = useState({
    title: '',
    youtube_url: '',
    description: '',
    language: 'en' as LanguageCode,
  });
  const [savingVideo, setSavingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Modal form states for ads
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

  const fetchVideos = async () => {
    try {
      setVideosLoading(true);
      const data = await newspaperService.getAdminVideos();
      setAllVideos(data);
      const today = data.find((v) => isTodayDate(v.published_at || v.created_at));
      setTodaysVideo(today || null);
    } catch (err: any) {
      console.warn('Could not load videos for ads center desk:', err);
    } finally {
      setVideosLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
    fetchVideos();
  }, [selectedSide]);

  const handleOpenUploadVideo = (existing?: VideoItem | null) => {
    setVideoError(null);
    if (existing) {
      setEditingVideo(existing);
      setVideoFormData({
        title: existing.title,
        youtube_url: existing.youtube_url,
        description: existing.description || '',
        language: existing.language || 'en',
      });
    } else {
      setEditingVideo(null);
      setVideoFormData({
        title: "Rise 'n' Shine Editorial Briefing: Today's AI Headlines",
        youtube_url: '',
        description: "Today's editorial news broadcast and technology briefing.",
        language: 'en',
      });
    }
    setIsVideoModalOpen(true);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFormData.title.trim() || !videoFormData.youtube_url.trim()) {
      setVideoError('Video title and YouTube URL are required.');
      return;
    }

    try {
      setSavingVideo(true);
      setVideoError(null);

      if (editingVideo) {
        await newspaperService.updateVideo(editingVideo.id, {
          title: videoFormData.title.trim(),
          youtube_url: videoFormData.youtube_url.trim(),
          description: videoFormData.description.trim() || undefined,
          language: videoFormData.language,
          status: 'published',
        });
        setSuccess("Today's video broadcast updated successfully! It is active on the homepage today and saved in the Videos session.");
      } else {
        await newspaperService.createVideo({
          title: videoFormData.title.trim(),
          youtube_url: videoFormData.youtube_url.trim(),
          description: videoFormData.description.trim() || undefined,
          language: videoFormData.language,
          status: 'published',
        });
        setSuccess("Today's video published successfully! It is now live in the center section and automatically uploaded to the Videos session.");
      }

      setIsVideoModalOpen(false);
      await fetchVideos();
    } catch (err: any) {
      setVideoError(err.response?.data?.detail || 'Failed to save video. Please verify the YouTube URL.');
    } finally {
      setSavingVideo(false);
    }
  };

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

          {/* Center Column: Direct Video Broadcast Desk */}
          <div className="lg:col-span-6 border-2 border-brand-border rounded-xl p-5 bg-white shadow-subtle flex flex-col justify-between min-h-[380px] space-y-4">
            {/* Top Status Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-brand-border">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 fill-brand-blue text-brand-blue" />
                <span>Center Section • Featured Video Broadcast</span>
              </span>
              {videosLoading ? (
                <span className="text-[9px] font-bold text-brand-muted bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                  Checking status...
                </span>
              ) : todaysVideo ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Today's Broadcast Live</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <Clock className="w-2.5 h-2.5 text-amber-700" />
                  <span>Scheduled • 7:00 PM</span>
                </span>
              )}
            </div>

            {/* Content: Either Today's Live Video OR Direct Upload Prompt */}
            {videosLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="w-6 h-6 text-brand-blue animate-spin" />
                <p className="text-xs text-brand-muted">Checking today's broadcast video...</p>
              </div>
            ) : todaysVideo ? (
              <div className="space-y-3.5">
                {/* 16:9 Video Preview */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-black border border-brand-border shadow-xs">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${todaysVideo.youtube_video_id}`}
                    title={todaysVideo.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.2 rounded bg-brand-yellow text-brand-charcoal">
                      Published Today
                    </span>
                    <span className="text-[11px] text-brand-muted font-medium">
                      {formatPublicationDate(todaysVideo.published_at || todaysVideo.created_at)}
                    </span>
                  </div>
                  <h4 className="font-headline text-base font-bold text-brand-charcoal leading-snug line-clamp-2">
                    {todaysVideo.title}
                  </h4>
                  {todaysVideo.description && (
                    <p className="text-xs text-brand-muted mt-0.5 line-clamp-1">
                      {todaysVideo.description}
                    </p>
                  )}
                </div>

                {/* Lifecycle Explanation Notice requested by user */}
                <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-left text-xs text-brand-charcoal space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-brand-blue text-[11px]">
                    <Sparkles className="w-3 h-3 text-brand-yellow" />
                    <span>Auto-Transition Lifecycle</span>
                  </div>
                  <p className="text-[11px] text-brand-muted leading-relaxed">
                    This video is active on the homepage today and permanently saved in the Videos session. Tomorrow, it will automatically step down from this featured slot to the Previous Videos collection in the Videos session, and the scheduled 7:00 PM notice will display on the homepage until tomorrow's video is uploaded.
                  </p>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <button
                    onClick={() => handleOpenUploadVideo(todaysVideo)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-blue text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-800 transition-colors shadow-xs"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Update Today's Video</span>
                  </button>
                  <button
                    onClick={() => handleOpenUploadVideo(null)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-brand-border bg-gray-50 text-brand-charcoal font-bold text-xs uppercase tracking-wider hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-brand-blue" />
                    <span>Upload New Video</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-3 bg-gradient-to-b from-gray-50/80 to-white rounded-lg p-4 border border-brand-border">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-xs">
                    <Tv className="w-7 h-7 text-brand-blue" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-brand-yellow border-2 border-white flex items-center justify-center">
                    <Clock className="w-2.5 h-2.5 text-brand-charcoal" />
                  </span>
                </div>

                <div>
                  <h4 className="font-headline text-lg font-black text-brand-charcoal">
                    Today's Video Not Yet Uploaded
                  </h4>
                  <p className="text-xs text-brand-muted max-w-sm mt-1 leading-relaxed">
                    The homepage is currently displaying: <strong className="text-brand-charcoal">"Our team is working on latest updates, video will upload at 7:00 PM."</strong>
                  </p>
                </div>

                {/* Direct Upload CTA Button */}
                <button
                  onClick={() => handleOpenUploadVideo(null)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-blue text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-800 transition-colors shadow-sm"
                >
                  <UploadCloud className="w-4 h-4 text-brand-green" />
                  <span>Direct Upload Today's Video Broadcast</span>
                </button>

                <p className="text-[10px] text-brand-muted max-w-xs">
                  Uploading here instantly activates the video for today's homepage slot and auto-saves it permanently to the Videos session.
                </p>
              </div>
            )}

            {/* Bottom Session Links */}
            <div className="pt-2 border-t border-brand-border flex items-center justify-between text-xs text-brand-muted">
              <span className="text-[11px] font-semibold">
                {allVideos.length} archived {allVideos.length === 1 ? 'video' : 'videos'} in Videos session
              </span>
              <a
                href="/videos"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-brand-blue hover:underline inline-flex items-center gap-1"
              >
                <span>Preview Videos Page</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
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

      {/* Direct Video Upload / Update Modal */}
      <Modal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        title={editingVideo ? "Update Today's Video Broadcast" : "Direct Upload Today's Video Broadcast"}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveVideo} className="space-y-4">
          {videoError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{videoError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-brand-charcoal uppercase mb-1">
              YouTube Video Link / URL *
            </label>
            <input
              type="text"
              value={videoFormData.youtube_url}
              onChange={(e) => setVideoFormData({ ...videoFormData, youtube_url: e.target.value })}
              placeholder="e.g. https://www.youtube.com/watch?v=J0bg5eTWCpc or https://youtu.be/J0bg5eTWCpc"
              className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg outline-none focus:border-brand-blue"
              required
            />
            <p className="text-[10px] text-brand-muted mt-1">
              Supports standard YouTube watch links (youtube.com/watch?v=...), youtu.be shortlinks, or embed links.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-charcoal uppercase mb-1">
              Video Headline / Title *
            </label>
            <input
              type="text"
              value={videoFormData.title}
              onChange={(e) => setVideoFormData({ ...videoFormData, title: e.target.value })}
              placeholder="e.g. Rise ’n’ Shine Editorial Briefing: Today's AI Headlines"
              className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg outline-none focus:border-brand-blue"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-charcoal uppercase mb-1">
              Brief Editorial Description (Optional)
            </label>
            <textarea
              rows={2}
              value={videoFormData.description}
              onChange={(e) => setVideoFormData({ ...videoFormData, description: e.target.value })}
              placeholder="Summary of today's visual broadcast..."
              className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg outline-none focus:border-brand-blue"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-charcoal uppercase mb-1">
                Edition Language *
              </label>
              <select
                value={videoFormData.language}
                onChange={(e) =>
                  setVideoFormData({ ...videoFormData, language: e.target.value as LanguageCode })
                }
                className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg outline-none focus:border-brand-blue"
              >
                <option value="en">English Edition</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>
          </div>

          {/* Lifecycle Information Pill */}
          <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-lg text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-brand-blue text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-brand-yellow" />
              <span>How today's video works automatically</span>
            </div>
            <p className="text-[11px] text-brand-charcoal leading-relaxed">
              When uploaded, this video becomes active as <strong>Today's Broadcast</strong> in the homepage center section and is permanently saved in the <strong>Videos session</strong>. Tomorrow, this video will automatically step down from this featured slot to the Videos archive, and the scheduled 7:00 PM notice will display on the homepage until tomorrow's video is uploaded.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border">
            <button
              type="button"
              onClick={() => setIsVideoModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-brand-border text-xs font-bold text-brand-charcoal hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingVideo}
              className="px-5 py-2 rounded-lg bg-brand-blue text-white text-xs font-bold hover:bg-blue-800 disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {savingVideo ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing Video...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{editingVideo ? 'Update Video' : 'Publish Video for Today'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default ManageAds;
