import React from 'react';
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
    <div className="w-full bg-[#fbfbf9] border-y border-brand-border py-1.5 px-2.5 sm:px-8 overflow-hidden select-none">
      <div className="w-full flex items-center gap-2 sm:gap-3 relative">
        {/* Fixed LIVE WIRE Badge as featured in the broadsheet HTML */}
        <div className="flex-shrink-0 z-10 px-2 sm:px-3 py-0.5 sm:py-1 bg-[#b3261e] text-white text-[10px] sm:text-[11px] font-black tracking-[0.12em] sm:tracking-[0.14em] uppercase shadow-xs flex items-center gap-1 sm:gap-1.5 rounded-xs select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>LIVE WIRE</span>
        </div>

        {/* Ticker Items - Scrolling our submitted newspaper headlines slowly and continuously */}
        <div className="flex-1 overflow-hidden relative whitespace-nowrap">
          <div className="inline-flex items-center gap-4 animate-marquee-slow hover:pause-animation">
            {displayItems.map((item, index) => {
              const uniqueKey = `${item.id}-${index}`;
              return (
                <React.Fragment key={uniqueKey}>
                  <button
                    onClick={() => onArticleClick?.(item)}
                    className="inline-flex items-center text-xs font-semibold text-brand-charcoal hover:text-brand-blue transition-colors group cursor-pointer text-left py-0.5"
                    title={`Read "${item.title}"`}
                  >
                    <span className="font-medium group-hover:underline text-[13px]">{item.title}</span>
                  </button>
                  <span className="text-[#b3261e] font-serif text-xs font-black select-none opacity-80">
                    ◆
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakingNewsTicker;
