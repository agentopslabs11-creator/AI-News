import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Play,
  Calendar,
  Layers,
  Share2,
  AlertCircle,
  Megaphone,
  Clock,
  Tv,
  Image as ImageIcon,
  Archive,
} from 'lucide-react';
import { isTodayDate, formatPublicationDate } from '../utils/date';
import { Header } from '../components/layout/Header';
import { Navigation } from '../components/layout/Navigation';
import { Footer } from '../components/layout/Footer';
import { BreakingNewsTicker } from '../components/newspaper/BreakingNewsTicker';
import { ArticleStoryModal } from '../components/newspaper/ArticleStoryModal';
import { newspaperService } from '../services/newspaper';
import {
  Article,
  NewspaperEditionDetail,
  VideoItem,
  Advertisement,
} from '../types';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Helper to load cached data from localStorage safely for instant flicker-free rendering
  const getCached = <T,>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  };

  const defaultBroadcastVideo: VideoItem = {
    id: 1,
    title: 'Rise ’n’ Shine Editorial Briefing: How AI is Reshaping Modern Scientific Discovery',
    description: 'Special editorial broadcast covering breakthroughs in autonomous scientific research and digital media integrity.',
    youtube_url: 'https://youtu.be/J0bg5eTWCpc',
    youtube_video_id: 'J0bg5eTWCpc',
    thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    language: 'en',
    status: 'published',
    created_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
  };

  const cachedAds = getCached<{ left: Advertisement[]; right: Advertisement[] }>('rns_cache_ads');
  const cachedVideo = getCached<VideoItem>('rns_cache_video');
  const cachedEdition = getCached<NewspaperEditionDetail>('rns_cache_english_edition');

  // Check if cached edition or video is actually from today
  const initialIsTodayEdition = cachedEdition ? isTodayDate(cachedEdition.publication_date) : false;
  const initialIsTodayVideo = cachedVideo ? isTodayDate(cachedVideo.published_at || cachedVideo.created_at) : false;

  const [loading, setLoading] = useState(!cachedAds && !cachedEdition);

  // Cached Breaking News strictly from submitted newspaper broadsheet
  const cachedBreakingNews: Article[] = (() => {
    try {
      const saved = localStorage.getItem('rns_cache_breaking_news');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })();

  // Data states
  const [breakingNews, setBreakingNews] = useState<Article[]>(cachedBreakingNews);
  const [allVideos, setAllVideos] = useState<VideoItem[]>([]);
  // Only set todaysVideo if it is genuinely published today
  const [todaysVideo, setTodaysVideo] = useState<VideoItem | null>(initialIsTodayVideo ? cachedVideo : null);

  // 3 Left & 3 Right Advertisements
  const [leftAds, setLeftAds] = useState<Advertisement[]>(cachedAds?.left || []);
  const [rightAds, setRightAds] = useState<Advertisement[]>(cachedAds?.right || []);

  // English Newspaper Broadsheet (Default Paper on Home)
  // If not today's edition, englishEdition stays null and latestPreviousEdition stores it
  const [englishEdition, setEnglishEdition] = useState<NewspaperEditionDetail | null>(
    initialIsTodayEdition ? cachedEdition : null
  );
  const [latestPreviousEdition, setLatestPreviousEdition] = useState<NewspaperEditionDetail | null>(
    !initialIsTodayEdition && cachedEdition ? cachedEdition : null
  );
  const [isTodayEdition, setIsTodayEdition] = useState<boolean>(initialIsTodayEdition);
  const [editionLoading, setEditionLoading] = useState<boolean>(!cachedEdition);
  const [editionError, setEditionError] = useState<string | null>(null);

  // Selected story for authentic popup modal
  const [selectedStoryArticle, setSelectedStoryArticle] = useState<Article | null>(null);

  // E-Paper Zoom & Display Controls
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const broadsheetContainerRef = useRef<HTMLDivElement>(null);
  const broadsheetSectionRef = useRef<HTMLDivElement>(null);

  // Fetch Homepage Data: Breaking news, ads, videos, and English edition
  useEffect(() => {
    async function loadHomepage() {
      try {
        const [breaking, adsData, videoList, edition] = await Promise.allSettled([
          newspaperService.getBreakingNews('en'),
          newspaperService.getAdvertisements(),
          newspaperService.getVideos('en', 12),
          newspaperService.getLatestEdition('en'),
        ]);

        if (breaking.status === 'fulfilled' && breaking.value.length > 0) {
          setBreakingNews(breaking.value);
          try {
            localStorage.setItem('rns_cache_breaking_news', JSON.stringify(breaking.value));
          } catch {}
        }
        if (adsData.status === 'fulfilled') {
          const l = adsData.value.left || [];
          const r = adsData.value.right || [];
          setLeftAds(l);
          setRightAds(r);
          try {
            localStorage.setItem('rns_cache_ads', JSON.stringify({ left: l, right: r }));
          } catch {}
        }
        if (videoList.status === 'fulfilled' && videoList.value.length > 0) {
          const rnsVideos = videoList.value.filter((v: VideoItem) =>
            v.title.toLowerCase().includes('rise')
          );
          const finalVideos = rnsVideos.length > 0 ? rnsVideos : videoList.value;
          setAllVideos(finalVideos);

          // Find if there is an editorial video published TODAY
          const todayVid = finalVideos.find((v: VideoItem) =>
            isTodayDate(v.published_at || v.created_at)
          );

          if (todayVid) {
            setTodaysVideo(todayVid);
            try {
              localStorage.setItem('rns_cache_video', JSON.stringify(todayVid));
            } catch {}
          } else {
            // Previous video goes to Videos session, NOT featured as today's
            setTodaysVideo(null);
            try {
              localStorage.removeItem('rns_cache_video');
            } catch {}
          }
        } else {
          setTodaysVideo(null);
          setAllVideos([]);
        }

        if (edition.status === 'fulfilled' && edition.value) {
          const isToday = isTodayDate(edition.value.publication_date);
          if (isToday) {
            setEnglishEdition(edition.value);
            setIsTodayEdition(true);
            try {
              localStorage.setItem('rns_cache_english_edition', JSON.stringify(edition.value));
            } catch {}
          } else {
            // Previous edition goes to Previous Papers session, NOT featured on Home as today's paper
            setEnglishEdition(null);
            setIsTodayEdition(false);
            setLatestPreviousEdition(edition.value);
            try {
              localStorage.removeItem('rns_cache_english_edition');
            } catch {}
          }
          setEditionLoading(false);
        } else {
          setEnglishEdition(null);
          setIsTodayEdition(false);
          setEditionLoading(false);
        }
      } catch (err) {
        console.error('Homepage initial load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomepage();
  }, []);

  // Zoom handlers for the English newspaper broadsheet
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 160));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 60));
  const handleZoomReset = () => setZoomLevel(100);

  const toggleFullscreen = () => {
    if (!broadsheetContainerRef.current) return;
    if (!document.fullscreenElement) {
      broadsheetContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const scrollToNewspaper = () => {
    broadsheetSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper fallback advertisements if admin hasn't filled all 3 slots
  const fallbackLeftAds = [
    {
      id: 101,
      title: 'Quantum Foundry — Enterprise Cloud QPU Infrastructure',
      image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
      link_url: 'https://example.com/quantum',
      side: 'left' as const,
      position: 1,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 102,
      title: 'Renewable Clean Power Grid Summit 2026',
      image_url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=600&q=80',
      link_url: 'https://example.com/clean-energy',
      side: 'left' as const,
      position: 2,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 103,
      title: 'Autonomous Agricultural Sensor Suite',
      image_url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=600&q=80',
      link_url: 'https://example.com/smart-agri',
      side: 'left' as const,
      position: 3,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];

  const fallbackRightAds = [
    {
      id: 104,
      title: 'Global Semiconductor Lithography Expo 2026',
      image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
      link_url: 'https://example.com/semiconductors',
      side: 'right' as const,
      position: 1,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 105,
      title: 'Bio-Molecular Synthesis Accelerator Network',
      image_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80',
      link_url: 'https://example.com/biotech',
      side: 'right' as const,
      position: 2,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 106,
      title: 'Deep-Space Laser Communications Satellite Network',
      image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
      link_url: 'https://example.com/satellite',
      side: 'right' as const,
      position: 3,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];

  // Merge admin ads with fallbacks ensuring exactly 3 left and 3 right ads
  const displayLeftAds = [1, 2, 3].map((pos) => {
    return leftAds.find((a) => a.position === pos) || fallbackLeftAds[pos - 1];
  });

  const displayRightAds = [1, 2, 3].map((pos) => {
    return rightAds.find((a) => a.position === pos) || fallbackRightAds[pos - 1];
  });

  return (
    <div className="min-h-screen bg-white text-brand-charcoal flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentLanguage="en"
        mobileNavOpen={mobileNavOpen}
        onToggleMobileNav={() => setMobileNavOpen(!mobileNavOpen)}
      />

      {/* Main Navigation (Home, Latest, తెలుగు, हिंदी, Videos, Archive) */}
      <Navigation
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Breaking News Ticker with Headline Click Popup */}
      <BreakingNewsTicker
        items={breakingNews}
        onArticleClick={(item) => setSelectedStoryArticle(item)}
      />

      <main className="flex-1 w-full">
        {/* Edition Quick Switcher Bar */}
        <section className="bg-gray-50 border-b border-brand-border py-2 px-4 sm:px-8">
          <div className="w-full flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-brand-blue uppercase tracking-wider text-[11px]">
                Edition:
              </span>
              <span className="font-extrabold text-brand-charcoal bg-white px-2 py-0.5 rounded border border-brand-border">
                English (Default)
              </span>
              {isTodayEdition ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Today’s Broadsheet Live</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>Today's Broadsheet: In Production</span>
                </span>
              )}
              <button
                onClick={scrollToNewspaper}
                className="text-[11px] font-black text-brand-blue hover:underline flex items-center gap-1 cursor-pointer bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
              >
                <span>{isTodayEdition ? 'Read Newspaper Broadsheet ↓' : 'Check Today’s Paper Status ↓'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs flex-wrap">
              <a
                href="https://chat.whatsapp.com/EfN85yaYDu6BKlK409qXbA"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#168a45] hover:bg-[#126e37] text-white font-bold text-[11px] transition-all shadow-xs"
                title="Join official Rise 'n' Shine WhatsApp community"
              >
                <svg aria-hidden="true" height="13" viewBox="0 0 24 24" width="13" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.79 14.07c-.24.68-1.4 1.25-1.93 1.33-.49.07-1.12.1-3.23-.77-2.7-1.12-4.44-3.86-4.57-4.04-.13-.18-1.08-1.44-1.08-2.74 0-1.3.68-1.94.92-2.2.24-.26.53-.33.71-.33.18 0 .35.01.5.01.16 0 .38-.06.59.45.24.59.83 2.01.9 2.16.07.15.12.33.02.53-.1.2-.15.33-.3.51-.15.18-.31.39-.45.53-.15.15-.3.31-.13.61.18.3 1.05 1.73 2.26 2.8 1.56 1.39 2.87 1.82 3.28 2.02.41.2.65.17.89-.1.24-.28 1.02-1.19 1.3-1.6.28-.41.55-.34.92-.2.38.14 2.4 1.13 2.81 1.34.41.2.68.3.78.47.1.17.1.98-.14 1.66z"/>
                </svg>
                <span>Join Daily Updates on WhatsApp</span>
              </a>
              <span className="text-gray-300 hidden sm:inline">•</span>
              <span className="text-brand-muted text-[11px] hidden sm:inline">Direct E-Papers:</span>
              <Link to="/epaper?lang=te" className="text-[11px] font-bold text-brand-blue hover:underline font-telugu">
                తెలుగు ఇ-పేపర్
              </Link>
              <span className="text-gray-300">•</span>
              <Link to="/epaper?lang=hi" className="text-[11px] font-bold text-brand-blue hover:underline font-hindi">
                हिंदी ई-पेपर
              </Link>
            </div>
          </div>
        </section>

        {/* 
          2. STARTING TOP SECTION
          - Middle: Video
          - Sides: 3 ads on left, 3 ads on right (managed by admin)
        */}
        <section className="w-full bg-white py-6 border-b border-brand-border">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT SIDE: 3 Advertisements */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-brand-border">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted flex items-center gap-1">
                    <Megaphone className="w-3 h-3 text-brand-blue" />
                    <span>Sponsored Displays</span>
                  </span>
                  <span className="text-[9px] font-bold text-brand-blue bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                    Left Desk
                  </span>
                </div>

                {loading && leftAds.length === 0 ? (
                  [1, 2, 3].map((i) => (
                    <div key={`skel-left-${i}`} className="border border-brand-border rounded-xl p-2.5 bg-white animate-pulse">
                      <div className="aspect-[16/9] w-full rounded-lg bg-gray-100 mb-2 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-gray-300" />
                      </div>
                      <div className="h-3.5 bg-gray-200 rounded w-3/4 mb-1.5" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  ))
                ) : (
                  displayLeftAds.map((ad, idx) => (
                    <a
                      key={`left-ad-${ad.id || idx}`}
                      href={ad.link_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block border border-brand-border rounded-xl p-2.5 bg-white hover:border-brand-blue hover:shadow-editorial transition-all"
                    >
                      <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-gray-100 mb-2 border border-brand-border">
                        <img
                          src={ad.image_url || undefined}
                          alt={ad.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                        <span className="absolute top-1.5 left-1.5 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-black/70 text-white backdrop-blur-xs">
                          Ad #{idx + 1}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-xs text-brand-charcoal group-hover:text-brand-blue line-clamp-2 leading-snug">
                          {ad.title}
                        </h4>
                        <ExternalLink className="w-3 h-3 text-brand-muted group-hover:text-brand-blue flex-shrink-0 mt-0.5" />
                      </div>
                    </a>
                  ))
                )}
              </div>

              {/* MIDDLE: Featured News Video */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-brand-border">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue flex items-center gap-1.5">
                    <Play className="w-3 h-3 fill-brand-blue text-brand-blue" />
                    <span>Rise ’n’ Shine Video Broadcast</span>
                  </span>
                  {loading && !todaysVideo ? (
                    <span className="text-[9px] font-bold text-brand-muted bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                      Loading...
                    </span>
                  ) : todaysVideo && todaysVideo.youtube_video_id && todaysVideo.youtube_video_id.trim() !== '' ? (
                    <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Live Video Desk
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-amber-700" />
                      <span>Scheduled • 7:00 PM</span>
                    </span>
                  )}
                </div>

                {loading && !todaysVideo ? (
                  <div className="border border-brand-border rounded-2xl bg-white shadow-subtle p-3 space-y-3 animate-pulse">
                    <div className="w-full aspect-video rounded-xl bg-gray-900 flex items-center justify-center">
                      <Play className="w-12 h-12 text-gray-700" />
                    </div>
                    <div className="p-2 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-5 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-full" />
                    </div>
                  </div>
                ) : todaysVideo && todaysVideo.youtube_video_id && todaysVideo.youtube_video_id.trim() !== '' ? (
                  <div className="border border-brand-border rounded-2xl overflow-hidden bg-white shadow-subtle p-3 space-y-3">
                    {/* Responsive 16:9 YouTube Video Embed */}
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-inner">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${todaysVideo.youtube_video_id}`}
                        title={todaysVideo.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>

                    {/* Video Details */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-brand-yellow text-brand-charcoal">
                          Today's Broadcast
                        </span>
                        <span className="text-[11px] text-brand-muted">
                          {new Date(todaysVideo.published_at || todaysVideo.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <h3 className="font-headline text-lg sm:text-xl font-bold text-brand-charcoal leading-snug">
                        {todaysVideo.title}
                      </h3>
                      {todaysVideo.description && (
                        <p className="text-xs text-brand-muted mt-1 line-clamp-2 leading-relaxed">
                          {todaysVideo.description}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border border-brand-border rounded-2xl overflow-hidden bg-gradient-to-b from-gray-50/90 via-white to-gray-50/50 shadow-subtle p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[380px]">
                    {/* Scheduled Pill */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-wider shadow-xs">
                      <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                      <span>Premieres Daily at 7:00 PM</span>
                    </div>

                    {/* Visual Media Graphic */}
                    <div className="relative my-2">
                      <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shadow-inner">
                        <Tv className="w-10 h-10 text-brand-blue" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand-yellow border-2 border-white flex items-center justify-center shadow-xs">
                        <Clock className="w-3.5 h-3.5 text-brand-charcoal" />
                      </div>
                    </div>

                    {/* Prominent Message Requested by User */}
                    <div className="max-w-md space-y-2">
                      <h3 className="font-headline text-2xl sm:text-3xl font-black text-brand-charcoal tracking-tight">
                        Not Yet Uploaded
                      </h3>
                      <p className="text-sm font-bold text-brand-charcoal">
                        Our team is working on latest updates, video will upload at <span className="text-brand-blue font-black underline decoration-brand-yellow underline-offset-4">7:00 PM</span>.
                      </p>
                      <p className="text-xs text-brand-muted leading-relaxed max-w-sm mx-auto">
                        Our news desk is currently finalizing today’s high-impact AI and technology briefing. In the meantime, you can watch all previous video broadcasts in our Video section.
                      </p>
                    </div>

                    {/* Action link pointing to Videos session */}
                    <div className="pt-1">
                      <Link
                        to="/videos"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-blue text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-900 transition-colors shadow-subtle group"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Watch Previous Videos in Video Desk →</span>
                      </Link>
                    </div>

                    {/* Editorial Desk Footer Note */}
                    <div className="pt-3 border-t border-brand-border w-full flex items-center justify-center gap-2 text-[11px] text-brand-muted">
                      <span className="font-bold text-brand-blue">Rise ’n’ Shine Video Desk</span>
                      <span>•</span>
                      <span>Scheduled Daily Release: 7:00 PM</span>
                    </div>
                  </div>
                )}

                {/* Scroll Down Call to Action */}
                <div className="text-center pt-1">
                  <button
                    onClick={scrollToNewspaper}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand-green text-brand-charcoal font-black text-xs uppercase tracking-wider hover:bg-lime-400 transition-all shadow-subtle group"
                  >
                    <span>Scroll to Read English Newspaper</span>
                    <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* RIGHT SIDE: 3 Advertisements */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-brand-border">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted flex items-center gap-1">
                    <Megaphone className="w-3 h-3 text-brand-blue" />
                    <span>Commercial Network</span>
                  </span>
                  <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                    Right Desk
                  </span>
                </div>

                {loading && rightAds.length === 0 ? (
                  [1, 2, 3].map((i) => (
                    <div key={`skel-right-${i}`} className="border border-brand-border rounded-xl p-2.5 bg-white animate-pulse">
                      <div className="aspect-[16/9] w-full rounded-lg bg-gray-100 mb-2 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-gray-300" />
                      </div>
                      <div className="h-3.5 bg-gray-200 rounded w-3/4 mb-1.5" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  ))
                ) : (
                  displayRightAds.map((ad, idx) => (
                    <a
                      key={`right-ad-${ad.id || idx}`}
                      href={ad.link_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block border border-brand-border rounded-xl p-2.5 bg-white hover:border-brand-blue hover:shadow-editorial transition-all"
                    >
                      <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-gray-100 mb-2 border border-brand-border">
                        <img
                          src={ad.image_url || undefined}
                          alt={ad.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                        <span className="absolute top-1.5 left-1.5 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-black/70 text-white backdrop-blur-xs">
                          Ad #{idx + 4}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-xs text-brand-charcoal group-hover:text-brand-blue line-clamp-2 leading-snug">
                          {ad.title}
                        </h4>
                        <ExternalLink className="w-3 h-3 text-brand-muted group-hover:text-brand-blue flex-shrink-0 mt-0.5" />
                      </div>
                    </a>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 
          3. WHEN USER SCROLLS: ENGLISH NEWSPAPER BROADSHEET VIEWER
          Stored in Neon PostgreSQL TEXT column, rendered in sandboxed iframe.
        */}
        <section
          ref={broadsheetSectionRef}
          className="w-full bg-white py-10"
        >
          <div className="w-full px-2 sm:px-6">
            {/* Newspaper Header Bar & Controls */}
            <div className="border border-brand-border rounded-2xl bg-white p-4 sm:p-6 shadow-editorial mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-brand-green/30 border border-brand-green text-brand-charcoal text-xs font-black uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-brand-blue" />
                  <span>Official English Digital Broadsheet</span>
                </div>
                <h2 className="font-headline text-2xl sm:text-4xl font-black text-brand-charcoal">
                  {isTodayEdition && englishEdition?.title
                    ? englishEdition.title
                    : 'Rise ’n’ Shine – English Daily Broadsheet'}
                </h2>
                <div className="flex items-center gap-3 text-xs text-brand-muted mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1 font-semibold text-brand-charcoal">
                    <Calendar className="w-3.5 h-3.5 text-brand-blue" />
                    <span>
                      {isTodayEdition && englishEdition?.publication_date
                        ? formatPublicationDate(englishEdition.publication_date)
                        : formatPublicationDate(new Date())}
                    </span>
                  </span>
                  <span>•</span>
                  {isTodayEdition ? (
                    <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Today's Edition Live</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px] font-bold">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      <span>In Production</span>
                    </span>
                  )}
                  <span>•</span>
                  <span>Direct PostgreSQL Storage</span>
                </div>
              </div>

              {/* Reader Control Buttons OR Archive Links */}
              {isTodayEdition && englishEdition ? (
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Zoom Controls */}
                  <div className="inline-flex items-center bg-gray-50 border border-brand-border rounded-lg p-1 text-xs">
                    <button
                      onClick={handleZoomOut}
                      className="p-1.5 rounded hover:bg-gray-200 text-brand-charcoal"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="px-2.5 font-mono font-bold text-brand-charcoal text-xs min-w-[50px] text-center">
                      {zoomLevel}%
                    </span>
                    <button
                      onClick={handleZoomIn}
                      className="p-1.5 rounded hover:bg-gray-200 text-brand-charcoal"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleZoomReset}
                      className="p-1.5 rounded hover:bg-gray-200 text-brand-charcoal border-l border-brand-border ml-1"
                      title="Reset Zoom (100%)"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Fullscreen Toggle */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-lg border border-brand-border hover:bg-gray-50 text-brand-charcoal transition-colors"
                    title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Reading Mode'}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>

                  {/* Dedicated Reader Link */}
                  <Link
                    to="/epaper?lang=en"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-yellow text-brand-charcoal font-bold text-xs uppercase tracking-wider hover:bg-amber-300 transition-colors shadow-subtle"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Full Screen Reader</span>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    to="/archive"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-blue text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-900 transition-colors shadow-subtle"
                  >
                    <Archive className="w-4 h-4" />
                    <span>Browse Previous Papers</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Sandboxed Newspaper Iframe Display - Expanded Wide Broadsheet */}
            <div
              ref={broadsheetContainerRef}
              className="w-full bg-white border border-brand-border rounded-2xl shadow-2xl p-2 sm:p-4 overflow-hidden"
            >
              {editionLoading ? (
                <div className="py-32 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-brand-blue border-t-brand-green rounded-full animate-spin" />
                  <div className="text-center">
                    <h4 className="font-headline text-lg font-bold text-brand-charcoal">
                      Checking English Broadsheet Edition
                    </h4>
                    <p className="text-xs text-brand-muted mt-1">
                      Connecting to Neon PostgreSQL broadsheet repository...
                    </p>
                  </div>
                </div>
              ) : isTodayEdition && englishEdition ? (
                <div
                  className="w-full flex justify-center transition-transform duration-200 origin-top overflow-x-auto"
                  style={{
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'top center',
                  }}
                >
                  <div className="w-full min-h-[1100px] bg-white rounded border border-brand-border shadow-xl overflow-hidden">
                    {/*
                      CRITICAL REQUIREMENT:
                      Render stored HTML inside sandboxed iframe without allow-scripts to prevent execution.
                    */}
                    <iframe
                      srcDoc={englishEdition.html_content}
                      title={englishEdition.title}
                      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                      className="w-full h-[1400px] border-0 bg-white"
                      onLoad={(e) => {
                        try {
                          const doc = e.currentTarget.contentDocument;
                          if (doc) {
                            // Ensure black index/pages bar is completely hidden and removed
                            const hideStyle = doc.createElement('style');
                            hideStyle.innerHTML = '.index, nav.index, nav[aria-label="Pages"], .index .brand { display: none !important; }';
                            doc.head?.appendChild(hideStyle);
                            doc.querySelectorAll('nav.index, nav[aria-label="Pages"], .index').forEach((el) => el.remove());

                            doc.querySelectorAll('a').forEach((anchor) => {
                              const href = anchor.getAttribute('href');
                              if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
                                anchor.setAttribute('target', '_blank');
                                anchor.setAttribute('rel', 'noopener noreferrer');
                                anchor.onclick = (ev) => {
                                  ev.preventDefault();
                                  window.open(href, '_blank', 'noopener,noreferrer');
                                };
                              }
                            });
                          }
                        } catch (err) {
                          console.warn('Iframe doc access note:', err);
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                /* Authentic Editorial Not Yet Uploaded Presentation */
                <div className="py-16 sm:py-20 px-4 sm:px-8 text-center max-w-2xl mx-auto space-y-6">
                  {/* Status Pill */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-wider shadow-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                    <span>In Production</span>
                  </div>

                  {/* Graphic Icon */}
                  <div className="relative mx-auto w-20 h-20 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shadow-inner">
                    <BookOpen className="w-10 h-10 text-brand-blue" />
                    <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand-yellow border-2 border-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 text-brand-charcoal" />
                    </span>
                  </div>

                  {/* Primary Heading & Good Message */}
                  <div className="space-y-2">
                    <h3 className="font-headline text-2xl sm:text-3xl font-black text-brand-charcoal tracking-tight">
                      Today’s Paper Not Yet Uploaded
                    </h3>
                    <p className="text-sm font-semibold text-brand-charcoal">
                      Our editorial team is currently assembling and formatting today’s broadsheet edition.
                    </p>
                    <p className="text-xs text-brand-muted leading-relaxed max-w-md mx-auto">
                      Today's newspaper edition has not yet been uploaded. All previous editions have been archived and are available to read anytime in the Previous Papers section.
                    </p>
                  </div>

                  {/* Previous Edition highlight card */}
                  {latestPreviousEdition && (
                    <div className="p-4 rounded-xl bg-gray-50 border border-brand-border text-left flex items-center justify-between gap-4 max-w-md mx-auto">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-brand-muted block">
                          Latest Available Previous Edition
                        </span>
                        <span className="text-xs font-bold text-brand-charcoal block">
                          {formatPublicationDate(latestPreviousEdition.publication_date)}
                        </span>
                        <span className="text-[11px] text-brand-muted line-clamp-1">
                          {latestPreviousEdition.title}
                        </span>
                      </div>
                      <Link
                        to={`/epaper?lang=en&date=${latestPreviousEdition.publication_date}`}
                        className="px-3 py-1.5 rounded bg-brand-yellow text-brand-charcoal font-bold text-xs uppercase tracking-wider hover:bg-amber-300 transition-colors flex-shrink-0"
                      >
                        Read Paper →
                      </Link>
                    </div>
                  )}

                  {/* Action CTA Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Link
                      to="/archive"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-blue text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-900 transition-colors shadow-subtle group"
                    >
                      <Archive className="w-4 h-4" />
                      <span>Browse Previous Papers</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    {latestPreviousEdition && (
                      <Link
                        to={`/epaper?lang=en&date=${latestPreviousEdition.publication_date}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-brand-border text-brand-charcoal font-bold text-xs uppercase tracking-wider hover:bg-gray-100 transition-colors"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Read Previous Issue</span>
                      </Link>
                    )}
                  </div>

                  {/* Regional Editions Links */}
                  <div className="pt-3 border-t border-brand-border flex items-center justify-center gap-3 text-xs text-brand-muted flex-wrap">
                    <span>Previous regional broadsheets:</span>
                    <Link to="/epaper?lang=te" className="font-bold text-brand-blue hover:underline font-telugu">
                      తెలుగు మునుపటి పేపర్లు
                    </Link>
                    <span>•</span>
                    <Link to="/epaper?lang=hi" className="font-bold text-brand-blue hover:underline font-hindi">
                      हिंदी पिछले संस्करण
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Authentic Newspaper Story Popup Modal */}
      <ArticleStoryModal
        isOpen={!!selectedStoryArticle}
        onClose={() => setSelectedStoryArticle(null)}
        article={selectedStoryArticle}
      />

      {/* Public Footer */}
      <Footer />
    </div>
  );
};
export default Home;
