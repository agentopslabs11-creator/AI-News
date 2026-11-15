import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, Video, Archive, Sparkles, Clock, X, BookOpen } from 'lucide-react';
import { RiseShineLogo } from '../common/RiseShineLogo';

interface NavigationProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ mobileOpen, onCloseMobile }) => {
  const location = useLocation();

  // Exactly the 6 requested navigation tabs: Home, Latest, తెలుగు, हिंदी, Videos, Archive (Previous Papers)
  const navItems = [
    {
      label: 'Home',
      path: '/',
      icon: Sparkles,
      isActive: location.pathname === '/',
    },
    {
      label: 'Latest',
      path: '/latest-news',
      icon: Clock,
      isActive: location.pathname === '/latest-news',
    },
    {
      label: 'తెలుగు',
      path: '/epaper?lang=te',
      icon: Newspaper,
      isLang: true,
      fontClass: 'font-telugu',
      isActive: location.pathname === '/epaper' && location.search.includes('lang=te'),
    },
    {
      label: 'हिंदी',
      path: '/epaper?lang=hi',
      icon: Newspaper,
      isLang: true,
      fontClass: 'font-hindi',
      isActive: location.pathname === '/epaper' && location.search.includes('lang=hi'),
    },
    {
      label: 'Videos',
      path: '/videos',
      icon: Video,
      isActive: location.pathname === '/videos',
    },
    {
      label: 'Previous Papers',
      path: '/archive',
      icon: Archive,
      isActive: location.pathname === '/archive',
    },
  ];

  return (
    <>
      {/* Desktop Navigation Bar - Sticky at top-0 when scrolling, displaying only the compact left-side logo */}
      <nav className="w-full bg-white border-y border-brand-border sticky top-0 z-40 hidden lg:block shadow-[0_2px_4px_rgba(0,0,0,0.03)]">
        <div className="w-full px-4 sm:px-8 flex items-center justify-between">
          {/* Left Side Logo (Shows on scroll without taking up the full header space) */}
          <Link
            to="/"
            className="flex items-center gap-3 py-3 pr-6 border-r border-brand-border hover:opacity-90 transition-opacity flex-shrink-0"
            title="Rise ’n’ Shine Homepage"
          >
            <img
              src="/brand-logo.png"
              alt="Rise ’n’ Shine"
              className="w-10 h-10 rounded-full object-contain drop-shadow-xs"
            />
            <div className="leading-tight text-left">
              <span className="font-headline font-black text-base text-brand-blue tracking-tight block">
                RISE <span className="text-brand-yellow font-extrabold">’N’</span> SHINE
              </span>
              <span className="text-[9px] font-sans font-extrabold text-brand-charcoal uppercase tracking-widest block">
                THE AI NEWSPAPER
              </span>
            </div>
          </Link>

          {/* Navigation Items - Enhanced Visibility & Size */}
          <ul className="flex items-center justify-end gap-2 text-sm font-black uppercase tracking-wider text-brand-charcoal flex-1 pl-6">
            {navItems.map((item) => (
              <li key={item.path} className="relative py-2.5">
                <Link
                  to={item.path}
                  className={`px-4 sm:px-4.5 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    item.isActive
                      ? 'bg-brand-green text-brand-charcoal font-black shadow-sm ring-2 ring-lime-400'
                      : 'text-brand-charcoal hover:text-brand-blue hover:bg-gray-100 font-extrabold'
                  } ${item.fontClass || ''}`}
                >
                  <item.icon className="w-4 h-4 opacity-90 stroke-[2.2]" />
                  <span className={item.isLang ? 'normal-case text-base font-bold' : 'text-xs sm:text-sm font-black tracking-wide'}>
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto border-r border-brand-border"
            >
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-brand-border">
                  <RiseShineLogo size="sm" linkToHome={false} />
                  <button
                    onClick={onCloseMobile}
                    className="p-1.5 rounded-lg border border-brand-border hover:bg-gray-100"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5 text-brand-charcoal" />
                  </button>
                </div>

                <div className="mt-6 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-brand-muted px-3 mb-2">
                    Sections & Direct Editions
                  </p>
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onCloseMobile}
                      className={`flex items-center gap-3.5 px-3.5 py-3.5 rounded-xl text-base font-black transition-colors ${
                        item.isActive
                          ? 'bg-brand-green text-brand-charcoal ring-2 ring-lime-400'
                          : 'text-brand-charcoal hover:bg-gray-50'
                      } ${item.fontClass || ''}`}
                    >
                      <item.icon className="w-5 h-5 text-brand-blue stroke-[2.2]" />
                      <span className={item.isLang ? 'text-lg font-bold' : ''}>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-brand-border">
                <Link
                  to="/archive"
                  onClick={onCloseMobile}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-brand-yellow font-bold text-xs uppercase tracking-wider text-brand-charcoal mb-3 shadow-sm hover:bg-amber-300"
                >
                  <Archive className="w-4 h-4" />
                  <span>Browse Previous Papers</span>
                </Link>
                <p className="text-[11px] text-center text-brand-muted">
                  Rise ’n’ Shine © 2026. All rights reserved.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
