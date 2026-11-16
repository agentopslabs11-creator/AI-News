import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Calendar,
  Globe,
  Share2,
  Printer,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { RiseShineLogo } from '../components/common/RiseShineLogo';
import { LanguageBadge } from '../components/common/LanguageBadge';
import { newspaperService } from '../services/newspaper';
import { NewspaperEdition, NewspaperEditionDetail, LanguageCode } from '../types';
import { isTodayDate } from '../utils/date';

export const EpaperReader: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const langParam = (searchParams.get('lang') as LanguageCode) || 'en';
  const dateParam = searchParams.get('date');

  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(langParam);
  const [edition, setEdition] = useState<NewspaperEditionDetail | null>(null);
  const [allEditions, setAllEditions] = useState<NewspaperEdition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Zoom & Display Controls
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const readerContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const sheetParam = searchParams.get('sheet');
  const pageParam = searchParams.get('page');

  // Fetch editions list for navigation (previous/next)
  useEffect(() => {
    async function loadEditionsList() {
      try {
        const list = await newspaperService.getPublishedEditions(currentLanguage, 50);
        setAllEditions(list);
      } catch (err) {
        console.error('Failed to load editions list:', err);
      }
    }
    loadEditionsList();
  }, [currentLanguage]);

  // Fetch specific edition content
  useEffect(() => {
    async function loadCurrentEdition() {
      try {
        setLoading(true);
        setError(null);

        let data: NewspaperEditionDetail;
        if (dateParam) {
          data = await newspaperService.getEditionByDate(currentLanguage, dateParam);
        } else {
          data = await newspaperService.getLatestEdition(currentLanguage);
          // Update URL without reload to reflect publication date while preserving page/sheet params
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('lang', currentLanguage);
            next.set('date', data.publication_date);
            return next;
          }, { replace: true });
        }
        setEdition(data);
      } catch (err: any) {
        setError(
          err.response?.data?.detail ||
          `No published newspaper edition found for ${currentLanguage.toUpperCase()} on this date.`
        );
        setEdition(null);
      } finally {
        setLoading(false);
      }
    }
    loadCurrentEdition();
  }, [currentLanguage, dateParam, setSearchParams]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!readerContainerRef.current) return;
    if (!document.fullscreenElement) {
      readerContainerRef.current.requestFullscreen().catch((err) => {
        console.error(`Fullscreen request error: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Zoom functions
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 180));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 60));
  const handleZoomReset = () => setZoomLevel(100);

  // Navigation between sequential editions
  const currentIndex = allEditions.findIndex((e) => e.publication_date === edition?.publication_date);
  const prevEdition = currentIndex > 0 ? allEditions[currentIndex - 1] : null;
  const nextEdition = currentIndex >= 0 && currentIndex < allEditions.length - 1 ? allEditions[currentIndex + 1] : null;

  const navigateToEdition = (ed: NewspaperEdition) => {
    setSearchParams({ lang: ed.language, date: ed.publication_date });
  };

  const handleLanguageChange = (lang: LanguageCode) => {
    setCurrentLanguage(lang);
    setSearchParams({ lang });
  };

  return (
    <div 
      ref={readerContainerRef} 
      className="min-h-screen bg-white text-brand-charcoal flex flex-col font-sans select-none"
    >
      {/* Reader Control Header Bar */}
      <header className="bg-white border-b border-brand-border sticky top-0 z-30 px-2.5 sm:px-6 py-2 sm:py-3 shadow-subtle flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        {/* Left: Back to Homepage & Brand Logo */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-brand-border hover:bg-gray-50 text-xs font-bold text-brand-charcoal transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Home</span>
          </Link>

          <RiseShineLogo size="sm" linkToHome={false} />
        </div>

        {/* Center: Date Navigation only — language fixed by URL param */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sequential Prev/Next Edition Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => nextEdition && navigateToEdition(nextEdition)}
              disabled={!nextEdition}
              className={`p-1 sm:p-1.5 rounded border border-brand-border ${
                nextEdition ? 'text-brand-charcoal hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'
              }`}
              title="Next Older Edition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-bold bg-white border border-brand-border rounded">
              <Calendar className="w-3.5 h-3.5 text-brand-blue" />
              <span>{edition ? edition.publication_date : (dateParam || new Date().toISOString().split('T')[0])}</span>
            </div>

            <button
              onClick={() => prevEdition && navigateToEdition(prevEdition)}
              disabled={!prevEdition}
              className={`p-1 sm:p-1.5 rounded border border-brand-border ${
                prevEdition ? 'text-brand-charcoal hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'
              }`}
              title="Previous Newer Edition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Zoom & Fullscreen Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-gray-50 border border-brand-border rounded-lg p-0.5">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded hover:bg-gray-200 text-brand-charcoal"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-xs font-mono font-bold text-brand-charcoal min-w-[48px] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded hover:bg-gray-200 text-brand-charcoal"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomReset}
              className="p-1.5 rounded hover:bg-gray-200 text-brand-charcoal border-l border-brand-border"
              title="Reset Zoom (100%)"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 rounded-lg border border-brand-border hover:bg-gray-50 text-brand-charcoal"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Reading Mode'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Reader Body / Sandboxed Iframe Display */}
      <main className="flex-1 bg-white overflow-auto flex flex-col items-center justify-start p-1 sm:p-4 md:p-8">
        {loading ? (
          <div className="my-auto py-24 flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-brand-blue border-t-brand-green rounded-full animate-spin" />
            <div className="text-center">
              <h4 className="font-headline text-lg font-bold text-brand-charcoal">
                Loading Newspaper Broadsheet
              </h4>
              <p className="text-xs text-brand-muted mt-1">
                Validating security sandbox and rendering authentic typography...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="my-auto py-16 max-w-lg text-center p-8 border border-brand-border rounded-2xl bg-gray-50/80 shadow-subtle">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="font-headline text-2xl font-black text-brand-charcoal mb-2">
              {(!dateParam || isTodayDate(dateParam))
                ? 'Today’s Edition Not Yet Uploaded'
                : 'Edition Not Found'}
            </h3>
            <p className="text-xs sm:text-sm text-brand-muted mb-6 leading-relaxed max-w-md mx-auto">
              {(!dateParam || isTodayDate(dateParam))
                ? 'Today’s broadsheet edition has not yet been uploaded. Our editorial desk is preparing today’s publication. In the meantime, you can read all previous editions in the Previous Papers section.'
                : error}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/archive"
                className="px-5 py-2.5 rounded-lg bg-brand-blue text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-900 transition-colors shadow-subtle"
              >
                Browse Previous Papers
              </Link>
              <Link
                to="/"
                className="px-5 py-2.5 rounded-lg border border-brand-border bg-white text-xs font-bold text-brand-charcoal hover:bg-gray-100 transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : edition ? (
          <div className="w-full flex flex-col items-center">
            {/* Edition Info Meta Strip */}
            <div className="w-full mb-4 px-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-brand-muted gap-2 border-b border-brand-border pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-brand-charcoal">{edition.title}</span>
                <LanguageBadge language={edition.language} size="sm" />
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Secure HTML Sandbox</span>
                </span>
                <span>Size: {(edition.content_size / 1024).toFixed(1)} KB</span>
              </div>
            </div>

            {/* Sandboxed Iframe Container with Scale Zoom - Expanded Wide Broadsheet */}
            <div
              className="w-full flex justify-center transition-all duration-200 origin-top"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
              }}
            >
              <div className="w-full min-h-[1100px] bg-white rounded border border-brand-border shadow-2xl overflow-hidden">
                {/* 
                  CRITICAL SECURITY REQUIREMENT:
                  - Stored HTML is rendered inside a sandboxed iframe using srcDoc.
                  - sandbox="allow-same-origin" without allow-scripts prevents script execution.
                  - Sanitized on backend via BeautifulSoup4 explicit allowlist.
                  - Does not render directly into main application DOM!
                */}
                <iframe
                  ref={iframeRef}
                  title={`Rise ’n’ Shine Edition - ${edition.title}`}
                  srcDoc={edition.html_content}
                  sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                  className="w-full border-0 bg-white min-h-[900px]"
                  style={{ width: '100%', minHeight: '900px' }}
                  onLoad={(e) => {
                    try {
                      const doc = e.currentTarget.contentDocument;
                      if (doc) {
                        // 1. Inject responsive viewport meta tag
                        let meta = doc.querySelector('meta[name="viewport"]');
                        if (!meta) {
                          meta = doc.createElement('meta');
                          meta.setAttribute('name', 'viewport');
                          meta.setAttribute('content', 'width=device-width, initial-scale=1.0');
                          doc.head?.appendChild(meta);
                        }

                        // 2. Inject responsive CSS overrides for seamless mobile fit
                        const respStyle = doc.createElement('style');
                        respStyle.innerHTML = `
                          .index, nav.index, nav[aria-label="Pages"], .index .brand, .wrap > a.brand { display: none !important; }
                          html, body {
                            width: 100% !important;
                            max-width: 100vw !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            overflow-x: hidden !important;
                            -webkit-text-size-adjust: 100%;
                          }
                          .wrap {
                            width: 100% !important;
                            max-width: 100% !important;
                            padding-left: 10px !important;
                            padding-right: 10px !important;
                            box-sizing: border-box !important;
                          }
                          .sheet {
                            width: 100% !important;
                            max-width: 100% !important;
                            margin-left: 0 !important;
                            margin-right: 0 !important;
                            box-sizing: border-box !important;
                            overflow-x: hidden !important;
                          }
                          @media (max-width: 768px) {
                            .mast {
                              display: flex !important;
                              flex-direction: column !important;
                              align-items: center !important;
                              text-align: center !important;
                              gap: 10px !important;
                              padding: 12px 6px !important;
                            }
                            .ceos.left, .ceos.right {
                              display: flex !important;
                              flex-wrap: wrap !important;
                              justify-content: center !important;
                              gap: 6px !important;
                            }
                            .title-block h1 {
                              font-size: clamp(26px, 7vw, 42px) !important;
                              line-height: 1.1 !important;
                            }
                            .lead-grid, .two, .three, .jobs, .figures {
                              display: flex !important;
                              flex-direction: column !important;
                              width: 100% !important;
                            }
                            .three.col-rule > *, .col-rule > * {
                              border-left: none !important;
                              border-top: 1px solid var(--rule, #c9ccd1) !important;
                              padding-left: 0 !important;
                              padding-top: 12px !important;
                            }
                            img {
                              max-width: 100% !important;
                              height: auto !important;
                            }
                            table {
                              display: block !important;
                              width: 100% !important;
                              overflow-x: auto !important;
                            }
                          }
                        `;
                        doc.head?.appendChild(respStyle);
                        doc.querySelectorAll('nav.index, nav[aria-label="Pages"], .index').forEach((el) => el.remove());

                        // 3. Dynamic height adjustment to avoid nested scrollbars on mobile
                        const iframeEl = e.currentTarget;
                        const updateHeight = () => {
                          try {
                            if (doc && doc.body) {
                              const contentHeight = Math.max(
                                doc.body.scrollHeight,
                                doc.documentElement.scrollHeight
                              );
                              if (contentHeight > 400) {
                                iframeEl.style.height = `${contentHeight + 30}px`;
                              }
                            }
                          } catch {}
                        };
                        updateHeight();
                        setTimeout(updateHeight, 400);
                        setTimeout(updateHeight, 1200);

                        // 4. Ensure all external links open safely in new tabs
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

                        // 5. Automatically scroll to the exact sheet/page if requested
                        const scrollToSheet = () => {
                          let targetEl: HTMLElement | null = null;
                          if (sheetParam) {
                            targetEl = doc.getElementById(sheetParam);
                          }
                          if (!targetEl && pageParam) {
                            const pNum = parseInt(pageParam, 10);
                            const sheets = doc.querySelectorAll('.sheet');
                            if (!isNaN(pNum) && pNum >= 1 && pNum <= sheets.length) {
                              targetEl = sheets[pNum - 1] as HTMLElement;
                            }
                          }
                          if (targetEl) {
                            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            targetEl.style.transition = 'box-shadow 0.6s ease';
                            targetEl.style.boxShadow = '0 0 0 4px #2563eb';
                            setTimeout(() => {
                              if (targetEl) targetEl.style.boxShadow = '';
                            }, 3000);
                          }
                        };
                        setTimeout(scrollToSheet, 200);
                        setTimeout(scrollToSheet, 600);
                      }
                    } catch (err) {
                      console.warn('Iframe doc access note:', err);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};
