import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { ImageAttachment } from '../../types/chat';
import { UI_STRINGS } from '../../constants/uiStrings';

interface ImagePreviewProps {
  image: ImageAttachment;
  onRemove: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ image, onRemove }) => {
  return (
    <div className="inline-flex items-center gap-2 pl-1.5 pr-2 py-1 bg-surface-card border border-hairline rounded-xl shadow-subtle mb-2.5 max-w-[280px] animate-fade-in">
      <div className="w-8 h-8 rounded-md overflow-hidden bg-surface-strong flex items-center justify-center flex-shrink-0">
        {image.url ? (
          <img
            src={image.url}
            alt={image.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageIcon size={16} className="text-muted" />
        )}
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-xs font-medium text-ink truncate">
          {image.name}
        </span>
        <span className="text-[10px] text-muted">
          {image.sizeFormatted}
        </span>
      </div>

      <button
        type="button"
        onClick={onRemove}
        title={UI_STRINGS.REMOVE_IMAGE}
        aria-label={UI_STRINGS.REMOVE_IMAGE}
        className="p-1 text-muted hover:text-ink rounded-full transition-colors flex items-center justify-center"
      >
        <X size={14} />
      </button>
    </div>
  );
};
