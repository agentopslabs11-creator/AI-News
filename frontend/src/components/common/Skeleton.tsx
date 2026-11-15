import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const NewsCardSkeleton: React.FC = () => (
  <div className="bg-white border border-brand-border rounded-xl p-5 flex flex-col justify-between space-y-4">
    <div className="flex items-center justify-between pb-2 border-b border-brand-border/60">
      <Skeleton className="w-20 h-4" />
      <Skeleton className="w-12 h-4" />
    </div>
    <div className="space-y-2">
      <Skeleton className="w-full h-5" />
      <Skeleton className="w-3/4 h-5" />
    </div>
    <div className="space-y-1.5">
      <Skeleton className="w-full h-3" />
      <Skeleton className="w-5/6 h-3" />
      <Skeleton className="w-2/3 h-3" />
    </div>
    <div className="flex items-center justify-between pt-3 border-t border-brand-border/60">
      <Skeleton className="w-24 h-3" />
      <Skeleton className="w-16 h-3" />
    </div>
  </div>
);

export const HeroSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-6">
    <div className="lg:col-span-2 space-y-4">
      <Skeleton className="w-full h-80" />
      <Skeleton className="w-32 h-6" />
      <Skeleton className="w-full h-10" />
      <Skeleton className="w-full h-20" />
    </div>
    <div className="space-y-6">
      <div className="border-b border-brand-border pb-4 space-y-2">
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-full h-12" />
      </div>
      <div className="border-b border-brand-border pb-4 space-y-2">
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-full h-12" />
      </div>
    </div>
  </div>
);
