import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  showDate?: boolean;
  align?: 'left' | 'center';
  linkToHome?: boolean;
  layout?: 'vertical' | 'horizontal' | 'middle-lockup';
}

export const RiseShineLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = true,
  showDate = false,
  align = 'center',
  linkToHome = true,
  layout = 'middle-lockup',
}) => {
  // Sizing definitions: Logo image with matching newspaper masthead typography
  const sizeMap = {
    sm: { imgClass: 'w-7 h-7 sm:w-10 sm:h-10', titleSize: 'text-base sm:text-lg', tagSize: 'text-[8px] sm:text-[9px]' },
    md: { imgClass: 'w-10 h-10 sm:w-14 sm:h-14 lg:w-[74px] lg:h-[74px]', titleSize: 'text-lg sm:text-2xl lg:text-[38px]', tagSize: 'text-[9px] sm:text-[11px] lg:text-xs' },
    lg: { imgClass: 'w-14 h-14 sm:w-18 sm:h-18 lg:w-[92px] lg:h-[92px]', titleSize: 'text-xl sm:text-3xl lg:text-5xl', tagSize: 'text-[10px] sm:text-xs lg:text-sm' },
    xl: { imgClass: 'w-18 h-18 sm:w-24 sm:h-24 lg:w-[120px] lg:h-[120px]', titleSize: 'text-2xl sm:text-4xl lg:text-6xl', tagSize: 'text-xs sm:text-sm lg:text-base' },
  };

  const current = sizeMap[size];

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let content: React.ReactNode;

  if (layout === 'middle-lockup') {
    // Masthead lockup: Round logo on left, "RISE 'N' SHINE" on right, "THE AI NEWSPAPER" below it, date below
    content = (
      <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
        {/* Horizontal lockup: Logo on left, Title & Tagline on right */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-4">
          <img
            src="/brand-logo.png"
            alt="Rise ’n’ Shine"
            className={`${current.imgClass} rounded-full object-contain drop-shadow-md transition-transform duration-300 hover:scale-105 flex-shrink-0`}
          />
          <div className="flex flex-col items-start justify-center text-left leading-none">
            <div className={`font-headline font-black tracking-tight text-brand-blue ${current.titleSize}`}>
              RISE <span className="text-brand-yellow font-extrabold">’N’</span> SHINE
            </div>
            {showTagline && (
              <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5">
                <span className={`font-sans font-black tracking-[0.2em] sm:tracking-[0.24em] text-brand-charcoal uppercase ${current.tagSize}`}>
                  THE AI NEWSPAPER
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-green flex-shrink-0" />
                <span className="text-[10px] text-brand-muted font-bold tracking-wider hidden sm:inline">
                  EST. 2026
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Date line centered below the logo lockup */}
        {showDate && (
          <div className="text-[11px] sm:text-[13px] font-semibold text-brand-charcoal mt-1.5 sm:mt-2.5 flex items-center justify-center gap-1.5">
            <span className="text-brand-blue font-bold">●</span>
            <span>{todayFormatted}</span>
          </div>
        )}
      </div>
    );
  } else if (layout === 'vertical') {
    // Vertical stacked layout (Emblem top, typography underneath)
    content = (
      <div
        className={`flex flex-col ${
          align === 'left' ? 'items-start text-left' : 'items-center text-center'
        } select-none ${className}`}
      >
        <img
          src="/brand-logo.png"
          alt="Rise ’n’ Shine"
          className={`${current.imgClass} rounded-full object-contain drop-shadow-md mb-2 transition-transform duration-300 hover:scale-105 ${
            align === 'left' ? '' : 'mx-auto'
          }`}
        />
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
              <span className={`font-sans font-black tracking-[0.24em] sm:tracking-[0.28em] text-brand-charcoal uppercase ${current.tagSize}`}>
                THE AI NEWSPAPER
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green flex-shrink-0" />
              <span className="text-[10px] text-brand-muted font-bold tracking-wider hidden sm:inline">
                EST. 2026
              </span>
            </div>
          )}
          {showDate && (
            <div className="text-[11px] sm:text-xs font-semibold text-brand-charcoal mt-2 flex items-center gap-1.5">
              <span className="text-brand-blue font-bold">●</span>
              <span>{todayFormatted}</span>
            </div>
          )}
        </div>
      </div>
    );
  } else {
    // Compact horizontal layout
    content = (
      <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
        <img
          src="/brand-logo.png"
          alt="Rise ’n’ Shine"
          className={`${current.imgClass} rounded-full object-contain drop-shadow-sm flex-shrink-0`}
        />
        <div className="flex flex-col justify-center leading-none text-left">
          <div className={`font-headline font-black tracking-tight text-brand-blue ${current.titleSize}`}>
            RISE <span className="text-brand-yellow font-extrabold">’N’</span> SHINE
          </div>
          {showTagline && (
            <div className="flex items-center gap-1 mt-1">
              <span className={`font-sans font-bold tracking-[0.16em] sm:tracking-[0.2em] text-brand-charcoal uppercase ${current.tagSize}`}>
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
  }

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
