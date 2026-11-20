import React, { useEffect } from 'react';
import { Trash2, X } from 'lucide-react';
import { UI_STRINGS } from '../../constants/uiStrings';

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  conversationTitle?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Editorial confirmation dialog for permanent chat deletion.
 * Adheres strictly to the ElevenLabs editorial aesthetic, EB Garamond 300 typography,
 * dark-mode token consistency, and zero-emoji policy.
 */
export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  conversationTitle,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px] animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="bg-surface-card dark:bg-surface-dark-elevated border border-hairline dark:border-white/10 rounded-2xl p-6 sm:p-7 max-w-[440px] w-full shadow-popover relative flex flex-col gap-5 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onCancel}
          className="btn-ghost-icon absolute top-4 right-4 text-muted hover:text-ink dark:hover:text-on-dark"
          aria-label={UI_STRINGS.DELETE_MODAL_CLOSE_ARIA}
        >
          <X size={16} strokeWidth={1.8} />
        </button>

        {/* Icon & Title Heading */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 text-semantic-error flex items-center justify-center flex-shrink-0 border border-red-200/60 dark:border-red-900/40">
            <Trash2 size={19} strokeWidth={1.8} />
          </div>

          <div className="flex flex-col gap-1 pr-6 min-w-0">
            <h3
              id="delete-modal-title"
              className="font-display text-2xl font-light text-ink dark:text-on-dark tracking-tight"
            >
              {UI_STRINGS.DELETE_MODAL_TITLE}
            </h3>
            <p className="font-body text-[13.5px] leading-relaxed text-body dark:text-muted-soft">
              {UI_STRINGS.DELETE_MODAL_DESCRIPTION}
            </p>
          </div>
        </div>

        {/* Target Session Chip */}
        {conversationTitle && (
          <div className="px-3.5 py-2.5 rounded-xl bg-canvas dark:bg-black/30 border border-hairline-soft dark:border-white/10 text-[13px] font-medium text-ink dark:text-on-dark truncate font-body">
            {conversationTitle}
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="btn-outline h-10 px-5 text-[14px] rounded-pill"
          >
            {UI_STRINGS.DELETE_MODAL_CANCEL}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 bg-semantic-error hover:bg-red-700 text-white font-body text-[14px] font-medium rounded-pill px-5 h-10 border border-transparent cursor-pointer transition-all duration-150 select-none shadow-subtle active:scale-[0.985]"
          >
            <Trash2 size={15} strokeWidth={1.8} />
            <span>{UI_STRINGS.DELETE_MODAL_CONFIRM}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
