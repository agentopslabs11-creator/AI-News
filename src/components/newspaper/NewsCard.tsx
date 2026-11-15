import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { Article } from '../../types';
import { LanguageBadge } from '../common/LanguageBadge';

interface NewsCardProps {
  article: Article;
  layout?: 'vertical' | 'horizontal';
  onArticleClick?: (article: Article) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  onArticleClick,
}) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onArticleClick) {
      e.preventDefault();
      onArticleClick(article);
    }
  };

  const pageMatch = article.content?.match(/data-page="([^"]*)"/);
  const pageNum = pageMatch ? pageMatch[1] : null;

  return (
    <article
      onClick={handleClick}
      className="group bg-white border border-brand-border rounded-xl p-5 flex flex-col justify-between hover:border-brand-blue hover:shadow-editorial transition-all cursor-pointer select-none"
    >
      <div>
        {/* Category & Language Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-brand-border/60">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200">
              {article.category?.name || 'News Dispatch'}
            </span>
            {pageNum && (
              <span className="text-[9px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                Page {pageNum}
              </span>
            )}
          </div>
          <LanguageBadge language={article.language} size="sm" />
        </div>

        {/* Main Headline */}
        <h3 className="font-headline text-lg sm:text-xl font-bold text-brand-charcoal group-hover:text-brand-blue group-hover:underline leading-snug mb-2.5 transition-colors">
          {article.title}
        </h3>

        {/* Short Description ("little des") */}
        {article.description && (
          <p className="text-xs sm:text-sm text-brand-charcoal/80 line-clamp-3 leading-relaxed mb-4">
            {article.description}
          </p>
        )}
      </div>

      {/* Footer: Date & Read Story action */}
      <div className="flex items-center justify-between text-xs text-brand-muted pt-3 border-t border-brand-border/60">
        <span className="flex items-center gap-1.5 text-[11px] font-medium">
          <Calendar className="w-3.5 h-3.5 text-brand-blue" />
          <span>{formatDate(article.created_at)}</span>
        </span>
        <span className="text-brand-blue font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
          <span>Read Story</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </article>
  );
};
export default NewsCard;
