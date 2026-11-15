import React, { useState, useEffect } from 'react';
import { Play, Video as VideoIcon, Calendar, Sparkles, Clock } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Navigation } from '../components/layout/Navigation';
import { Footer } from '../components/layout/Footer';
import { VideoCard } from '../components/newspaper/VideoCard';
import { Modal } from '../components/common/Modal';
import { newspaperService } from '../services/newspaper';
import { VideoItem } from '../types';

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

        {/* Video Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="animate-pulse bg-gray-100 h-64 rounded-lg" />
            ))}
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((vid) => (
              <VideoCard
                key={vid.id}
                video={vid}
                onPlay={(selected) => setActiveVideo(selected)}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center border border-brand-border rounded-2xl bg-gradient-to-b from-gray-50/80 to-white shadow-subtle max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
              <span>Premieres Daily at 7:00 PM</span>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto">
              <VideoIcon className="w-8 h-8 text-brand-blue" />
            </div>
            <h3 className="font-headline text-2xl font-black text-brand-charcoal">
              Not Added Yet
            </h3>
            <p className="text-sm font-semibold text-brand-charcoal">
              Today’s visual editorial report will be added at <span className="text-brand-blue font-black underline decoration-brand-yellow underline-offset-4">7:00 PM</span>.
            </p>
            <p className="text-xs text-brand-muted max-w-md mx-auto leading-relaxed">
              Our video team publishes regular daily editorial reports every evening at 7:00 PM. Please check back then.
            </p>
          </div>
        )}
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
              <span>Published: {new Date(activeVideo.published_at || activeVideo.created_at).toLocaleDateString()}</span>
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
