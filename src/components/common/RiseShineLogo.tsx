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
    sm: { imgSize: 42, titleSize: 'text-lg sm:text-xl', tagSize: 'text-[9px]' },
    md: { imgSize: 74, titleSize: 'text-2xl sm:text-3xl lg:text-[38px]', tagSize: 'text-[11px] sm:text-xs' },
    lg: { imgSize: 92, titleSize: 'text-3xl sm:text-4xl lg:text-5xl', tagSize: 'text-xs sm:text-sm' },
    xl: { imgSize: 120, titleSize: 'text-4xl sm:text-5xl lg:text-6xl', tagSize: 'text-sm sm:text-base' },
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
        <div className="flex items-center justify-center gap-3.5 sm:gap-4">
          <img
            src="/brand-logo.png"
            alt="Rise ’n’ Shine"
            style={{ width: current.imgSize, height: current.imgSize }}
            className="rounded-full object-contain drop-shadow-md transition-transform duration-300 hover:scale-105 flex-shrink-0"
          />
          <div className="flex flex-col items-start justify-center text-left leading-none">
            <div className={`font-headline font-black tracking-tight text-brand-blue ${current.titleSize}`}>
              RISE <span className="text-brand-yellow font-extrabold">’N’</span> SHINE
            </div>
            {showTagline && (
              <div className="flex items-center gap-2 mt-1 sm:mt-1.5">
                <span className={`font-sans font-black tracking-[0.24em] text-brand-charcoal uppercase ${current.tagSize}`}>
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
          <div className="text-xs sm:text-[13px] font-semibold text-brand-charcoal mt-2.5 flex items-center justify-center gap-1.5">
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
          style={{ width: current.imgSize, height: current.imgSize }}
          className={`rounded-full object-contain drop-shadow-md mb-2 transition-transform duration-300 hover:scale-105 ${
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
              <span className={`font-sans font-black tracking-[0.28em] text-brand-charcoal uppercase ${current.tagSize}`}>
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
