import React, { useRef, useEffect, useState } from 'react';
import { ArrowUp, Image as ImageIcon, Mic } from 'lucide-react';
import { ImageAttachment } from '../../types/chat';
import { ImagePreview } from './ImagePreview';
import { UI_STRINGS } from '../../constants/uiStrings';

interface ChatInputProps {
  onSendMessage: (text: string, image?: ImageAttachment) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  const [text, setText] = useState('');
  const [stagedImage, setStagedImage] = useState<ImageAttachment | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 160)}px`;
    }
  }, [text]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset file input value so same file can be re-uploaded if desired
    e.target.value = '';
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const sizeInKB = Math.round(file.size / 1024);
    const sizeFormatted = sizeInKB > 1024 ? `${(sizeInKB / 1024).toFixed(1)} MB` : `${sizeInKB} KB`;

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const resultUrl = loadEvt.target?.result as string;
      setStagedImage({
        id: `img-${Date.now()}`,
        name: file.name,
        url: resultUrl,
        sizeFormatted,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if ((text.trim() || stagedImage) && !disabled) {
      onSendMessage(text.trim(), stagedImage);
      setText('');
      setStagedImage(undefined);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const canSubmit = (text.trim().length > 0 || !!stagedImage) && !disabled;

  return (
    <div
      className="w-full max-w-[760px] mx-auto px-5 pb-4 relative z-10"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Visual Indicator Overlay */}
      {isDragging && (
        <div className="absolute inset-x-5 inset-y-0 pb-4 bg-surface-strong/90 dark:bg-surface-dark-elevated/95 border-2 border-dashed border-ink dark:border-white/40 rounded-3xl flex items-center justify-center gap-2 text-ink dark:text-on-dark font-medium text-sm z-30 backdrop-blur-sm animate-fade-in">
          <ImageIcon size={20} />
          <span>{UI_STRINGS.DRAG_IMAGE_ACTIVE}</span>
        </div>
      )}

      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Main Input Card */}
      <div className="bg-surface-card dark:bg-surface-dark-elevated border border-hairline dark:border-white/10 rounded-3xl p-3.5 sm:px-4 sm:py-3 shadow-soft transition-all duration-150 focus-within:border-hairline-strong dark:focus-within:border-white/25">
        {/* Staged Image Preview Badge */}
        {stagedImage && (
          <ImagePreview
            image={stagedImage}
            onRemove={() => setStagedImage(undefined)}
          />
        )}

        {/* Text Input Row */}
        <div className="flex items-end gap-2">
          {/* Dedicated Image Upload Icon Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title={UI_STRINGS.ATTACH_IMAGE}
            aria-label={UI_STRINGS.ATTACH_IMAGE}
            className="w-9 h-9 rounded-full bg-canvas-soft dark:bg-surface-dark border border-hairline dark:border-white/10 text-ink dark:text-on-dark flex items-center justify-center cursor-pointer flex-shrink-0 transition-all duration-150 hover:bg-surface-strong dark:hover:bg-white/10 active:scale-95"
          >
            <ImageIcon size={17} strokeWidth={1.8} />
          </button>

          {/* Multiline expanding textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={UI_STRINGS.INPUT_PLACEHOLDER}
            aria-label={UI_STRINGS.INPUT_PLACEHOLDER}
            disabled={disabled}
            className="flex-1 resize-none border-0 bg-transparent text-[15px] font-body text-ink dark:text-on-dark leading-normal py-1.5 px-1 max-h-40 outline-none tracking-wide placeholder:text-muted dark:placeholder:text-muted-soft"
          />

          {/* Right Action Tools: Mic + Send Button */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Mic / Voice dictation button */}
            <button
              type="button"
              onClick={() => setIsRecording(!isRecording)}
              title={UI_STRINGS.VOICE_INPUT}
              aria-label={UI_STRINGS.VOICE_INPUT}
              className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                isRecording
                  ? 'bg-red-500/15 text-semantic-error'
                  : 'text-muted dark:text-muted-soft hover:text-ink dark:hover:text-on-dark hover:bg-canvas-soft dark:hover:bg-white/10'
              }`}
            >
              <Mic size={17} strokeWidth={1.8} />
            </button>

            {/* Primary Send Button: Near-black Ink Pill in light mode, crisp white in dark mode */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              title={UI_STRINGS.SEND_MESSAGE}
              aria-label={UI_STRINGS.SEND_MESSAGE}
              className={`w-9 h-9 rounded-full border-0 flex items-center justify-center transition-all duration-150 ${
                canSubmit
                  ? 'bg-primary dark:bg-white text-on-primary dark:text-ink cursor-pointer hover:bg-primary-active dark:hover:bg-white/90 active:scale-95 shadow-subtle'
                  : 'bg-hairline dark:bg-white/10 text-muted-soft dark:text-white/20 cursor-not-allowed'
              }`}
            >
              <ArrowUp size={18} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>

      {/* Editorial Disclaimer Footer */}
      <div className="mt-2 text-center text-xs text-muted dark:text-muted-soft tracking-wide font-body">
        {UI_STRINGS.DISCLAIMER}
      </div>
    </div>
  );
};
