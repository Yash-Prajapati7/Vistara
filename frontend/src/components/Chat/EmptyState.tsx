import React from 'react';
import { Sprout, ArrowUpRight, Leaf, Activity, ShieldAlert, FileSpreadsheet } from 'lucide-react';
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
    <div className="flex flex-col items-center justify-center max-w-[820px] mx-auto px-5 pt-9 pb-5 text-center relative z-10">
      {/* Decorative Brand Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-surface-card dark:bg-surface-dark-elevated border border-hairline dark:border-white/10 shadow-subtle mb-5 text-[11px] font-semibold tracking-wider text-ink dark:text-on-dark uppercase">
        <Sprout size={13} className="text-ink dark:text-on-dark" />
        <span>Vistara Vision-Language Diagnostic System</span>
      </div>

      {/* Editorial Headline (EB Garamond 300) */}
      <h1 className="font-display text-4xl sm:text-[44px] font-light leading-[1.1] tracking-tight text-ink dark:text-on-dark mb-4 max-w-[700px]">
        Transformer-based Intelligence for Crop Pathology & Disease Recognition
      </h1>

      {/* Editorial Subtitle (Inter 400 with letter-spacing) */}
      <p className="font-body text-[15.5px] font-normal leading-relaxed tracking-wide text-body dark:text-muted-soft max-w-[600px] mb-9">
        Upload high-resolution leaf or plant imagery to identify causal pathogens, evaluate foliar lesion severity, and generate evidence-based agronomic treatment regimens.
      </p>

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
