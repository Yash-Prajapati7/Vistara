import React from 'react';
import { ArrowUpRight, Leaf, Activity, ShieldAlert, FileSpreadsheet } from 'lucide-react';
import { SUGGESTION_PROMPTS } from '../../data/mockData';
import { SuggestionPrompt } from '../../types/chat';

interface EmptyStateProps {
  onSelectPrompt: (promptText: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectPrompt }) => {
  const getPromptIcon = (tag: string) => {
    switch (tag) {
      case 'Foliage Pathology':
        return <Leaf size={18} strokeWidth={1.8} />;
      case 'Physiological Stress':
        return <Activity size={18} strokeWidth={1.8} />;
      case 'Agronomic Treatment':
        return <ShieldAlert size={18} strokeWidth={1.8} />;
      case 'Cereal Pathology':
      default:
        return <FileSpreadsheet size={18} strokeWidth={1.8} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-[820px] w-full mx-auto px-5 py-6 text-center relative z-10">
      {/* 2x2 Feature Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left">
        {SUGGESTION_PROMPTS.map((prompt: SuggestionPrompt) => (
          <div
            key={prompt.id}
            onClick={() => onSelectPrompt(prompt.promptText)}
            className="group p-5 bg-surface-card dark:bg-surface-dark-elevated border border-hairline dark:border-white/10 rounded-2xl cursor-pointer transition-all duration-200 flex flex-col justify-between gap-3 shadow-subtle hover:-translate-y-0.5 hover:border-hairline-strong dark:hover:border-white/25 hover:shadow-soft"
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded-lg bg-surface-strong dark:bg-white/10 text-ink dark:text-on-dark flex items-center justify-center">
                {getPromptIcon(prompt.tag)}
              </div>

              <div className="text-muted dark:text-muted-soft group-hover:text-ink dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-150">
                <ArrowUpRight size={16} />
              </div>
            </div>

            <div>
              <div className="text-[14.5px] font-medium text-ink dark:text-on-dark mb-1 leading-snug">
                {prompt.title}
              </div>
              <div className="text-[12.5px] text-body dark:text-muted-soft leading-relaxed tracking-wide">
                {prompt.description}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider uppercase text-muted dark:text-muted-soft">
              <span>{prompt.tag}</span>
              <span className="font-medium text-muted-soft dark:text-white/40">
                {prompt.cropTarget}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
