import React from 'react';
import { Search, X } from 'lucide-react';
import { UI_STRINGS } from '../../constants/uiStrings';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onClear }) => {
  return (
    <div className="relative flex items-center w-full">
      <Search
        size={16}
        strokeWidth={1.8}
        className="absolute left-3 text-muted pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={UI_STRINGS.SEARCH_PLACEHOLDER}
        aria-label={UI_STRINGS.SEARCH_PLACEHOLDER}
        className="w-full h-[38px] pl-9 text-[13px] font-body text-ink dark:text-on-dark bg-surface-card dark:bg-surface-dark-elevated border border-hairline dark:border-white/10 rounded-pill transition-all duration-150 focus:border-hairline-strong dark:focus:border-white/25 focus:shadow-subtle outline-none placeholder:text-muted dark:placeholder:text-muted-soft"
        style={{ paddingRight: value ? '32px' : '56px' }}
      />

      {value ? (
        <button
          type="button"
          onClick={onClear}
          aria-label={UI_STRINGS.CLEAR_CONVERSATION}
          className="absolute right-2.5 p-0.5 text-muted dark:text-muted-soft hover:text-ink dark:hover:text-white cursor-pointer bg-transparent border-0 flex items-center justify-center transition-colors"
        >
          <X size={14} />
        </button>
      ) : (
        <span className="absolute right-2.5 text-[10px] font-medium text-muted-soft dark:text-muted-soft px-1.5 py-0.5 bg-canvas-soft dark:bg-surface-dark border border-hairline dark:border-white/10 rounded font-body pointer-events-none">
          {UI_STRINGS.SEARCH_HINT}
        </span>
      )}
    </div>
  );
};
