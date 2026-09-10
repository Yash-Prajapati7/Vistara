import React, { useState } from 'react';
import {
  PanelLeftOpen,
  Share2,
  Trash2,
  ChevronDown,
  Check,
  Sprout,
  Sun,
  Moon,
} from 'lucide-react';
import { UI_STRINGS } from '../../constants/uiStrings';
import { useTheme } from '../../context/ThemeContext';

interface ChatHeaderProps {
  title: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onClearChat: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

const AVAILABLE_MODELS = [
  { id: 'vistara-v2', name: 'Vistara AgriVision 2.0 (Transformer VL)', tag: 'Vision-Language' },
  { id: 'vistara-path-pro', name: 'Vistara-Pathology Pro (High Res)', tag: 'Deep Lesion Segmentation' },
  { id: 'vistara-lite', name: 'Vistara FieldLite (Mobile Edge)', tag: 'Ultra Low Latency' },
  { id: 'vit-ensemble', name: 'ViT-Agronomy Ensemble', tag: 'Multi-Crop Zero-Shot' },
];

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  isSidebarOpen,
  onToggleSidebar,
  onClearChat,
  selectedModel,
  onSelectModel,
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <header className="h-16 flex items-center justify-between px-5 bg-canvas dark:bg-canvas-deep border-b border-hairline dark:border-white/10 relative z-20 transition-colors duration-200">
      {/* Left: Sidebar Toggle & Active Case Title */}
      <div className="flex items-center gap-3.5 min-w-0">
        {!isSidebarOpen && (
          <button
            type="button"
            className="btn-ghost-icon"
            onClick={onToggleSidebar}
            title={UI_STRINGS.EXPAND_SIDEBAR}
            aria-label={UI_STRINGS.EXPAND_SIDEBAR}
          >
            <PanelLeftOpen size={18} strokeWidth={1.8} />
          </button>
        )}

        <div className="flex items-center gap-2 min-w-0">
          <h2 className="font-display text-[22px] font-normal tracking-tight text-ink dark:text-on-dark truncate">
            {title}
          </h2>
        </div>
      </div>

      {/* Center / Right: Model Selector & Actions */}
      <div className="flex items-center gap-2.5">
        {/* Model Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-card dark:bg-surface-dark-elevated border border-hairline dark:border-white/15 rounded-pill text-[13px] font-medium text-ink dark:text-on-dark cursor-pointer transition-colors hover:border-hairline-strong dark:hover:border-white/30 shadow-subtle"
          >
            <Sprout size={13} className="text-primary dark:text-gradient-mint" />
            <span className="hidden sm:inline">{selectedModel}</span>
            <span className="sm:hidden">Model</span>
            <ChevronDown size={13} className="text-muted dark:text-muted-soft" />
          </button>

          {modelDropdownOpen && (
            <div className="absolute top-[calc(100%+6px)] right-0 w-72 bg-surface-card dark:bg-surface-dark-elevated border border-hairline dark:border-white/15 rounded-2xl shadow-popover p-1.5 z-60 animate-fade-in">
              {AVAILABLE_MODELS.map((model) => (
                <div
                  key={model.id}
                  onClick={() => {
                    onSelectModel(model.name);
                    setModelDropdownOpen(false);
                  }}
                  className={`p-2.5 rounded-lg cursor-pointer flex items-center justify-between text-[13px] transition-colors ${
                    selectedModel === model.name
                      ? 'bg-canvas-soft dark:bg-surface-strong/30 text-ink dark:text-on-dark font-semibold'
                      : 'text-ink dark:text-on-dark-soft hover:bg-canvas-soft dark:hover:bg-surface-strong/20 font-normal'
                  }`}
                >
                  <div>
                    <div>{model.name}</div>
                    <div className="text-[11px] text-muted dark:text-muted-soft">{model.tag}</div>
                  </div>
                  {selectedModel === model.name && (
                    <Check size={14} className="text-ink dark:text-on-dark" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dark Mode Quick Toggle Button */}
        <button
          type="button"
          className="btn-ghost-icon"
          onClick={toggleTheme}
          title={isDark ? UI_STRINGS.SWITCH_TO_LIGHT : UI_STRINGS.SWITCH_TO_DARK}
          aria-label={isDark ? UI_STRINGS.SWITCH_TO_LIGHT : UI_STRINGS.SWITCH_TO_DARK}
        >
          {isDark ? (
            <Sun size={17} strokeWidth={1.8} className="text-gradient-peach" />
          ) : (
            <Moon size={17} strokeWidth={1.8} className="text-muted" />
          )}
        </button>

        {/* Share Button */}
        <button
          type="button"
          className="btn-ghost-icon"
          onClick={handleShare}
          title={copiedShare ? UI_STRINGS.COPIED : UI_STRINGS.SHARE}
          aria-label={UI_STRINGS.SHARE}
        >
          {copiedShare ? (
            <Check size={16} className="text-semantic-success" />
          ) : (
            <Share2 size={16} strokeWidth={1.8} />
          )}
        </button>

        {/* Clear Conversation Button */}
        <button
          type="button"
          className="btn-ghost-icon"
          onClick={onClearChat}
          title={UI_STRINGS.CLEAR_CONVERSATION}
          aria-label={UI_STRINGS.CLEAR_CONVERSATION}
        >
          <Trash2 size={16} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
};
