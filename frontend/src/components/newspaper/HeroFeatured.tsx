import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Bookmark } from 'lucide-react';
import { Article } from '../../types';
import { LanguageBadge } from '../common/LanguageBadge';

interface HeroProps {
  mainArticle?: Article | null;
  secondaryArticles?: Article[];
}

export const HeroFeatured: React.FC<HeroProps> = ({ mainArticle, secondaryArticles = [] }) => {
  if (!mainArticle) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <section className="w-full bg-white py-6 border-b border-brand-border">
      <div className="w-full px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Lead Feature (8 Columns) */}
          <div className="lg:col-span-8 group flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-brand-border pb-8 lg:pb-0 lg:pr-8">
            <div>
              {/* Media Container */}
              {mainArticle.image_url && (
                <div className="relative w-full h-72 sm:h-96 overflow-hidden rounded border border-brand-border mb-5 bg-gray-50">
                  <img
                    src={mainArticle.image_url}
                    alt={mainArticle.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    loading="eager"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="bg-brand-green text-brand-charcoal text-[11px] font-black uppercase px-2.5 py-1 rounded shadow-sm">
                      Lead Story
                    </span>
                    <LanguageBadge language={mainArticle.language} />
                  </div>
                </div>
              )}

              {/* Category & Date */}
              <div className="flex items-center gap-3 text-xs text-brand-muted mb-2 font-medium">
                {mainArticle.category && (
                  <span className="font-bold text-brand-charcoal uppercase tracking-wider text-[11px]">
                    {mainArticle.category.name}
                  </span>
                )}
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(mainArticle.created_at)}</span>
                </span>
              </div>

              {/* Main Headline in Royal Blue */}
              <Link to={`/latest-news?slug=${mainArticle.slug}`}>
                <h1 className="font-headline text-2xl sm:text-4xl lg:text-[40px] font-black leading-tight text-brand-blue hover:text-blue-900 transition-colors mb-4">
                  {mainArticle.title}
                </h1>
              </Link>

              {/* Deck / Summary */}
              <p className="text-sm sm:text-base text-brand-charcoal/90 leading-relaxed mb-6 font-normal">
                {mainArticle.description}
              </p>
            </div>

            {/* Read More Action Button */}
            <div className="pt-2">
              <Link
                to={`/latest-news?slug=${mainArticle.slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-brand-blue text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-800 transition-colors shadow-subtle"
              >
                <span>Read Full Coverage</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Secondary Features (4 Columns) */}
          <div className="lg:col-span-4 flex flex-col divide-y divide-brand-border">
            <div className="pb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-brand-charcoal flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-brand-yellow fill-brand-yellow" />
                <span>Editorial Highlights</span>
              </h3>
            </div>

            {secondaryArticles.slice(0, 3).map((article, idx) => (
              <div key={article.id} className="py-5 group flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                      {article.category?.name || 'General'}
                    </span>
                    <LanguageBadge language={article.language} size="sm" />
                  </div>

                  <Link to={`/latest-news?slug=${article.slug}`}>
                    <h4 className="font-headline text-base sm:text-lg font-bold text-brand-blue group-hover:underline leading-snug mb-2">
                      {article.title}
                    </h4>
                  </Link>

                  <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed mb-3">
                    {article.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-brand-muted">
                  <span>{formatDate(article.created_at)}</span>
                  <Link
                    to={`/latest-news?slug=${article.slug}`}
                    className="text-brand-blue font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <span>Read</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
