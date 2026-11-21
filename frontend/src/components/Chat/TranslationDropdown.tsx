import React, { useRef, useEffect } from 'react';
import { Languages as LanguagesIcon } from 'lucide-react';
import { UI_STRINGS, SUPPORTED_LANGUAGES } from '../../constants/uiStrings';

interface TranslationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLanguage: (languageName: string, languageCode: string) => void;
}

export const TranslationDropdown: React.FC<TranslationDropdownProps> = ({
  isOpen,
  onClose,
  onSelectLanguage,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close popover on click outside or escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === UI_STRINGS.KEY_ESCAPE) {
        onClose();
      }
    };

    document.addEventListener(UI_STRINGS.EVENT_MOUSEDOWN, handleClickOutside);
    document.addEventListener(UI_STRINGS.EVENT_KEYDOWN, handleKeyDown);

    return () => {
      document.removeEventListener(UI_STRINGS.EVENT_MOUSEDOWN, handleClickOutside);
      document.removeEventListener(UI_STRINGS.EVENT_KEYDOWN, handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const indianLanguages = SUPPORTED_LANGUAGES.filter((lang) => lang.category === UI_STRINGS.LANG_CATEGORY_INDIAN);
  const internationalLanguages = SUPPORTED_LANGUAGES.filter((lang) => lang.category === UI_STRINGS.LANG_CATEGORY_INTERNATIONAL);

  return (
    <div
      ref={dropdownRef}
      className="absolute left-0 bottom-full mb-2 w-64 max-h-80 overflow-y-auto bg-surface-card dark:bg-surface-dark-elevated border border-hairline dark:border-white/10 rounded-2xl shadow-popover p-2 z-50 animate-fade-in backdrop-blur-md"
    >
      {/* Popover Header */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-hairline dark:border-white/10 text-xs font-medium text-ink dark:text-on-dark mb-1">
        <LanguagesIcon size={13} className="text-muted dark:text-muted-soft" />
        <span>{UI_STRINGS.TRANSLATE_DROPDOWN_TITLE}</span>
      </div>

      {/* Indian Languages Section */}
      <div className="py-1">
        <div className="px-2 py-1 text-[10px] font-semibold text-muted dark:text-muted-soft uppercase tracking-wider">
          {UI_STRINGS.CATEGORY_INDIAN_LANGUAGES}
        </div>
        <div className="space-y-0.5">
          {indianLanguages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => onSelectLanguage(lang.name, lang.code)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-surface-strong dark:hover:bg-white/5 transition-colors text-ink dark:text-on-dark cursor-pointer text-left font-body"
            >
              <span className="font-medium">{lang.native}</span>
              <span className="text-[11px] text-muted dark:text-muted-soft">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="my-1 border-t border-hairline dark:border-white/10" />

      {/* International Languages Section */}
      <div className="py-1">
        <div className="px-2 py-1 text-[10px] font-semibold text-muted dark:text-muted-soft uppercase tracking-wider">
          {UI_STRINGS.CATEGORY_INTERNATIONAL_LANGUAGES}
        </div>
        <div className="space-y-0.5">
          {internationalLanguages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => onSelectLanguage(lang.name, lang.code)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-surface-strong dark:hover:bg-white/5 transition-colors text-ink dark:text-on-dark cursor-pointer text-left font-body"
            >
              <span className="font-medium">{lang.native}</span>
              <span className="text-[11px] text-muted dark:text-muted-soft">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
