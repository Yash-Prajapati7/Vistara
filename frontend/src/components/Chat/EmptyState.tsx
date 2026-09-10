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
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-surface-card border border-hairline shadow-subtle mb-5 text-[11px] font-semibold tracking-wider text-ink uppercase">
        <Sprout size={13} className="text-ink" />
        <span>Vistara Vision-Language Diagnostic System</span>
      </div>

      {/* Editorial Headline (EB Garamond 300) */}
      <h1 className="font-display text-4xl sm:text-[44px] font-light leading-[1.1] tracking-tight text-ink mb-4 max-w-[700px]">
        Transformer-based Intelligence for Crop Pathology & Disease Recognition
      </h1>

      {/* Editorial Subtitle (Inter 400 with letter-spacing) */}
      <p className="font-body text-[15.5px] font-normal leading-relaxed tracking-wide text-body max-w-[600px] mb-9">
        Upload high-resolution leaf or plant imagery to identify causal pathogens, evaluate foliar lesion severity, and generate evidence-based agronomic treatment regimens.
      </p>

      {/* 2x2 Feature Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left">
        {SUGGESTION_PROMPTS.map((prompt: SuggestionPrompt) => (
          <div
            key={prompt.id}
            onClick={() => onSelectPrompt(prompt.promptText)}
            className="group p-5 bg-surface-card border border-hairline rounded-2xl cursor-pointer transition-all duration-200 flex flex-col justify-between gap-3 shadow-subtle hover:-translate-y-0.5 hover:border-hairline-strong hover:shadow-soft"
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded-lg bg-surface-strong text-ink flex items-center justify-center">
                {getPromptIcon(prompt.tag)}
              </div>

              <div className="text-muted group-hover:text-ink group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-150">
                <ArrowUpRight size={16} />
              </div>
            </div>

            <div>
              <div className="text-[14.5px] font-medium text-ink mb-1 leading-snug">
                {prompt.title}
              </div>
              <div className="text-[12.5px] text-body leading-relaxed tracking-wide">
                {prompt.description}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider uppercase text-muted">
              <span>{prompt.tag}</span>
              <span className="font-medium text-muted-soft">
                {prompt.cropTarget}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
