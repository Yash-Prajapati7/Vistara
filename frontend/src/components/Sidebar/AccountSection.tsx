import React, { useState, useRef, useEffect } from 'react';
import {
  Settings,
  LogOut,
  SlidersHorizontal,
  BookOpen,
  Key,
  ChevronRight,
} from 'lucide-react';
import { UserProfile } from '../../types/chat';
import { UI_STRINGS } from '../../constants/uiStrings';

interface AccountSectionProps {
  user: UserProfile;
}

export const AccountSection: React.FC<AccountSectionProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      ref={menuRef}
      className="relative px-3.5 py-3 border-t border-hairline bg-canvas"
    >
      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute bottom-[calc(100%+8px)] left-3 right-3 bg-surface-card rounded-2xl border border-hairline shadow-popover p-2 flex flex-col gap-0.5 z-50 animate-fade-in">
          {/* Diagnostic Scans Quota Summary */}
          <div className="px-2.5 pt-2 pb-2.5 border-b border-hairline-soft mb-1">
            <div className="text-[11px] font-semibold tracking-wider text-muted uppercase">
              {UI_STRINGS.USAGE_BILLING}
            </div>
            <div className="text-xs text-ink font-medium mt-1">
              {user.scansRemaining}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13px] text-body-strong hover:bg-canvas-soft transition-colors text-left"
          >
            <BookOpen size={16} strokeWidth={1.7} className="text-muted" />
            <span className="flex-1">{UI_STRINGS.DISEASE_LIBRARY}</span>
            <ChevronRight size={13} className="text-muted-soft" />
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13px] text-body-strong hover:bg-canvas-soft transition-colors text-left"
          >
            <Key size={16} strokeWidth={1.7} className="text-muted" />
            <span className="flex-1">{UI_STRINGS.API_KEYS}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13px] text-body-strong hover:bg-canvas-soft transition-colors text-left"
          >
            <Settings size={16} strokeWidth={1.7} className="text-muted" />
            <span className="flex-1">{UI_STRINGS.SETTINGS}</span>
          </button>

          <div className="h-[1px] bg-hairline-soft my-1" />

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13px] text-semantic-error hover:bg-red-50 transition-colors text-left"
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
            ? 'bg-canvas-soft border-hairline'
            : 'border-transparent hover:bg-canvas-soft hover:border-hairline'
        }`}
      >
        {/* Avatar circle with initials */}
        <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center text-[13px] font-medium tracking-wider flex-shrink-0">
          {user.initials}
        </div>

        {/* Name and role */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-medium text-ink truncate">
              {user.name}
            </span>
            <span className="badge-pill text-[9px] px-1.5 py-0 leading-tight">
              {user.tier}
            </span>
          </div>

          <span className="text-[11px] text-muted truncate">
            {user.role}
          </span>
        </div>

        {/* Options icon */}
        <SlidersHorizontal
          size={15}
          strokeWidth={1.8}
          className="text-muted flex-shrink-0"
        />
      </button>
    </div>
  );
};
