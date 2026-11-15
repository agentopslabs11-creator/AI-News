import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Navigation } from '../components/layout/Navigation';
import { Footer } from '../components/layout/Footer';
import { NewsCard } from '../components/newspaper/NewsCard';
import { NewsCardSkeleton } from '../components/common/Skeleton';
import { ArticleStoryModal } from '../components/newspaper/ArticleStoryModal';
import { newspaperService } from '../services/newspaper';
import { Article, Category, LanguageCode } from '../types';

export const LatestNews: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInitial = searchParams.get('search') || '';
  // Default to English ('en') so entering Latest News strictly shows English news
  const langInitial = (searchParams.get('lang') as LanguageCode) || 'en';
  const slugInitial = searchParams.get('slug') || '';

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(langInitial);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>(searchInitial);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 12;

  // Selected article for authentic newspaper story popup
  const [selectedStoryArticle, setSelectedStoryArticle] = useState<Article | null>(null);

  // Load Categories on mount
  useEffect(() => {
    newspaperService.getCategories().then(setCategories).catch(console.error);
  }, []);

  // Fetch articles on filter change - strictly queries the selected language
  useEffect(() => {
    async function loadArticles() {
      try {
        setLoading(true);
        setOffset(0);
        const data = await newspaperService.getArticles({
          language: (selectedLanguage as LanguageCode) || undefined,
          category_slug: selectedCategory || undefined,
          search: searchTerm || undefined,
          limit: LIMIT,
          offset: 0,
        });
        setArticles(data);
        setHasMore(data.length === LIMIT);

        // If URL has a specific slug, auto-open the story popup modal
        if (slugInitial) {
          const match = data.find((a) => a.slug === slugInitial);
          if (match) {
            setSelectedStoryArticle(match);
          }
        }
      } catch (err) {
        console.error('Failed to load articles:', err);
      } finally {
        setLoading(false);
      }
    }
    loadArticles();
  }, [selectedLanguage, selectedCategory, searchTerm, slugInitial]);

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    const newParams = new URLSearchParams(searchParams);
    if (lang) {
      newParams.set('lang', lang);
    } else {
      newParams.delete('lang');
    }
    setSearchParams(newParams);
  };

  // Load More handler
  const handleLoadMore = async () => {
    try {
      setLoadingMore(true);
      const nextOffset = offset + LIMIT;
      const more = await newspaperService.getArticles({
        language: (selectedLanguage as LanguageCode) || undefined,
        category_slug: selectedCategory || undefined,
        search: searchTerm || undefined,
        limit: LIMIT,
        offset: nextOffset,
      });
      setArticles((prev) => [...prev, ...more]);
      setOffset(nextOffset);
      setHasMore(more.length === LIMIT);
    } catch (err) {
      console.error('Failed to load more articles:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Strictly enforce language isolation on the client display list as well
  const displayedArticles = selectedLanguage
    ? articles.filter((a) => a.language === selectedLanguage)
    : articles;

  return (
    <div className="min-h-screen bg-white text-brand-charcoal flex flex-col font-sans">
      <Header
        mobileNavOpen={mobileNavOpen}
        onToggleMobileNav={() => setMobileNavOpen(!mobileNavOpen)}
      />
      <Navigation
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <main className="flex-1 w-full px-4 sm:px-8 py-8">
        {/* Page Title & Search Bar */}
        <div className="border-b border-brand-border pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-brand-blue">
              Real-Time Multilingual Publishing
            </span>
            <h1 className="font-headline text-3xl sm:text-4xl font-black text-brand-charcoal tracking-tight mt-1">
              Latest News Wire
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted mt-2">
              Combined editorial dispatches from English, Telugu, and Hindi publishing desks.
            </p>
          </div>

          {/* Search Input Box */}
          <div className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search headlines, keywords, or topics..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-brand-border rounded-lg outline-none focus:border-brand-blue bg-white"
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-3 py-2 text-xs font-semibold text-brand-muted hover:text-brand-charcoal"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter Toolbar: Language & Category Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-brand-border text-xs">
          {/* Language filter pills with exclusive single-language filtering */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-brand-muted mr-1 uppercase text-[10px] tracking-wider">
              Edition Desk:
            </span>
            <button
              onClick={() => handleLanguageChange('en')}
              className={`px-3.5 py-1 rounded-full font-bold transition-all ${
                selectedLanguage === 'en'
                  ? 'bg-brand-blue text-white shadow-sm ring-2 ring-brand-blue/30'
                  : 'bg-gray-100 text-brand-charcoal hover:bg-gray-200'
              }`}
            >
              English News Only
            </button>
            <button
              onClick={() => handleLanguageChange('te')}
              className={`px-3.5 py-1 rounded-full font-bold transition-all font-telugu ${
                selectedLanguage === 'te'
                  ? 'bg-brand-green text-brand-charcoal shadow-sm ring-2 ring-lime-400'
                  : 'bg-gray-100 text-brand-charcoal hover:bg-gray-200'
              }`}
            >
              తెలుగు వార్తలు
            </button>
            <button
              onClick={() => handleLanguageChange('hi')}
              className={`px-3.5 py-1 rounded-full font-bold transition-all font-hindi ${
                selectedLanguage === 'hi'
                  ? 'bg-brand-yellow text-brand-charcoal shadow-sm ring-2 ring-amber-400'
                  : 'bg-gray-100 text-brand-charcoal hover:bg-gray-200'
              }`}
            >
              हिंदी समाचार
            </button>
            <button
              onClick={() => handleLanguageChange('')}
              className={`px-3 py-1 rounded-full font-bold transition-all text-xs ${
                selectedLanguage === ''
                  ? 'bg-brand-charcoal text-white shadow-sm'
                  : 'bg-gray-100 text-brand-muted hover:bg-gray-200'
              }`}
            >
              All Combined
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-brand-muted text-[10px] uppercase tracking-wider">
              Category:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs px-3 py-1.5 border border-brand-border rounded-lg bg-white outline-none focus:border-brand-blue font-medium"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <NewsCardSkeleton key={n} />
            ))}
          </div>
        ) : displayedArticles.length > 0 ? (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedArticles.map((article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  onArticleClick={(art) => setSelectedStoryArticle(art)}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-brand-blue text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-800 transition-colors shadow-subtle disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Loading More Dispatches...</span>
                    </>
                  ) : (
                    <span>Load More Stories</span>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-16 text-center border border-brand-border rounded-xl bg-gray-50/50">
            <h3 className="font-headline text-xl font-bold text-brand-charcoal mb-2">
              No matching news articles found
            </h3>
            <p className="text-xs text-brand-muted max-w-sm mx-auto mb-4">
              Try adjusting your search query, selecting another language desk, or browsing all categories.
            </p>
            <button
              onClick={() => {
                setSelectedLanguage('');
                setSelectedCategory('');
                setSearchTerm('');
              }}
              className="px-4 py-2 bg-brand-blue text-white text-xs font-bold rounded-lg uppercase tracking-wider"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </main>

      {/* Authentic Newspaper Story Popup Modal */}
      <ArticleStoryModal
        isOpen={!!selectedStoryArticle}
        onClose={() => setSelectedStoryArticle(null)}
        article={selectedStoryArticle}
      />

      <Footer />
    </div>
  );
};
