import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, ArrowRight, ExternalLink } from 'lucide-react';
import { Article } from '../../types';
import { newspaperService } from '../../services/newspaper';

interface ArticleStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article | null;
}

export const ArticleStoryModal: React.FC<ArticleStoryModalProps> = ({
  isOpen,
  onClose,
  article,
}) => {
  const navigate = useNavigate();
  const [currentArticle, setCurrentArticle] = useState<Article | null>(article);

  // Sync state and ensure full article content is loaded
  useEffect(() => {
    setCurrentArticle(article);
    if (article && (!article.content || article.content.trim().length === 0)) {
      newspaperService
        .getArticleBySlug(article.slug)
        .then((full) => setCurrentArticle(full))
        .catch((err) => console.warn('Could not load full article content:', err));
    }
  }, [article]);

  if (!isOpen || !currentArticle) return null;

  // Extract structured elements from the authentic newspaper cut content
  let kicker = '';
  let sectionTitle = currentArticle.category?.name || 'Rise ’n’ Shine Editorial';
  let sourcesText = '';
  let pageNum = 1;
  let sheetId = '';
  let paragraphs: string[] = [];

  const rawContent = currentArticle.content || '';

  if (rawContent.includes('newspaper-cut')) {
    const kickerMatch =
      rawContent.match(/data-kicker="([^"]*)"/) ||
      rawContent.match(/class="newspaper-cut-eyebrow">([^<]+)<\/p>/);
    if (kickerMatch && kickerMatch[1]) kicker = kickerMatch[1].trim();

    const sectionMatch =
      rawContent.match(/data-section="([^"]*)"/) ||
      rawContent.match(/class="newspaper-cut-section">([^<]+)<\/div>/);
    if (sectionMatch && sectionMatch[1]) sectionTitle = sectionMatch[1].trim();

    const sourcesMatch =
      rawContent.match(/data-sources="([^"]*)"/) ||
      rawContent.match(/class="sources-text">([^<]+)<\/span>/);
    if (sourcesMatch && sourcesMatch[1]) sourcesText = sourcesMatch[1].trim();

    const pageMatch = rawContent.match(/data-page="([^"]*)"/);
    if (pageMatch && pageMatch[1]) pageNum = parseInt(pageMatch[1], 10) || 1;

    const sheetMatch = rawContent.match(/data-sheet="([^"]*)"/);
    if (sheetMatch && sheetMatch[1]) sheetId = sheetMatch[1].trim();

    // Extract all <p>...</p> inside newspaper-cut-body
    const bodyMatch = rawContent.match(/<div class="newspaper-cut-body">([\s\S]*?)<\/div>/);
    if (bodyMatch) {
      const pMatches = bodyMatch[1].match(/<p>([\s\S]*?)<\/p>/g);
      if (pMatches) {
        paragraphs = pMatches
          .map((p) =>
            p
              .replace(/<[^>]+>/g, '')
              .replace(/&quot;/g, '"')
              .replace(/&amp;/g, '&')
              .replace(/&#39;/g, "'")
              .trim()
          )
          .filter(Boolean);
      }
    }
  }

  // Fallback if not HTML cut or if paragraphs are empty
  if (paragraphs.length === 0) {
    if (rawContent.includes('<p>')) {
      const pMatches = rawContent.match(/<p>([\s\S]*?)<\/p>/g);
      if (pMatches) {
        paragraphs = pMatches.map((p) => p.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
      }
    } else if (rawContent.trim()) {
      paragraphs = rawContent.split('\n\n').map((p) => p.trim()).filter(Boolean);
    }
  }

  if (paragraphs.length === 0 && currentArticle.description) {
    paragraphs = [currentArticle.description];
  }

  // Fallback kicker if not in HTML
  if (!kicker) {
    kicker = currentArticle.category?.name || 'Exclusive Broadsheet Cut';
  }

  // Fallback sources line if empty
  if (!sourcesText) {
    sourcesText = 'Official Broadsheet Correspondent Network';
  }

  // Drop cap on first paragraph
  const firstParagraph = paragraphs[0] || '';
  const dropCapLetter = firstParagraph.charAt(0) || 'T';
  const restOfFirstParagraph = firstParagraph.slice(1);

  // Decide layout: 2 columns if 2+ paragraphs, single column if short brief
  const isMultiParagraph = paragraphs.length > 1;
  const half = Math.ceil(paragraphs.length / 2);
  const leftColParas = isMultiParagraph ? paragraphs.slice(0, half) : paragraphs;
  const rightColParas = isMultiParagraph ? paragraphs.slice(half) : [];

  // Destination URL to the exact newspaper broadsheet page
  const editionDate =
    currentArticle.edition?.publication_date ||
    (currentArticle.created_at ? currentArticle.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10));
  const epaperUrl = `/epaper?lang=${currentArticle.language}&date=${editionDate}&page=${pageNum}${
    sheetId ? `&sheet=${sheetId}` : ''
  }`;

  const handleReadFullInPaper = () => {
    onClose();
    navigate(epaperUrl);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs"
        />

        {/* Authentic Newspaper Cut Modal (Direct Broadsheet Clipping Replica) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative bg-[#FAFAFA] border-2 border-brand-charcoal rounded-none shadow-2xl max-w-4xl w-full my-8 z-10 overflow-hidden font-serif text-[#1C1C1C] select-text"
        >
          {/* Top Action Bar (Close & Open in Paper Button) */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            <button
              onClick={handleReadFullInPaper}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-black hover:bg-brand-blue text-white text-xs font-sans font-bold uppercase tracking-wider transition-colors shadow-sm"
              title={`Open Page ${pageNum} in Full Newspaper Reader`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Read in Paper (Page {pageNum})</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 hover:text-black hover:bg-gray-200 transition-colors"
              title="Close Newspaper Cut"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Newspaper Paper Container */}
          <div className="p-6 sm:p-10 max-h-[88vh] overflow-y-auto bg-white border border-[#E5E5E5] m-2 shadow-inner">
            {/* 1. SECTION HEADER WITH DOUBLE HORIZONTAL RULE (Just like Image 2) */}
            <div className="border-b-[3px] border-double border-black pb-1 mb-4 flex items-baseline justify-between pr-24 sm:pr-48">
              <h2 className="font-headline text-2xl sm:text-4xl font-black text-black tracking-tight uppercase">
                {sectionTitle}
              </h2>
              <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#777777] hidden md:inline">
                Page {pageNum} · Authentic Newspaper Cut
              </span>
            </div>

            {/* 2. KICKER / EYEBROW IN BOLD RED (Just like Image 2) */}
            {kicker && (
              <p className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#b91c1c] mb-1.5 font-sans">
                {kicker}
              </p>
            )}

            {/* 3. MAIN STORY HEADLINE (Just like Image 2) */}
            <h1 className="font-headline text-2xl sm:text-3xl lg:text-[38px] font-black text-black leading-[1.14] tracking-tight mb-3">
              {currentArticle.title}
            </h1>

            {/* 4. SUBDECK / DECK IN ITALICS (Just like Image 2) */}
            {currentArticle.description && (
              <h3 className="text-base sm:text-lg font-serif italic text-[#444444] leading-relaxed mb-6 font-normal">
                {currentArticle.description}
              </h3>
            )}

            {/* 5. BODY PARAGRAPHS LAYOUT WITH LARGE DROP CAP (Just like Image 2) */}
            {isMultiParagraph ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[15px] sm:text-[15.5px] font-serif leading-[1.75] text-justify text-[#222222]">
                {/* Left Column */}
                <div className="space-y-4 md:pr-4 md:border-r border-gray-200">
                  {leftColParas.map((p, idx) => {
                    if (idx === 0) {
                      return (
                        <p key={idx}>
                          <span className="float-left text-5xl sm:text-6xl font-serif font-black pr-2.5 pt-1 text-black leading-none select-none">
                            {dropCapLetter}
                          </span>
                          {restOfFirstParagraph}
                        </p>
                      );
                    }
                    return (
                      <p
                        key={idx}
                        dangerouslySetInnerHTML={{
                          __html: p.replace(/(The lesson:)/gi, '<strong>$1</strong>'),
                        }}
                      />
                    );
                  })}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {rightColParas.map((p, idx) => (
                    <p
                      key={`r-${idx}`}
                      dangerouslySetInnerHTML={{
                        __html: p.replace(/(The lesson:)/gi, '<strong>$1</strong>'),
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* Single column layout when story is a concise news brief */
              <div className="text-[15px] sm:text-[16px] font-serif leading-[1.8] text-justify text-[#222222] max-w-2xl">
                <p>
                  <span className="float-left text-5xl sm:text-6xl font-serif font-black pr-2.5 pt-1 text-black leading-none select-none">
                    {dropCapLetter}
                  </span>
                  {restOfFirstParagraph}
                </p>
              </div>
            )}

            {/* 6. SOURCES & REPORTED BADGE FOOTER (Just like Image 2) */}
            <div className="mt-8 pt-3 border-t border-black flex flex-wrap items-center justify-between gap-3 text-xs font-sans text-[#444444]">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-black">Sources:</span>
                <span className="text-[#333333]">
                  {sourcesText.replace(/^sources:\s*/i, '')}
                </span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#b91c1c] border border-[#b91c1c] bg-red-50/40">
                REPORTED
              </span>
            </div>

            {/* 7. "READ MORE" REDIRECT CALL TO ACTION TO OFFICIAL NEWSPAPER PAGE */}
            <div className="mt-8 p-4 sm:p-5 bg-[#F9F9F7] border-2 border-black rounded flex flex-col sm:flex-row items-center justify-between gap-4 select-none shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-black text-white flex flex-col items-center justify-center font-bold text-xs shrink-0 font-sans shadow-sm">
                  <span className="text-[9px] uppercase tracking-wider text-gray-300">PAGE</span>
                  <span className="text-base leading-none font-black">{pageNum}</span>
                </div>
                <div>
                  <h4 className="font-headline font-bold text-base text-black flex items-center gap-2">
                    <span>Read Full News in Newspaper Broadsheet</span>
                    <span className="text-xs font-sans font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Page {pageNum}
                    </span>
                  </h4>
                  <p className="text-xs text-gray-600 font-sans mt-0.5">
                    Click to jump directly to this article on the actual newspaper page with full columns, diagrams, and surrounding coverage.
                  </p>
                </div>
              </div>

              <button
                onClick={handleReadFullInPaper}
                className="w-full sm:w-auto px-6 py-3 bg-black hover:bg-brand-blue text-white font-sans font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 shadow shrink-0 group"
              >
                <span>Read Full Story</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ArticleStoryModal;