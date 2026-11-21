import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../../types/chat';
import { MessageItem } from './MessageItem';
import { EmptyState } from './EmptyState';

interface MessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSelectPrompt: (promptText: string) => void;
  onRegenerateLast?: () => void;
  onTranslate?: (message: ChatMessage, targetLanguage: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isStreaming,
  onSelectPrompt,
  onRegenerateLast,
  onTranslate,
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
            onTranslate={
              msg.role === 'assistant' && onTranslate
                ? (targetLanguage) => onTranslate(msg, targetLanguage)
                : undefined
            }
          />
        ))}

        <div ref={bottomRef} className="h-[1px]" />
      </div>
    </div>
  );
};
