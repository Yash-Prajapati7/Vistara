import React, { useState } from 'react';
import { Plus, Sprout, PanelLeftClose } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { ChatHistory } from './ChatHistory';
import { AccountSection } from './AccountSection';
import { ConversationMeta, UserProfile } from '../../types/chat';
import { UI_STRINGS } from '../../constants/uiStrings';

interface SidebarProps {
  conversations: ConversationMeta[];
  activeConversationId: string;
  user: UserProfile;
  isOpen: boolean;
  onToggle: () => void;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  user,
  isOpen,
  onToggle,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter conversations based on search
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (conv.cropType && conv.cropType.toLowerCase().includes(searchQuery.toLowerCase().trim()))
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-ink/25 backdrop-blur-[2px] z-40 md:hidden"
        />
      )}

      <aside
        className={`relative flex flex-col h-full bg-canvas border-r border-hairline transition-all duration-200 ease-out overflow-hidden z-45 ${
          isOpen
            ? 'w-[280px] min-w-[280px]'
            : 'w-0 min-w-0 border-r-0'
        }`}
      >
        {/* Top Branding & Collapse button */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-hairline flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-ink text-on-primary flex items-center justify-center flex-shrink-0">
              <Sprout size={18} strokeWidth={2.2} />
            </div>
            <div>
              <div className="font-display text-xl font-medium tracking-tight leading-none text-ink">
                {UI_STRINGS.BRAND_NAME}
              </div>
              <div className="text-[10px] text-muted tracking-wider font-semibold uppercase mt-0.5">
                Agricultural VL System
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-ghost-icon"
            onClick={onToggle}
            title={UI_STRINGS.COLLAPSE_SIDEBAR}
            aria-label={UI_STRINGS.COLLAPSE_SIDEBAR}
          >
            <PanelLeftClose size={18} strokeWidth={1.8} />
          </button>
        </div>

        {/* New Diagnosis Primary Pill CTA */}
        <div className="p-3.5 pb-2.5">
          <button
            type="button"
            className="btn-primary w-full shadow-subtle"
            onClick={onNewChat}
          >
            <Plus size={16} strokeWidth={2.2} />
            <span>{UI_STRINGS.NEW_ANALYSIS}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-3.5 py-1 pb-2">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
          />
        </div>

        {/* Case History List */}
        <ChatHistory
          conversations={filteredConversations}
          activeId={activeConversationId}
          onSelect={onSelectConversation}
          onDelete={onDeleteConversation}
          onRename={onRenameConversation}
        />

        {/* Accounts Section at bottom-left */}
        <AccountSection user={user} />
      </aside>
    </>
  );
};
