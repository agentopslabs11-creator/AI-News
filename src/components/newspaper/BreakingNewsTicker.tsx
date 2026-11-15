import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { Article } from '../../types';

interface TickerProps {
  items: Article[];
  onArticleClick?: (article: Article) => void;
}

export const BreakingNewsTicker: React.FC<TickerProps> = ({ items, onArticleClick }) => {
  if (!items || items.length === 0) return null;

  // Duplicate items to ensure a seamless, endless scrolling marquee loop
  const displayItems = items.length < 6 ? [...items, ...items, ...items, ...items] : [...items, ...items];

  return (
    <div className="w-full bg-white border-b border-brand-border py-2 px-4 sm:px-8 overflow-hidden select-none">
      <div className="w-full flex items-center gap-3">
        {/* Urgent Indicator */}
        <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded bg-brand-yellow border border-amber-300 text-brand-charcoal text-[11px] font-black uppercase tracking-wider shadow-sm">
          <Zap className="w-3.5 h-3.5 fill-brand-charcoal animate-pulse" />
          <span>Breaking News</span>
        </div>

        {/* Ticker Items - Scrolling ONLY our submitted newspaper headlines */}
        <div className="flex-1 overflow-hidden relative whitespace-nowrap">
          <div className="inline-flex gap-8 animate-marquee hover:pause-animation">
            {displayItems.map((item, index) => {
              const uniqueKey = `${item.id}-${index}`;
              if (onArticleClick) {
                return (
                  <button
                    key={uniqueKey}
                    onClick={() => onArticleClick(item)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-brand-charcoal hover:text-brand-blue transition-colors group cursor-pointer text-left"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue group-hover:scale-125 transition-transform" />
                    <span className="text-[10px] uppercase font-bold text-brand-muted">
                      [{item.language ? item.language.toUpperCase() : 'EN'}]
                    </span>
                    <span className="font-medium group-hover:underline">{item.title}</span>
                  </button>
                );
              }
              return (
                <Link
                  key={uniqueKey}
                  to={`/latest-news?slug=${item.slug}`}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-brand-charcoal hover:text-brand-blue transition-colors group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-blue group-hover:scale-125 transition-transform" />
                  <span className="text-[10px] uppercase font-bold text-brand-muted">
                    [{item.language ? item.language.toUpperCase() : 'EN'}]
                  </span>
                  <span className="font-medium group-hover:underline">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
