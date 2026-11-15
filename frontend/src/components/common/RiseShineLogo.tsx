import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  showDate?: boolean;
  align?: 'left' | 'center';
  linkToHome?: boolean;
  layout?: 'vertical' | 'horizontal';
}

export const RiseShineLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = true,
  showDate = false,
  align = 'center',
  linkToHome = true,
  layout = 'vertical',
}) => {
  // Sizing definitions: Logo image is made prominent ("with little big") with typography underneath
  const sizeMap = {
    sm: { imgSize: 42, titleSize: 'text-lg sm:text-xl', tagSize: 'text-[9px]' },
    md: { imgSize: 76, titleSize: 'text-2xl sm:text-3xl lg:text-[32px]', tagSize: 'text-[11px] sm:text-xs' },
    lg: { imgSize: 96, titleSize: 'text-3xl sm:text-4xl lg:text-5xl', tagSize: 'text-xs sm:text-sm' },
    xl: { imgSize: 120, titleSize: 'text-4xl sm:text-5xl lg:text-6xl', tagSize: 'text-sm sm:text-base' },
  };

  const current = sizeMap[size];

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const content = layout === 'vertical' ? (
    <div
      className={`flex flex-col ${
        align === 'left' ? 'items-start text-left' : 'items-center text-center'
      } select-none ${className}`}
    >
      {/* 
        Official Brand Emblem
        A rising golden sun above a bright lime green semicircle with 'Rise 'n' Shine'
      */}
      <img
        src="/brand-logo.png"
        alt="Rise ’n’ Shine"
        style={{ width: current.imgSize, height: current.imgSize }}
        className={`rounded-full object-contain drop-shadow-md mb-2 transition-transform duration-300 hover:scale-105 ${
          align === 'left' ? '' : 'mx-auto'
        }`}
      />

      {/* Brand Typography Coming Directly Under The Logo */}
      <div
        className={`flex flex-col ${
          align === 'left' ? 'items-start text-left' : 'items-center text-center'
        } leading-none`}
      >
        <div className={`font-headline font-black tracking-tight text-brand-blue ${current.titleSize}`}>
          RISE <span className="text-brand-yellow font-extrabold">’N’</span> SHINE
        </div>
        {showTagline && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={`font-sans font-black tracking-[0.28em] text-brand-charcoal uppercase ${current.tagSize}`}>
              THE AI NEWSPAPER
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-green flex-shrink-0" />
            <span className="text-[10px] text-brand-muted font-bold tracking-wider hidden sm:inline">
              EST. 2026
            </span>
          </div>
        )}

        {/* Date In Below of Logo */}
        {showDate && (
          <div className="text-[11px] sm:text-xs font-semibold text-brand-charcoal mt-2 flex items-center gap-1.5">
            <span className="text-brand-blue font-bold">●</span>
            <span>{todayFormatted}</span>
          </div>
        )}
      </div>
    </div>
  ) : (
    /* Compact horizontal layout */
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <img
        src="/brand-logo.png"
        alt="Rise ’n’ Shine"
        style={{ width: current.imgSize, height: current.imgSize }}
        className="rounded-full object-contain drop-shadow-sm flex-shrink-0"
      />
      <div className="flex flex-col justify-center leading-none text-left">
        <div className={`font-headline font-black tracking-tight text-brand-blue ${current.titleSize}`}>
          RISE <span className="text-brand-yellow font-extrabold">’N’</span> SHINE
        </div>
        {showTagline && (
          <div className="flex items-center gap-1 mt-1">
            <span className={`font-sans font-bold tracking-[0.2em] text-brand-charcoal uppercase ${current.tagSize}`}>
              THE AI NEWSPAPER
            </span>
          </div>
        )}
        {showDate && (
          <span className="text-[10px] text-brand-muted font-medium mt-1">
            {todayFormatted}
          </span>
        )}
      </div>
    </div>
  );

  if (linkToHome) {
    return (
      <Link to="/" className="hover:opacity-95 transition-opacity inline-block">
        {content}
      </Link>
    );
  }

  return content;
};
export default RiseShineLogo;
