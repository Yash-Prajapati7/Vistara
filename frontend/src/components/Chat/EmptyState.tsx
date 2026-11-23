import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SUGGESTION_PROMPTS } from '../../data/mockData';
import { UI_STRINGS } from '../../constants/uiStrings';

interface EmptyStateProps {
  onSelectPrompt: (promptText: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectPrompt }) => {
  return (
    <div className="w-full max-w-[920px] mx-auto px-5 py-6 sm:py-8 relative z-10">
      <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 md:gap-10">
        {/* Left Column: 60% Width - Greeting & Prompts */}
        <div className="w-full md:w-[60%] flex flex-col text-left">
          {/* Editorial Greeting Header */}
          <div className="mb-6">
            <h1 className="font-display text-[30px] sm:text-[36px] font-light text-ink dark:text-white tracking-tight leading-tight mb-2">
              {UI_STRINGS.EMPTY_STATE_GREETING}
            </h1>
          </div>

          {/* Vertical List of Sample Prompts */}
          <div className="flex flex-col gap-2.5 w-full">
            {SUGGESTION_PROMPTS.map((promptText, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectPrompt(promptText)}
                className={`group w-full px-4 py-3 bg-surface-card dark:bg-surface-dark-elevated border border-hairline dark:border-white/10 rounded-xl cursor-pointer transition-all duration-150 items-center justify-between gap-3 text-left shadow-subtle hover:border-hairline-strong dark:hover:border-white/25 hover:bg-canvas-soft dark:hover:bg-white/5 active:scale-[0.99] ${
                  idx >= 3 ? 'hidden sm:flex' : 'flex'
                }`}
              >
                <span className="text-[13.5px] text-body-strong dark:text-on-dark font-normal leading-snug group-hover:text-ink dark:group-hover:text-white transition-colors">
                  {promptText}
                </span>
                <ArrowUpRight
                  size={15}
                  className="text-muted dark:text-muted-soft group-hover:text-ink dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: 40% Width - Waving Botanical Plant */}
        <div className="w-full md:w-[40%] flex items-center justify-center">
          <div className="relative flex items-center justify-center p-2">
            <img
              src="/image.png"
              alt={UI_STRINGS.BOTANICAL_IMAGE_ALT}
              className="max-h-[300px] sm:max-h-[380px] md:max-h-[420px] w-auto object-contain select-none pointer-events-none origin-bottom transform-gpu animate-gentle-sway drop-shadow-sm dark:invert dark:opacity-85 transition-all duration-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
