import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, ArrowRight, Filter } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Navigation } from '../components/layout/Navigation';
import { Footer } from '../components/layout/Footer';
import { NewsCard } from '../components/newspaper/NewsCard';
import { NewsCardSkeleton } from '../components/common/Skeleton';
import { newspaperService } from '../services/newspaper';
import { Article, NewspaperEdition, Category } from '../types';

export const EnglishEdition: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [latestEdition, setLatestEdition] = useState<NewspaperEdition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [arts, cats, editions] = await Promise.all([
          newspaperService.getArticles({
            language: 'en',
            category_slug: selectedCategory || undefined,
            limit: 12,
          }),
          newspaperService.getCategories('en'),
          newspaperService.getPublishedEditions('en', 1),
        ]);
        setArticles(arts);
        setCategories(cats);
        if (editions.length > 0) setLatestEdition(editions[0]);
      } catch (err) {
        console.error('Failed to load English edition:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedCategory]);

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
        {/* Edition Header Banner */}
        <div className="border-b-2 border-brand-charcoal pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-50 border border-blue-200 text-brand-blue text-xs font-bold uppercase tracking-wider mb-2">
              <span>National & Global Desk</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-5xl font-black text-brand-blue tracking-tight">
              English Edition
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted mt-2">
              Authoritative reporting, technological breakthroughs, and empirical science analysis.
            </p>
          </div>

          {/* Quick link to E-Paper Reader for this edition */}
          {latestEdition && (
            <Link
              to={`/epaper?lang=en&date=${latestEdition.publication_date}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-brand-yellow font-bold text-xs uppercase tracking-wider text-brand-charcoal hover:bg-amber-300 transition-colors shadow-subtle flex-shrink-0"
            >
              <BookOpen className="w-4 h-4" />
              <span>Read English Broadsheet</span>
            </Link>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-brand-border text-xs scrollbar-none">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors ${
              selectedCategory === ''
                ? 'bg-brand-blue text-white shadow-sm'
                : 'bg-gray-100 text-brand-charcoal hover:bg-gray-200'
            }`}
          >
            All Stories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-brand-blue text-white shadow-sm font-bold'
                  : 'bg-gray-100 text-brand-charcoal hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <NewsCardSkeleton key={n} />
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="p-16 text-center border border-brand-border rounded-lg bg-gray-50/50">
            <h3 className="font-headline text-lg font-bold text-brand-charcoal">
              No English articles found in this category.
            </h3>
            <p className="text-xs text-brand-muted mt-1">
              Select another category or view all published stories.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
