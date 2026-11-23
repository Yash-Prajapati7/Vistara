import React, { useState, useRef, useEffect } from 'react';
import {
  Settings,
  LogOut,
  SlidersHorizontal,
  BookOpen,
  Key,
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon,
  Globe,
  Check,
} from 'lucide-react';
import { UserProfile } from '../../types/chat';
import { UI_STRINGS, SUPPORTED_LANGUAGES } from '../../constants/uiStrings';
import { useTheme } from '../../context/ThemeContext';

interface AccountSectionProps {
  user: UserProfile;
  responseLanguage: string;
  onSelectLanguage: (language: string) => void;
}

export const AccountSection: React.FC<AccountSectionProps> = ({
  user,
  responseLanguage,
  onSelectLanguage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isDark, toggleTheme } = useTheme();

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsLanguageMenuOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener(UI_STRINGS.EVENT_MOUSEDOWN, handleClickOutside);
    }
    return () => {
      document.removeEventListener(UI_STRINGS.EVENT_MOUSEDOWN, handleClickOutside);
    };
  }, [isOpen]);

  const standardLanguages = SUPPORTED_LANGUAGES.filter(
    (lang) => lang.category === UI_STRINGS.LANG_CATEGORY_STANDARD
  );
  const indianLanguages = SUPPORTED_LANGUAGES.filter(
    (lang) => lang.category === UI_STRINGS.LANG_CATEGORY_INDIAN
  );
  const internationalLanguages = SUPPORTED_LANGUAGES.filter(
    (lang) => lang.category === UI_STRINGS.LANG_CATEGORY_INTERNATIONAL
  );

  const activeLanguageOption = SUPPORTED_LANGUAGES.find(
    (l) => l.name.toLowerCase() === responseLanguage.toLowerCase()
  );

  return (
    <div
      ref={menuRef}
      className="relative px-3.5 py-3 border-t border-hairline dark:border-white/10 bg-canvas dark:bg-canvas-deep transition-colors duration-200"
    >
      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute bottom-[calc(100%+8px)] left-3 right-3 bg-surface-card dark:bg-surface-dark-elevated rounded-2xl border border-hairline dark:border-white/15 shadow-popover p-2 flex flex-col gap-0.5 z-50 animate-fade-in">
          {isLanguageMenuOpen ? (
            /* Submenu: Response Language Selection - styled matching TranslationDropdown */
            <div className="flex flex-col">
              {/* Header with back button */}
              <div className="flex items-center justify-between px-1.5 py-1.5 border-b border-hairline-soft dark:border-white/10 mb-1">
                <button
                  type="button"
                  onClick={() => setIsLanguageMenuOpen(false)}
                  className="flex items-center gap-1 text-xs font-medium text-body dark:text-on-dark hover:text-ink transition-colors cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>{UI_STRINGS.BACK}</span>
                </button>
                <div className="flex items-center gap-1.5 text-xs font-medium text-ink dark:text-on-dark">
                  <Globe size={13} className="text-muted dark:text-muted-soft" />
                  <span>{UI_STRINGS.RESPONSE_LANGUAGE_SELECT_TITLE}</span>
                </div>
              </div>

              {/* Scrollable Language List */}
              <div className="overflow-y-auto pr-1 max-h-[300px]">
                {/* Standard / Default Section */}
                <div className="py-0.5">
                  <div className="px-2 py-1 text-[10px] font-semibold text-muted dark:text-muted-soft uppercase tracking-wider">
                    {UI_STRINGS.CATEGORY_STANDARD_LANGUAGE}
                  </div>
                  <div className="space-y-0.5">
                    {standardLanguages.map((lang) => {
                      const isSelected = responseLanguage.toLowerCase() === lang.name.toLowerCase();
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            onSelectLanguage(lang.name);
                            setIsLanguageMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left font-body ${
                            isSelected
                              ? 'bg-surface-strong dark:bg-white/10 text-ink dark:text-on-dark font-medium'
                              : 'hover:bg-surface-strong dark:hover:bg-white/5 text-ink dark:text-on-dark'
                          }`}
                        >
                          <span className="font-medium">{lang.native}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-muted dark:text-muted-soft">{lang.name}</span>
                            {isSelected && <Check size={13} className="text-ink dark:text-on-dark" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Divider */}
                <div className="my-1 border-t border-hairline dark:border-white/10" />

                {/* Indian Languages Section */}
                <div className="py-0.5">
                  <div className="px-2 py-1 text-[10px] font-semibold text-muted dark:text-muted-soft uppercase tracking-wider">
                    {UI_STRINGS.CATEGORY_INDIAN_LANGUAGES}
                  </div>
                  <div className="space-y-0.5">
                    {indianLanguages.map((lang) => {
                      const isSelected = responseLanguage.toLowerCase() === lang.name.toLowerCase();
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            onSelectLanguage(lang.name);
                            setIsLanguageMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left font-body ${
                            isSelected
                              ? 'bg-surface-strong dark:bg-white/10 text-ink dark:text-on-dark font-medium'
                              : 'hover:bg-surface-strong dark:hover:bg-white/5 text-ink dark:text-on-dark'
                          }`}
                        >
                          <span className="font-medium">{lang.native}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-muted dark:text-muted-soft">{lang.name}</span>
                            {isSelected && <Check size={13} className="text-ink dark:text-on-dark" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Divider */}
                <div className="my-1 border-t border-hairline dark:border-white/10" />

                {/* International Languages Section */}
                <div className="py-0.5">
                  <div className="px-2 py-1 text-[10px] font-semibold text-muted dark:text-muted-soft uppercase tracking-wider">
                    {UI_STRINGS.CATEGORY_INTERNATIONAL_LANGUAGES}
                  </div>
                  <div className="space-y-0.5">
                    {internationalLanguages.map((lang) => {
                      const isSelected = responseLanguage.toLowerCase() === lang.name.toLowerCase();
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            onSelectLanguage(lang.name);
                            setIsLanguageMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left font-body ${
                            isSelected
                              ? 'bg-surface-strong dark:bg-white/10 text-ink dark:text-on-dark font-medium'
                              : 'hover:bg-surface-strong dark:hover:bg-white/5 text-ink dark:text-on-dark'
                          }`}
                        >
                          <span className="font-medium">{lang.native}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-muted dark:text-muted-soft">{lang.name}</span>
                            {isSelected && <Check size={13} className="text-ink dark:text-on-dark" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Main Account Popover View */
            <>
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

              {/* Global Response Language Row */}
              <button
                type="button"
                onClick={() => setIsLanguageMenuOpen(true)}
                className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13px] text-body-strong dark:text-on-dark hover:bg-canvas-soft dark:hover:bg-surface-strong/25 transition-colors text-left"
              >
                <Globe size={16} strokeWidth={1.7} className="text-muted dark:text-muted-soft" />
                <span className="flex-1">{UI_STRINGS.RESPONSE_LANGUAGE_LABEL}</span>
                <span className="text-[11px] font-medium text-ink dark:text-on-dark truncate max-w-[84px]">
                  {activeLanguageOption ? activeLanguageOption.native : responseLanguage}
                </span>
                <ChevronRight size={13} className="text-muted-soft" />
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
            </>
          )}
        </div>
      )}

      {/* Main Account Row Trigger */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setIsLanguageMenuOpen(false);
        }}
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

        {/* Name and tier badge */}
        <div className="flex-1 min-w-0 flex flex-col items-start">
          <span className="text-[13px] font-medium text-ink dark:text-on-dark truncate w-full text-left leading-tight">
            {user.name}
          </span>
          <span className="badge-pill text-[9px] px-1.5 py-0 leading-tight mt-0.5">
            {user.tier}
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
