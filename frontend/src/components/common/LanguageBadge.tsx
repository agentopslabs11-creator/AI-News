import React from 'react';
import { LanguageCode } from '../../types';

interface BadgeProps {
  language: LanguageCode | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const LanguageBadge: React.FC<BadgeProps> = ({ language, size = 'sm', className = '' }) => {
  const config = {
    en: {
      label: 'English',
      native: 'English',
      bg: 'bg-blue-50 text-brand-blue border-blue-200',
    },
    te: {
      label: 'Telugu',
      native: 'తెలుగు',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    hi: {
      label: 'Hindi',
      native: 'हिंदी',
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
    },
  }[language as LanguageCode] || {
    label: language.toUpperCase(),
    native: language.toUpperCase(),
    bg: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span 
      className={`inline-flex items-center gap-1 font-semibold rounded border ${config.bg} ${sizeClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      <span>{config.native}</span>
    </span>
  );
};
