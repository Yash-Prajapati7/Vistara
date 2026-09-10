import React, { useState } from 'react';
import { MessageSquare, Trash2, Edit3, Check, X } from 'lucide-react';
import { ConversationMeta, TimeBucket } from '../../types/chat';
import { UI_STRINGS } from '../../constants/uiStrings';

interface ChatHistoryProps {
  conversations: ConversationMeta[];
  activeId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onRename,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartRename = (conv: ConversationMeta, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
  };

  const groups: { key: TimeBucket; label: string }[] = [
    { key: UI_STRINGS.TIME_BUCKET_TODAY, label: UI_STRINGS.TIME_TODAY },
    { key: UI_STRINGS.TIME_BUCKET_YESTERDAY, label: UI_STRINGS.TIME_YESTERDAY },
    { key: UI_STRINGS.TIME_BUCKET_PREVIOUS_WEEK, label: UI_STRINGS.TIME_PREVIOUS_WEEK },
  ];

  if (conversations.length === 0) {
    return (
      <div className="py-6 px-3 text-center text-muted text-[13px] font-body">
        {UI_STRINGS.NO_CHATS_FOUND}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-1 pt-2 pb-4 flex flex-col gap-4">
      {groups.map((group) => {
        const items = conversations.filter((c) => c.timeBucket === group.key);
        if (items.length === 0) return null;

        return (
          <div key={group.key} className="flex flex-col gap-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.8px] text-muted-soft px-2.5 py-1 font-body">
              {group.label}
            </div>

            {items.map((conv) => {
              const isActive = conv.id === activeId;
              const isEditing = conv.id === editingId;

              return (
                <div
                  key={conv.id}
                  onClick={() => !isEditing && onSelect(conv.id)}
                  className={`group relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all duration-150 border ${
                    isActive
                      ? 'bg-surface-card border-hairline shadow-subtle'
                      : 'bg-transparent border-transparent hover:bg-canvas-soft'
                  }`}
                >
                  <MessageSquare
                    size={15}
                    strokeWidth={1.8}
                    className={`flex-shrink-0 ${
                      isActive ? 'text-ink' : 'text-muted'
                    }`}
                  />

                  {isEditing ? (
                    <div
                      className="flex items-center gap-1 w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        autoFocus
                        className="flex-1 text-[13px] px-1.5 py-0.5 border border-hairline-strong rounded bg-surface-card text-ink outline-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(conv.id, e);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => handleSaveRename(conv.id, e)}
                        title={UI_STRINGS.SAVE}
                        className="text-semantic-success hover:opacity-80 p-0.5"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelRename}
                        title={UI_STRINGS.CANCEL}
                        className="text-muted hover:text-ink p-0.5"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <span
                          className={`text-[13.5px] truncate tracking-[0.12px] ${
                            isActive
                              ? 'text-ink font-medium'
                              : 'text-body font-normal'
                          }`}
                        >
                          {conv.title}
                        </span>
                        {conv.cropType && (
                          <span className="text-[10.5px] text-muted truncate">
                            {conv.cropType}
                          </span>
                        )}
                      </div>

                      <div
                        className={`flex items-center gap-1 transition-opacity duration-150 ${
                          isActive
                            ? 'opacity-90'
                            : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={(e) => handleStartRename(conv, e)}
                          title={UI_STRINGS.RENAME}
                          aria-label={UI_STRINGS.RENAME}
                          className="p-1 text-muted hover:text-ink rounded transition-colors"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(conv.id, e)}
                          title={UI_STRINGS.DELETE}
                          aria-label={UI_STRINGS.DELETE}
                          className="p-1 text-muted hover:text-semantic-error rounded transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
