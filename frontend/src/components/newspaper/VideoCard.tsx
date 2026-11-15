import React from 'react';
import { Play, Calendar } from 'lucide-react';
import { VideoItem } from '../../types';
import { LanguageBadge } from '../common/LanguageBadge';

interface VideoCardProps {
  video: VideoItem;
  onPlay: (video: VideoItem) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onPlay }) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="group bg-white border border-brand-border rounded overflow-hidden flex flex-col justify-between hover:border-brand-blue/60 transition-all shadow-subtle">
      <div>
        {/* Video Thumbnail with Play Overlay */}
        <div 
          onClick={() => onPlay(video)}
          className="relative w-full h-48 bg-black overflow-hidden cursor-pointer"
        >
          <img
            src={video.thumbnail_url || `https://img.youtube.com/vi/${video.youtube_video_id}/hqdefault.jpg`}
            alt={video.title}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-brand-yellow/90 group-hover:bg-brand-yellow text-brand-charcoal flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>
        </div>

        {/* Content Info */}
        <div className="p-4">
          <h3 
            onClick={() => onPlay(video)}
            className="font-headline text-base font-bold text-brand-blue group-hover:underline line-clamp-2 leading-snug cursor-pointer mb-2"
          >
            {video.title}
          </h3>
          {video.description && (
            <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed">
              {video.description}
            </p>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 pt-2 flex items-center justify-between text-xs text-brand-muted border-t border-brand-border/60">
        <span className="flex items-center gap-1 text-[11px]">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(video.published_at || video.created_at)}</span>
        </span>
        <button
          onClick={() => onPlay(video)}
          className="text-xs font-bold text-brand-blue hover:underline inline-flex items-center gap-1"
        >
          Watch Video
        </button>
      </div>
    </div>
  );
};
