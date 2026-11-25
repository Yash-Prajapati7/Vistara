import React, { useState, useRef, useEffect } from 'react';
import {
  PanelLeftOpen,
  Share2,
  Trash2,
  ChevronDown,
  Check,
  Sun,
  Moon,
  Sparkles,
  Zap,
  Microscope,
} from 'lucide-react';
import { UI_STRINGS } from '../../constants/uiStrings';
import { useTheme } from '../../context/ThemeContext';

interface ChatHeaderProps {
  title: string;
  isSidebarOpen: boolean;
  hasActiveSession: boolean;
  onToggleSidebar: () => void;
  onClearChat: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

const AVAILABLE_MODELS = [
  {
    id: 'auto',
    name: UI_STRINGS.MODEL_AUTO,
    description: UI_STRINGS.MODEL_AUTO_DESC,
    icon: Sparkles,
  },
  {
    id: 'quick',
    name: UI_STRINGS.MODEL_QUICK,
    description: UI_STRINGS.MODEL_QUICK_DESC,
    icon: Zap,
  },
  {
    id: 'expert',
    name: UI_STRINGS.MODEL_EXPERT,
    description: UI_STRINGS.MODEL_EXPERT_DESC,
    icon: Microscope,
  },
];

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  isSidebarOpen,
  hasActiveSession,
  onToggleSidebar,
  onClearChat,
  selectedModel,
  onSelectModel,
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasActiveSession && copiedShare) {
      setCopiedShare(false);
    }
  }, [hasActiveSession, copiedShare]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setModelDropdownOpen(false);
      }
    };
    if (modelDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modelDropdownOpen]);

  const activeModelObj = AVAILABLE_MODELS.find((m) => m.name === selectedModel) || AVAILABLE_MODELS[0];
  const ActiveIcon = activeModelObj.icon;

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
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-card dark:bg-surface-dark-elevated border border-hairline dark:border-white/15 rounded-pill text-[13px] font-medium text-ink dark:text-on-dark cursor-pointer transition-colors hover:border-hairline-strong dark:hover:border-white/30 shadow-subtle select-none"
          >
            <ActiveIcon size={13} className="text-primary dark:text-white flex-shrink-0" />
            <span>{activeModelObj.name}</span>
            <ChevronDown size={13} className="text-muted dark:text-muted-soft flex-shrink-0" />
          </button>

          {modelDropdownOpen && (
            <div className="absolute top-[calc(100%+6px)] right-0 w-80 bg-surface-card dark:bg-surface-dark-elevated border border-hairline dark:border-white/15 rounded-2xl shadow-popover p-1.5 z-60 animate-fade-in flex flex-col gap-1">
              {AVAILABLE_MODELS.map((model) => {
                const isSelected = selectedModel === model.name;
                const IconComponent = model.icon;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      onSelectModel(model.name);
                      setModelDropdownOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl cursor-pointer flex items-start gap-2.5 text-left transition-colors select-none ${
                      isSelected
                        ? 'bg-canvas-soft dark:bg-white/10 text-ink dark:text-on-dark font-medium'
                        : 'text-ink dark:text-on-dark-soft hover:bg-canvas-soft dark:hover:bg-white/5'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-primary text-white dark:bg-white dark:text-ink'
                          : 'bg-surface-strong dark:bg-white/10 text-muted dark:text-muted-soft'
                      }`}
                    >
                      <IconComponent size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[13px] ${
                            isSelected
                              ? 'font-semibold text-ink dark:text-white'
                              : 'font-medium text-ink dark:text-on-dark'
                          }`}
                        >
                          {model.name}
                        </span>
                        {isSelected && (
                          <Check size={14} className="text-primary dark:text-white flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted dark:text-muted-soft mt-0.5 leading-snug">
                        {model.description}
                      </p>
                    </div>
                  </button>
                );
              })}
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

        {hasActiveSession && (
          <>
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
          </>
        )}
      </div>
    </header>
  );
};
