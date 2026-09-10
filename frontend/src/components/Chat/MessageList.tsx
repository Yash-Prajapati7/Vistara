import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { ChatMessage } from '../../types/chat';
import { MessageItem } from './MessageItem';
import { EmptyState } from './EmptyState';
import { UI_STRINGS } from '../../constants/uiStrings';

interface MessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSelectPrompt: (promptText: string) => void;
  onRegenerateLast?: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isStreaming,
  onSelectPrompt,
  onRegenerateLast,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto flex flex-col justify-center">
        <EmptyState onSelectPrompt={onSelectPrompt} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:pb-4 flex flex-col items-center">
      <div className="w-full max-w-[780px]">
        {messages.map((msg, idx) => (
          <MessageItem
            key={msg.id}
            message={msg}
            onRegenerate={
              idx === messages.length - 1 && msg.role === 'assistant'
                ? onRegenerateLast
                : undefined
            }
          />
        ))}

        {/* Live streaming indicator */}
        {isStreaming && (
          <div className="flex items-center gap-2.5 px-4 py-3 bg-surface-card dark:bg-surface-dark-elevated border border-hairline dark:border-white/10 rounded-2xl shadow-subtle w-fit mb-6 animate-fade-in">
            <Sparkles size={16} className="text-primary dark:text-gradient-mint animate-spin-slow" />
            <span className="text-[13.5px] text-body dark:text-muted-soft italic tracking-wide">
              {UI_STRINGS.GENERATING_RESPONSE}
            </span>
          </div>
        )}

        <div ref={bottomRef} className="h-[1px]" />
      </div>
    </div>
  );
};
