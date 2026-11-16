import React, { useState, useEffect } from 'react';
import { Play, Video as VideoIcon, Calendar, Sparkles, Clock, Tv, Film } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Navigation } from '../components/layout/Navigation';
import { Footer } from '../components/layout/Footer';
import { VideoCard } from '../components/newspaper/VideoCard';
import { Modal } from '../components/common/Modal';
import { newspaperService } from '../services/newspaper';
import { VideoItem } from '../types';
import { isTodayDate, formatPublicationDate } from '../utils/date';

export const Videos: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    async function loadVideos() {
      try {
        setLoading(true);
        // Exclusively fetch English editorial videos from Rise 'n' Shine
        const data = await newspaperService.getVideos('en', 30);
        const rnsOnly = data.filter((v: VideoItem) => v.title.toLowerCase().includes('rise'));
        setVideos(rnsOnly.length > 0 ? rnsOnly : data);
      } catch (err) {
        console.error('Failed to load videos:', err);
      } finally {
        setLoading(false);
      }
    }
    loadVideos();
  }, []);

  // Separate today's video from previous videos
  const todaysVideo = videos.find((v) => isTodayDate(v.published_at || v.created_at));
  const previousVideos = videos.filter((v) => !isTodayDate(v.published_at || v.created_at));

  return (
    <div className="min-h-screen bg-white text-brand-charcoal flex flex-col font-sans">
      <Header
        currentLanguage="en"
        mobileNavOpen={mobileNavOpen}
        onToggleMobileNav={() => setMobileNavOpen(!mobileNavOpen)}
      />
      <Navigation
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <main className="flex-1 w-full px-4 sm:px-8 py-8">
        {/* Banner */}
        <div className="border-b border-brand-border pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
              <VideoIcon className="w-3.5 h-3.5 text-brand-blue" />
              <span>Video Desks & Broadcasts</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl font-black text-brand-charcoal tracking-tight mt-1">
              Video News Center
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted mt-2">
              Curated editorial video analyses, technological briefings, and investigative visual journalism.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-blue text-white font-bold text-xs shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-yellow" />
              <span>English Editorial Edition</span>
            </span>
          </div>
        </div>

        {/* If Today's Video is NOT yet uploaded, display the prominent 7 PM message banner */}
        {!loading && !todaysVideo && (
          <div className="border border-brand-border rounded-2xl bg-gradient-to-r from-amber-50/90 via-white to-amber-50/50 p-6 sm:p-8 mb-8 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center flex-shrink-0">
                <Clock className="w-7 h-7 text-amber-800 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                  <span>Scheduled • Today at 7:00 PM</span>
                </div>
                <h2 className="font-headline text-xl sm:text-2xl font-black text-brand-charcoal">
                  Our team is working on latest updates, video will upload at 7:00 PM
                </h2>
                <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                  Today’s visual editorial report is currently in production. Catch up on all previous video broadcasts below.
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-brand-border text-xs font-bold text-brand-muted shadow-xs">
                <span>{previousVideos.length} Previous Videos Below</span>
              </span>
            </div>
          </div>
        )}

        {/* If Today's Video IS present, feature it prominently */}
        {!loading && todaysVideo && (
          <div className="border border-brand-border rounded-2xl bg-white shadow-editorial p-6 mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Today's Featured Broadcast</span>
              </span>
              <span className="text-xs text-brand-muted">
                {formatPublicationDate(todaysVideo.published_at || todaysVideo.created_at)}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-inner">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${todaysVideo.youtube_video_id}`}
                    title={todaysVideo.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
              <div className="lg:col-span-5 space-y-3">
                <h2 className="font-headline text-2xl font-black text-brand-charcoal leading-snug">
                  {todaysVideo.title}
                </h2>
                {todaysVideo.description && (
                  <p className="text-sm text-brand-muted leading-relaxed">
                    {todaysVideo.description}
                  </p>
                )}
                <div className="pt-2">
                  <a
                    href={todaysVideo.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:underline"
                  >
                    <span>Watch directly on YouTube</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Previous Videos Header */}
        {!loading && previousVideos.length > 0 && (
          <div className="flex items-center justify-between pb-3 mb-6 border-b border-brand-border">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-brand-blue" />
              <h2 className="font-headline text-xl sm:text-2xl font-black text-brand-charcoal">
                Previous Video Broadcasts
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-brand-charcoal font-bold text-xs ml-2">
                {previousVideos.length} {previousVideos.length === 1 ? 'Video' : 'Videos'}
              </span>
            </div>
            <span className="text-xs text-brand-muted hidden sm:inline">
              Click any video to play
            </span>
          </div>
        )}

        {/* Video Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="animate-pulse bg-gray-100 h-64 rounded-lg" />
            ))}
          </div>
        ) : previousVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {previousVideos.map((vid) => (
              <VideoCard
                key={vid.id}
                video={vid}
                onPlay={(selected) => setActiveVideo(selected)}
              />
            ))}
          </div>
        ) : !todaysVideo ? (
          <div className="p-12 text-center border border-brand-border rounded-2xl bg-gradient-to-b from-gray-50/80 to-white shadow-subtle max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
              <span>Premieres Daily at 7:00 PM</span>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto">
              <VideoIcon className="w-8 h-8 text-brand-blue" />
            </div>
            <h3 className="font-headline text-2xl font-black text-brand-charcoal">
              Not Yet Uploaded
            </h3>
            <p className="text-sm font-semibold text-brand-charcoal">
              Our team is working on latest updates, video will upload at <span className="text-brand-blue font-black underline decoration-brand-yellow underline-offset-4">7:00 PM</span>.
            </p>
            <p className="text-xs text-brand-muted max-w-md mx-auto leading-relaxed">
              Our video team publishes regular daily editorial reports every evening at 7:00 PM. Please check back then.
            </p>
          </div>
        ) : null}
      </main>

      {/* Embedded YouTube Player Modal */}
      {activeVideo && (
        <Modal
          isOpen={!!activeVideo}
          onClose={() => setActiveVideo(null)}
          title={activeVideo.title}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black shadow-lg">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtube_video_id}?autoplay=1`}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {activeVideo.description && (
              <p className="text-sm text-brand-charcoal leading-relaxed">
                {activeVideo.description}
              </p>
            )}
            <div className="text-xs text-brand-muted pt-2 border-t border-brand-border flex items-center justify-between">
              <span>Published: {formatPublicationDate(activeVideo.published_at || activeVideo.created_at)}</span>
              <a
                href={activeVideo.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-blue font-bold hover:underline"
              >
                Watch on YouTube →
              </a>
            </div>
          </div>
        </Modal>
      )}

      <Footer />
    </div>
  );
};
export default Videos;
