import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';
import { RiseShineLogo } from '../common/RiseShineLogo';
import { useAuth } from '../../hooks/useAuth';
import { LanguageCode } from '../../types';

interface HeaderProps {
  onLanguageChange?: (lang: LanguageCode) => void;
  currentLanguage?: LanguageCode;
  onSearchOpen?: () => void;
  onToggleMobileNav?: () => void;
  mobileNavOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage = 'en',
  onToggleMobileNav,
  mobileNavOpen = false,
}) => {
  const { isAuthenticated } = useAuth();

  return (
    <header className="w-full bg-white border-b border-brand-border relative">
      {/* Top Utility Bar */}
      <div className="border-b border-brand-border bg-white text-xs text-brand-muted py-2 px-4 sm:px-8">
        <div className="w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="hidden md:inline italic text-gray-500">
              "News That Matters. Knowledge That Empowers."
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Direct Language Switcher Pills */}
            <div className="flex items-center bg-gray-50 border border-brand-border rounded-full p-0.5">
              <Link
                to="/"
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
                  currentLanguage === 'en'
                    ? 'bg-brand-blue text-white shadow-sm'
                    : 'text-brand-charcoal hover:bg-gray-200/60'
                }`}
                title="English Newspaper Edition"
              >
                EN
              </Link>
              <Link
                to="/epaper?lang=te"
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-colors font-telugu ${
                  currentLanguage === 'te'
                    ? 'bg-brand-green text-brand-charcoal shadow-sm'
                    : 'text-brand-charcoal hover:bg-gray-200/60'
                }`}
                title="తెలుగు ఇ-పేపర్"
              >
                తెలుగు
              </Link>
              <Link
                to="/epaper?lang=hi"
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-colors font-hindi ${
                  currentLanguage === 'hi'
                    ? 'bg-brand-yellow text-brand-charcoal shadow-sm'
                    : 'text-brand-charcoal hover:bg-gray-200/60'
                }`}
                title="हिंदी ई-पेपर"
              >
                हिंदी
              </Link>
            </div>

            {/* Admin Portal Shortcut */}
            {isAuthenticated ? (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-brand-blue text-white text-[11px] font-bold hover:bg-brand-blue/90 transition-all shadow-sm"
              >
                <Shield className="w-3.5 h-3.5 text-brand-green" />
                <span>Admin Hub</span>
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-brand-muted hover:text-brand-blue transition-colors px-2 py-0.5"
              >
                <Shield className="w-3 h-3" />
                <span>Staff Portal</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Masthead Banner - Centered in Middle like The Times of India */}
      <div className="w-full px-4 sm:px-8 py-4 sm:py-6 relative flex items-center justify-center">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleMobileNav}
          className="lg:hidden absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-2 rounded-lg border border-brand-border text-brand-charcoal hover:bg-gray-50 transition-colors z-10"
          aria-label="Toggle navigation drawer"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Brand in Middle with Date below logo, inspired by The Times of India referral */}
        <div className="flex justify-center items-center py-1">
          <RiseShineLogo size="md" layout="middle-lockup" showDate={true} />
        </div>
      </div>
    </header>
  );
};
