import React, { useState, useRef, useEffect } from 'react';
import {
  Settings,
  LogOut,
  SlidersHorizontal,
  BookOpen,
  Key,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import { UserProfile } from '../../types/chat';
import { UI_STRINGS } from '../../constants/uiStrings';
import { useTheme } from '../../context/ThemeContext';

interface AccountSectionProps {
  user: UserProfile;
}

export const AccountSection: React.FC<AccountSectionProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isDark, toggleTheme } = useTheme();

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener(UI_STRINGS.EVENT_MOUSEDOWN, handleClickOutside);
    }
    return () => {
      document.removeEventListener(UI_STRINGS.EVENT_MOUSEDOWN, handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      ref={menuRef}
      className="relative px-3.5 py-3 border-t border-hairline dark:border-white/10 bg-canvas dark:bg-canvas-deep transition-colors duration-200"
    >
      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute bottom-[calc(100%+8px)] left-3 right-3 bg-surface-card dark:bg-surface-dark-elevated rounded-2xl border border-hairline dark:border-white/15 shadow-popover p-2 flex flex-col gap-0.5 z-50 animate-fade-in">
          {/* Diagnostic Scans Quota Summary */}
          <div className="px-2.5 pt-2 pb-2.5 border-b border-hairline-soft dark:border-white/10 mb-1">
            <div className="text-[11px] font-semibold tracking-wider text-muted dark:text-muted-soft uppercase">
              {UI_STRINGS.USAGE_BILLING}
            </div>
            <div className="text-xs text-ink dark:text-on-dark font-medium mt-1">
              {user.scansRemaining}
            </div>
          </div>

          {/* Dark Mode Toggle Item */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13px] text-body-strong dark:text-on-dark hover:bg-canvas-soft dark:hover:bg-surface-strong/25 transition-colors text-left"
          >
            {isDark ? (
              <Sun size={16} strokeWidth={1.7} className="text-gradient-peach" />
            ) : (
              <Moon size={16} strokeWidth={1.7} className="text-muted" />
            )}
            <span className="flex-1">
              {isDark ? UI_STRINGS.LIGHT_MODE : UI_STRINGS.DARK_MODE}
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-strong dark:bg-surface-dark text-muted dark:text-on-dark uppercase">
              {isDark ? UI_STRINGS.STATUS_ON : UI_STRINGS.STATUS_OFF}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13px] text-body-strong dark:text-on-dark-soft hover:bg-canvas-soft dark:hover:bg-surface-strong/25 hover:text-ink dark:hover:text-on-dark transition-colors text-left"
          >
            <BookOpen size={16} strokeWidth={1.7} className="text-muted dark:text-muted-soft" />
            <span className="flex-1">{UI_STRINGS.DISEASE_LIBRARY}</span>
            <ChevronRight size={13} className="text-muted-soft" />
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13px] text-body-strong dark:text-on-dark-soft hover:bg-canvas-soft dark:hover:bg-surface-strong/25 hover:text-ink dark:hover:text-on-dark transition-colors text-left"
          >
            <Key size={16} strokeWidth={1.7} className="text-muted dark:text-muted-soft" />
            <span className="flex-1">{UI_STRINGS.API_KEYS}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13px] text-body-strong dark:text-on-dark-soft hover:bg-canvas-soft dark:hover:bg-surface-strong/25 hover:text-ink dark:hover:text-on-dark transition-colors text-left"
          >
            <Settings size={16} strokeWidth={1.7} className="text-muted dark:text-muted-soft" />
            <span className="flex-1">{UI_STRINGS.SETTINGS}</span>
          </button>

          <div className="h-[1px] bg-hairline-soft dark:bg-white/10 my-1" />

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13px] text-semantic-error hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
          >
            <LogOut size={16} strokeWidth={1.7} />
            <span className="flex-1">{UI_STRINGS.SIGN_OUT}</span>
          </button>
        </div>
      )}

      {/* Main Account Row Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={UI_STRINGS.ACCOUNT}
        className={`flex items-center gap-2.5 w-full p-2 rounded-xl border transition-all duration-150 text-left cursor-pointer ${
          isOpen
            ? 'bg-canvas-soft dark:bg-surface-dark-elevated border-hairline dark:border-white/15'
            : 'border-transparent hover:bg-canvas-soft dark:hover:bg-surface-dark-elevated hover:border-hairline dark:hover:border-white/10'
        }`}
      >
        {/* Avatar circle with initials */}
        <div className="w-9 h-9 rounded-full bg-primary dark:bg-white text-on-primary dark:text-ink flex items-center justify-center text-[13px] font-medium tracking-wider flex-shrink-0">
          {user.initials}
        </div>

        {/* Name and role */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-medium text-ink dark:text-on-dark truncate">
              {user.name}
            </span>
            <span className="badge-pill text-[9px] px-1.5 py-0 leading-tight">
              {user.tier}
            </span>
          </div>

          <span className="text-[11px] text-muted dark:text-muted-soft truncate">
            {user.role}
          </span>
        </div>

        {/* Options icon */}
        <SlidersHorizontal
          size={15}
          strokeWidth={1.8}
          className="text-muted dark:text-muted-soft flex-shrink-0"
        />
      </button>
    </div>
  );
};
