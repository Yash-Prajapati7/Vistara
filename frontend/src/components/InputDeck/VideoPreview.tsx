import React from 'react';
import { X, Video as VideoIcon } from 'lucide-react';
import { VideoAttachment } from '../../types/chat';
import { UI_STRINGS } from '../../constants/uiStrings';

interface VideoPreviewProps {
  video: VideoAttachment;
  onRemove: () => void;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ video, onRemove }) => {
  return (
    <div className="inline-flex items-center gap-2 pl-2 pr-2.5 py-1.5 bg-surface-card dark:bg-surface-dark-elevated border border-hairline dark:border-white/10 rounded-xl shadow-subtle mb-2.5 max-w-[320px] animate-fade-in">
      <div className="w-8 h-8 rounded-lg overflow-hidden bg-primary/5 dark:bg-white/10 text-ink dark:text-on-dark flex items-center justify-center flex-shrink-0">
        <VideoIcon size={16} strokeWidth={2} />
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-xs font-medium text-ink dark:text-on-dark truncate">
          {video.name}
        </span>
        <span className="text-[10px] text-muted dark:text-muted-soft">
          {video.sizeFormatted}
        </span>
      </div>

      <button
        type="button"
        onClick={onRemove}
        title={UI_STRINGS.REMOVE_VIDEO}
        aria-label={UI_STRINGS.REMOVE_VIDEO}
        className="p-1 text-muted dark:text-muted-soft hover:text-ink dark:hover:text-on-dark rounded-full transition-colors flex items-center justify-center cursor-pointer"
      >
        <X size={14} />
      </button>
    </div>
  );
};
