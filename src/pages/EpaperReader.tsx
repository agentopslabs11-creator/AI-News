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
  AlertCircle,
  Clock,
  Sparkles,
  BookOpen,
  Archive,
  Download,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { RiseShineLogo } from '../components/common/RiseShineLogo';
import { LanguageBadge } from '../components/common/LanguageBadge';
import { newspaperService } from '../services/newspaper';
import { NewspaperEdition, NewspaperEditionDetail, LanguageCode } from '../types';
import { isTodayDate, formatPublicationDate } from '../utils/date';

export const EpaperReader: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const langParam = (searchParams.get('lang') as LanguageCode) || 'en';
  const dateParam = searchParams.get('date');

  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(langParam);
  const [edition, setEdition] = useState<NewspaperEditionDetail | null>(null);
  const [latestPreviousEdition, setLatestPreviousEdition] = useState<NewspaperEditionDetail | null>(null);
  const [isTodayEdition, setIsTodayEdition] = useState<boolean>(false);
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

  // Keep currentLanguage in sync with URL
  useEffect(() => {
    if (langParam && langParam !== currentLanguage) {
      setCurrentLanguage(langParam);
    }
  }, [langParam, currentLanguage]);

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

        if (dateParam) {
          // Explicit date requested (e.g. from archive, previous papers, or clicking "Read Previous Edition")
          const data = await newspaperService.getEditionByDate(currentLanguage, dateParam);
          setEdition(data);
          setIsTodayEdition(isTodayDate(data.publication_date));
          setLatestPreviousEdition(null);
        } else {
          // No date param: user requested current/today's edition for this language (e.g. clicking "తెలుగు" or "हिंदी")
          try {
            const data = await newspaperService.getLatestEdition(currentLanguage);
            const isToday = isTodayDate(data.publication_date);
            if (isToday) {
              setEdition(data);
              setIsTodayEdition(true);
              setLatestPreviousEdition(null);
              // Update URL without reload to reflect publication date
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set('lang', currentLanguage);
                next.set('date', data.publication_date);
                return next;
              }, { replace: true });
            } else {
              // Not today's edition! Today's paper is not yet published/uploaded!
              setEdition(null);
              setIsTodayEdition(false);
              setLatestPreviousEdition(data);
            }
          } catch {
            setEdition(null);
            setIsTodayEdition(false);
            setLatestPreviousEdition(null);
          }
        }
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

  const isPdf = Boolean(
    edition?.original_filename?.toLowerCase().endsWith('.pdf') ||
    edition?.html_content?.includes('application/pdf') ||
    edition?.html_content?.includes('/pdf')
  );

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

        {/* Center: Date Navigation */}
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

        {/* Right: PDF download, Zoom & Fullscreen Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Download PDF button if PDF edition */}
          {isPdf && edition && (
            <a
              href={`/api/public/editions/${edition.id}/pdf`}
              download={`${edition.language}_${edition.publication_date}.pdf`}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-subtle"
              title="Download PDF Broadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
            </a>
          )}

          {isPdf && edition && (
            <a
              href={`/api/public/editions/${edition.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 sm:p-2 rounded-lg border border-brand-border hover:bg-gray-50 text-brand-charcoal"
              title="Open PDF in Full Screen"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {/* Zoom controls (hidden for PDF since browser has native controls) */}
          {!isPdf && (
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
          )}

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

      {/* Reader Body */}
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
        ) : edition ? (
          <div className="w-full flex flex-col items-center">
            {/* Edition Info Meta Strip */}
            <div className="w-full mb-4 px-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-brand-muted gap-2 border-b border-brand-border pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-brand-charcoal">{edition.title}</span>
                <LanguageBadge language={edition.language} size="sm" />
                {isPdf && (
                  <span className="text-[10px] font-black uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    PDF Broadsheet
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {isPdf ? (
                  <a
                    href={`/api/public/editions/${edition.id}/pdf`}
                    download
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF ({((edition.content_size || 0) / 1024).toFixed(1)} KB)</span>
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Secure HTML Sandbox</span>
                  </span>
                )}
                <span>Size: {((edition.content_size || 0) / 1024).toFixed(1)} KB</span>
              </div>
            </div>

            {/* Viewer: PDF iframe OR Scaled Sandboxed HTML Broadsheet */}
            {isPdf ? (
              <div className="w-full min-h-[920px] h-[calc(100vh-140px)] bg-white rounded border border-brand-border shadow-2xl overflow-hidden">
                <iframe
                  src={`/api/public/editions/${edition.id}/pdf#toolbar=1&navpanes=1`}
                  title={`PDF Broadsheet - ${edition.title}`}
                  className="w-full h-full border-0 bg-gray-100"
                />
              </div>
            ) : (
              <div
                className="w-full flex justify-center transition-all duration-200 origin-top"
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top center',
                }}
              >
                <div className="w-full min-h-[1100px] bg-white rounded border border-brand-border shadow-2xl overflow-hidden">
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
            )}
          </div>
        ) : (
          /* LOCALIZED "TODAY'S PAPER NOT YET UPLOADED / PUBLISHED" PRESENTATION */
          <div className="my-auto py-12 sm:py-16 max-w-xl w-full text-center p-6 sm:p-10 border border-brand-border rounded-2xl bg-white shadow-subtle space-y-6">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-wider shadow-xs">
              <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
              <span>
                {currentLanguage === 'te'
                  ? 'ఎడిటోరియల్ పనిలో ఉంది'
                  : currentLanguage === 'hi'
                  ? 'संपादन प्रगति पर है'
                  : 'In Production'}
              </span>
            </div>

            {/* Graphic Icon */}
            <div className="relative mx-auto w-20 h-20 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shadow-inner">
              <BookOpen className="w-10 h-10 text-brand-blue" />
              <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand-yellow border-2 border-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-brand-charcoal" />
              </span>
            </div>

            {/* Localized Headings */}
            <div className="space-y-2">
              <h3 className={`font-headline text-2xl sm:text-3xl font-black text-brand-charcoal tracking-tight ${
                currentLanguage === 'te' ? 'font-telugu' : currentLanguage === 'hi' ? 'font-hindi' : ''
              }`}>
                {currentLanguage === 'te'
                  ? 'నేటి తెలుగు దినపత్రిక ఇంకా విడుదల కాలేదు'
                  : currentLanguage === 'hi'
                  ? 'आज का हिंदी समाचार पत्र अभी प्रकाशित नहीं हुआ है'
                  : 'Today’s Paper Not Yet Uploaded'}
              </h3>
              <p className={`text-sm font-semibold text-brand-charcoal ${
                currentLanguage === 'te' ? 'font-telugu' : currentLanguage === 'hi' ? 'font-hindi' : ''
              }`}>
                {currentLanguage === 'te'
                  ? 'మా ఎడిటోరియల్ బృందం నేటి సంచికను సిద్ధం చేస్తోంది. త్వరలోనే అప్‌లోడ్ చేయబడుతుంది.'
                  : currentLanguage === 'hi'
                  ? 'हमारी संपादकीय टीम आज के संस्करण पर कार्य कर रही है। शीघ्र ही अपलोड किया जाएगा।'
                  : 'Our editorial desk is actively preparing and formatting today’s broadsheet edition.'}
              </p>
              <p className={`text-xs text-brand-muted leading-relaxed max-w-md mx-auto ${
                currentLanguage === 'te' ? 'font-telugu' : currentLanguage === 'hi' ? 'font-hindi' : ''
              }`}>
                {currentLanguage === 'te'
                  ? 'ఈ రోజు వార్తాపత్రిక ఇంకా అప్‌లోడ్ కాలేదు. గత సంచికలను చదవడానికి క్రింది బటన్ ఉపయోగించండి లేదా మునుపటి పత్రికల ఆర్కైవ్ చూడండి.'
                  : currentLanguage === 'hi'
                  ? 'आज का समाचार पत्र अभी तक अपलोड नहीं हुआ है। पिछले सभी संस्करण पुराने समाचार पत्र अनुभाग में उपलब्ध हैं।'
                  : 'Today’s broadsheet edition has not yet been uploaded. All previous editions have been archived and are available to read anytime in the Previous Papers section.'}
              </p>
            </div>

            {/* Previous Edition Quick Link Card */}
            {latestPreviousEdition && (
              <div className="p-4 rounded-xl bg-gray-50 border border-brand-border text-left flex items-center justify-between gap-4 max-w-md mx-auto">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-muted block">
                    {currentLanguage === 'te'
                      ? 'మునుపటి లభ్యమైన సంచిక'
                      : currentLanguage === 'hi'
                      ? 'पिछला उपलब्ध संस्करण'
                      : 'Latest Available Previous Edition'}
                  </span>
                  <span className="text-xs font-bold text-brand-charcoal block">
                    {formatPublicationDate(latestPreviousEdition.publication_date)}
                  </span>
                  <span className="text-[11px] text-brand-muted line-clamp-1">
                    {latestPreviousEdition.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigateToEdition(latestPreviousEdition)}
                  className="px-3 py-1.5 rounded bg-brand-yellow text-brand-charcoal font-bold text-xs uppercase tracking-wider hover:bg-amber-300 transition-colors flex-shrink-0"
                >
                  {currentLanguage === 'te'
                    ? 'మునుపటి సంచిక చదవండి →'
                    : currentLanguage === 'hi'
                    ? 'पिछला संस्करण पढ़ें →'
                    : 'Read Previous Edition →'}
                </button>
              </div>
            )}

            {/* Navigation CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to={`/archive?lang=${currentLanguage}`}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-brand-blue text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-900 transition-colors shadow-subtle flex items-center justify-center gap-2"
              >
                <Archive className="w-4 h-4" />
                <span>
                  {currentLanguage === 'te'
                    ? 'మునుపటి పత్రికలు (ఆర్కైవ్)'
                    : currentLanguage === 'hi'
                    ? 'पुराने समाचार पत्र (आर्काइव)'
                    : 'Browse Previous Papers'}
                </span>
              </Link>
              <Link
                to="/"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-brand-border bg-white text-xs font-bold text-brand-charcoal hover:bg-gray-100 transition-colors text-center"
              >
                {currentLanguage === 'te'
                  ? 'హోమ్ పేజీకి వెళ్లండి'
                  : currentLanguage === 'hi'
                  ? 'मुख्य पृष्ठ पर लौटें'
                  : 'Return to Home'}
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
