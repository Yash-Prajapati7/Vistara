import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ChatHeader } from './components/Chat/ChatHeader';
import { MessageList } from './components/Chat/MessageList';
import { ChatInput } from './components/InputDeck/ChatInput';
import { AtmosphericOrbs } from './components/AtmosphericOrbs';
import {
  INITIAL_CONVERSATIONS,
  INITIAL_USER_PROFILE,
  SAMPLE_INITIAL_MESSAGES,
} from './data/mockData';
import { ChatMessage, ConversationMeta, DiagnosticData, ImageAttachment } from './types/chat';
import { UI_STRINGS } from './constants/uiStrings';
import { chatService } from './services/chatService';

export const App: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationMeta[]>(INITIAL_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<string>('conv-1');
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(SAMPLE_INITIAL_MESSAGES);
  const [userProfile] = useState(INITIAL_USER_PROFILE);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>(UI_STRINGS.MODEL_DEFAULT);
  const [isStreaming, setIsStreaming] = useState(false);

  // Current active conversation meta
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const activeMessages = messagesMap[activeConversationId] || [];

  // Create a new crop diagnostic session
  const handleNewChat = () => {
    const newId = `conv-${Date.now()}`;
    const newConv: ConversationMeta = {
      id: newId,
      title: UI_STRINGS.DEFAULT_CASE_TITLE,
      updatedAt: 'Just now',
      previewSnippet: 'Fresh session ready for crop leaf photos and disease symptoms...',
      timeBucket: 'today',
      cropType: 'Unspecified',
    };

    setConversations((prev) => [newConv, ...prev]);
    setMessagesMap((prev) => ({ ...prev, [newId]: [] }));
    setActiveConversationId(newId);
  };

  // Switch active conversation
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  // Delete conversation
  const handleDeleteConversation = (id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);

    const updatedMessages = { ...messagesMap };
    delete updatedMessages[id];
    setMessagesMap(updatedMessages);

    // Delete session from backend context in background
    chatService.deleteSessionContext(id).catch(() => {});

    if (activeConversationId === id) {
      if (updated.length > 0) {
        setActiveConversationId(updated[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  // Rename conversation title
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  };

  // Clear messages in current conversation
  const handleClearChat = () => {
    chatService.deleteSessionContext(activeConversationId).catch(() => {});
    setMessagesMap((prev) => ({ ...prev, [activeConversationId]: [] }));
  };

  // Send message and trigger assistant response
  const handleSendMessage = (text: string, image?: ImageAttachment) => {
    const userMessageId = `msg-u-${Date.now()}`;
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMessage: ChatMessage = {
      id: userMessageId,
      role: UI_STRINGS.ROLE_USER,
      content: text,
      timestamp: timeFormatted,
      imageAttachment: image,
    };

    // Update conversation title if it's currently generic
    if (activeConversation && (activeConversation.title === UI_STRINGS.DEFAULT_CASE_TITLE || activeMessages.length === 0)) {
      const derivedTitle = text.slice(0, 34) || (image ? UI_STRINGS.DERIVED_TITLE_LEAF_SCAN : UI_STRINGS.DERIVED_TITLE_CROP_ANALYSIS);
      handleRenameConversation(activeConversationId, derivedTitle);
    }

    const nextMessages = [...activeMessages, newUserMessage];
    setMessagesMap((prev) => ({
      ...prev,
      [activeConversationId]: nextMessages,
    }));

    // Trigger live vision-language diagnostic streaming via backend
    setIsStreaming(true);

    const assistantMessageId = `msg-a-${Date.now()}`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: UI_STRINGS.ROLE_ASSISTANT,
      content: UI_STRINGS.EMPTY_STRING,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
      thinkingContent: UI_STRINGS.EMPTY_STRING,
      isThinking: true,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [activeConversationId]: [...nextMessages, initialAssistantMessage],
    }));

    chatService.streamChatMessage({
      sessionId: activeConversationId,
      prompt: text,
      imageAttachment: image,
      modelId: UI_STRINGS.MODEL_ID_QWEN,
      callbacks: {
        onThinkingDelta: (delta: string) => {
          setMessagesMap((prev) => {
            const currentList = prev[activeConversationId] || [];
            return {
              ...prev,
              [activeConversationId]: currentList.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      thinkingContent: (msg.thinkingContent || UI_STRINGS.EMPTY_STRING) + delta,
                      isThinking: true,
                    }
                  : msg
              ),
            };
          });
        },
        onTextDelta: (delta: string) => {
          setMessagesMap((prev) => {
            const currentList = prev[activeConversationId] || [];
            return {
              ...prev,
              [activeConversationId]: currentList.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: msg.content + delta,
                      isThinking: false,
                    }
                  : msg
              ),
            };
          });
        },
        onDiagnosticData: (diagnosticData: DiagnosticData, markdownReport: string) => {
          setMessagesMap((prev) => {
            const currentList = prev[activeConversationId] || [];
            return {
              ...prev,
              [activeConversationId]: currentList.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: markdownReport || msg.content,
                      diagnosticData,
                      isThinking: false,
                    }
                  : msg
              ),
            };
          });
        },
        onError: (errorMessage: string) => {
          setIsStreaming(false);
          setMessagesMap((prev) => {
            const currentList = prev[activeConversationId] || [];
            return {
              ...prev,
              [activeConversationId]: currentList.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: msg.content
                        ? `${msg.content}\n\n### ${UI_STRINGS.DIAGNOSTIC_ALERT_TITLE}\n* ${UI_STRINGS.DIAGNOSTIC_STREAM_INTERRUPTED_LABEL}: ${errorMessage}`
                        : `### ${UI_STRINGS.DIAGNOSTIC_SERVICE_NOTICE_TITLE}\n\n${errorMessage}\n\n*${UI_STRINGS.BACKEND_START_INSTRUCTIONS}*`,
                      isStreaming: false,
                      isThinking: false,
                    }
                  : msg
              ),
            };
          });
        },
        onComplete: () => {
          setIsStreaming(false);
          setMessagesMap((prev) => {
            const currentList = prev[activeConversationId] || [];
            return {
              ...prev,
              [activeConversationId]: currentList.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, isStreaming: false, isThinking: false }
                  : msg
              ),
            };
          });
        },
      },
    });
  };

  const handleSelectPrompt = (promptText: string) => {
    handleSendMessage(promptText);
  };

  return (
    <div className="flex h-screen w-screen relative bg-canvas dark:bg-canvas-deep overflow-hidden transition-colors duration-200">
      {/* Signature Atmospheric Background Orbs */}
      <AtmosphericOrbs />

      {/* Left Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        user={userProfile}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
      />

      {/* Main Center Chat View */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative z-10 bg-transparent">
        {/* Top Header */}
        <ChatHeader
          title={activeConversation?.title || UI_STRINGS.APP_TITLE}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onClearChat={handleClearChat}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
        />

        {/* Scrollable Message List / Empty State */}
        <MessageList
          messages={activeMessages}
          isStreaming={isStreaming}
          onSelectPrompt={handleSelectPrompt}
          onRegenerateLast={() => {
            if (activeMessages.length > 0) {
              const lastUserMsg = [...activeMessages].reverse().find((m) => m.role === 'user');
              if (lastUserMsg) {
                handleSendMessage(lastUserMsg.content, lastUserMsg.imageAttachment);
              }
            }
          }}
        />

        {/* Center Floating Input Deck */}
        <ChatInput onSendMessage={handleSendMessage} disabled={isStreaming} />
      </main>
    </div>
  );
};
