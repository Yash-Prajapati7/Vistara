import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ChatHeader } from './components/Chat/ChatHeader';
import { MessageList } from './components/Chat/MessageList';
import { ChatInput } from './components/InputDeck/ChatInput';
import { DeleteConfirmModal } from './components/Modal/DeleteConfirmModal';
import {
  INITIAL_USER_PROFILE,
} from './data/mockData';
import { ChatMessage, ConversationMeta, DiagnosticData, ImageAttachment, VideoAttachment } from './types/chat';
import { UI_STRINGS } from './constants/uiStrings';
import { chatService } from './services/chatService';

interface RawTurn {
  turnId: string;
  prompt: string;
  completion?: string;
  imageBase64?: string;
  imageMeta?: { name?: string };
  videoBase64?: string;
  videoMeta?: { name?: string };
  thinkingContent?: string;
  diagnosticData?: DiagnosticData;
  timestamp?: string;
}

interface UserConversationSummary {
  sessionId: string;
  title: string;
  cropType?: string;
  updatedAt: string;
  previewSnippet: string;
  turnCount?: number;
}

/**
 * Formats a timestamp string using centralized 2-digit time constants.
 */
const formatTimestamp = (dateInput?: string | Date): string => {
  const date = dateInput ? new Date(dateInput) : new Date();
  return date.toLocaleTimeString([], {
    hour: UI_STRINGS.TIME_FORMAT_2_DIGIT,
    minute: UI_STRINGS.TIME_FORMAT_2_DIGIT,
  });
};

/**
 * Intelligently derives a clean, context-appropriate title for a chat session.
 * Conversational inquiries (greetings, identity questions) receive "General Consultation".
 * Video uploads start as "Field Video Diagnostic Scan".
 * Photo uploads start as "Leaf Specimen Scan" until diagnosed.
 */
const deriveChatTitle = (prompt: string, hasImage: boolean, hasVideo: boolean = false): string => {
  if (hasVideo) {
    return UI_STRINGS.DERIVED_TITLE_VIDEO_SCAN;
  }

  if (hasImage) {
    return UI_STRINGS.DERIVED_TITLE_LEAF_SCAN;
  }

  const trimmed = prompt.trim();
  if (!trimmed) {
    return UI_STRINGS.DEFAULT_CASE_TITLE;
  }

  const GREETING_REGEX = /^(hi|hello|hey|good\s+(morning|afternoon|evening|day)|greetings|howdy|what'?s\s+up|yo)\b/i;
  const IDENTITY_REGEX = /^(who\s+are\s+you|what\s+are\s+you|what\s+can\s+you\s+do|tell\s+me\s+about\s+yourself|help|introduce\s+yourself|how\s+are\s+you)\b/i;

  if (GREETING_REGEX.test(trimmed) || IDENTITY_REGEX.test(trimmed)) {
    return UI_STRINGS.TITLE_GENERAL_CONSULTATION;
  }

  const cleanPrompt = trimmed
    .replace(/^(can\s+you\s+(help\s+me\s+with|tell\s+me\s+about|explain)|please\s+tell\s+me\s+about|what\s+is\s+the|what\s+are\s+the|how\s+to|how\s+do\s+i)\s+/i, UI_STRINGS.EMPTY_STRING)
    .replace(/[?.!,;:]+$/, UI_STRINGS.EMPTY_STRING)
    .trim();

  if (cleanPrompt.length < 3) {
    return UI_STRINGS.TITLE_AGRONOMIC_CONSULTATION;
  }

  const titleCased = cleanPrompt
    .split(/\s+/)
    .slice(0, 5)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return titleCased.length > 36 ? `${titleCased.substring(0, 33)}...` : titleCased;
};

/**
 * Factory creating a fresh blank diagnostic conversation.
 */
const createInitialBlankSession = (): { id: string; meta: ConversationMeta } => {
  const id = `${UI_STRINGS.PREFIX_CONVERSATION}${Date.now()}`;
  return {
    id,
    meta: {
      id,
      title: UI_STRINGS.DEFAULT_CASE_TITLE,
      updatedAt: UI_STRINGS.TIME_JUST_NOW,
      previewSnippet: UI_STRINGS.FRESH_SESSION_SNIPPET,
      timeBucket: UI_STRINGS.TIME_BUCKET_TODAY,
      cropType: UI_STRINGS.CROP_UNSPECIFIED,
    },
  };
};

export const App: React.FC = () => {
  const [initialSession] = useState(() => createInitialBlankSession());
  const [conversations, setConversations] = useState<ConversationMeta[]>([initialSession.meta]);
  const [activeConversationId, setActiveConversationId] = useState<string>(initialSession.id);
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({
    [initialSession.id]: [],
  });
  const [userProfile] = useState(INITIAL_USER_PROFILE);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>(UI_STRINGS.MODEL_DEFAULT);
  const [responseLanguage, setResponseLanguage] = useState<string>(() => {
    return (
      localStorage.getItem(UI_STRINGS.STORAGE_KEY_RESPONSE_LANGUAGE) ||
      UI_STRINGS.DEFAULT_RESPONSE_LANGUAGE
    );
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Abort any in-flight stream on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  /**
   * Aborts the currently active SSE stream (diagnosis or translation) and resets streaming state.
   */
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  /**
   * Marks an in-progress assistant message as finalized after user-initiated cancellation,
   * preserving any partial content or reasoning already received.
   */
  const finalizeAbortedAssistantMessage = (
    targetConversationId: string,
    assistantMessageId: string,
    controller: AbortController
  ) => {
    if (abortControllerRef.current === controller) {
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setMessagesMap((prev) => {
      const currentList = prev[targetConversationId] || [];
      return {
        ...prev,
        [targetConversationId]: currentList.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content:
                  msg.content ||
                  (msg.thinkingContent
                    ? UI_STRINGS.EMPTY_STRING
                    : UI_STRINGS.RESPONSE_STOPPED_NOTICE),
                isStreaming: false,
                isThinking: false,
              }
            : msg
        ),
      };
    });
  };

  const handleSelectLanguage = (newLanguage: string) => {
    setResponseLanguage(newLanguage);
    localStorage.setItem(UI_STRINGS.STORAGE_KEY_RESPONSE_LANGUAGE, newLanguage);
  };

  // Sync user conversations from MongoDB on initial mount without overriding active blank session
  useEffect(() => {
    let isMounted = true;
    chatService
      .fetchUserConversations(UI_STRINGS.DEFAULT_USER_ID)
      .then((res: { conversations?: UserConversationSummary[] }) => {
        if (!isMounted || !res?.conversations || res.conversations.length === 0) {
          return;
        }

        const mapped: ConversationMeta[] = res.conversations.map((c) => ({
          id: c.sessionId,
          title: c.title,
          updatedAt: formatTimestamp(c.updatedAt),
          previewSnippet: c.previewSnippet,
          timeBucket: UI_STRINGS.TIME_BUCKET_TODAY,
          cropType: c.cropType,
        }));

        // Preserve active blank session at top of sidebar history, followed by past conversations
        setConversations((prev) => {
          const blankConv = prev.find(
            (c) =>
              c.title === UI_STRINGS.DEFAULT_CASE_TITLE ||
              c.previewSnippet === UI_STRINGS.FRESH_SESSION_SNIPPET
          );
          return blankConv ? [blankConv, ...mapped] : mapped;
        });
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Current active conversation meta
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const activeMessages = messagesMap[activeConversationId] || [];

  // Determines if a conversation is an uncommitted blank new chat
  const isBlankNewChat = (c: ConversationMeta): boolean => {
    const msgs = messagesMap[c.id];
    const hasNoMessages = !msgs || msgs.length === 0;
    const isBlank =
      c.title === UI_STRINGS.DEFAULT_CASE_TITLE ||
      c.previewSnippet === UI_STRINGS.FRESH_SESSION_SNIPPET;
    return hasNoMessages && isBlank;
  };

  // Create a new crop diagnostic session
  const handleNewChat = () => {
    // If the current active conversation is already empty, retain focus
    if (activeMessages.length === 0) {
      return;
    }

    if (isStreaming) {
      handleStopStreaming();
    }

    const newId = `${UI_STRINGS.PREFIX_CONVERSATION}${Date.now()}`;
    const newConv: ConversationMeta = {
      id: newId,
      title: UI_STRINGS.DEFAULT_CASE_TITLE,
      updatedAt: UI_STRINGS.TIME_JUST_NOW,
      previewSnippet: UI_STRINGS.FRESH_SESSION_SNIPPET,
      timeBucket: UI_STRINGS.TIME_BUCKET_TODAY,
      cropType: UI_STRINGS.CROP_UNSPECIFIED,
    };

    setConversations((prev) => [newConv, ...prev]);
    setMessagesMap((prev) => ({ ...prev, [newId]: [] }));
    setActiveConversationId(newId);
  };

  // Switch active conversation & remove uncommitted blank new chats
  const handleSelectConversation = (id: string) => {
    if (id !== activeConversationId && isStreaming) {
      handleStopStreaming();
    }
    // Purge any uncommitted blank new chats from history list when user clicks on a chat
    setConversations((prev) => prev.filter((c) => c.id === id || !isBlankNewChat(c)));

    setMessagesMap((prev) => {
      const updated = { ...prev };
      conversations.forEach((c) => {
        if (c.id !== id && isBlankNewChat(c)) {
          delete updated[c.id];
        }
      });
      return updated;
    });

    setActiveConversationId(id);
    if (!messagesMap[id] || messagesMap[id].length === 0) {
      chatService
        .loadSessionHistory(id)
        .then((sess: { turns?: RawTurn[] }) => {
          if (!sess?.turns) return;
          const messages: ChatMessage[] = [];
          for (const turn of sess.turns) {
            const timeStr = formatTimestamp(turn.timestamp);

            messages.push({
              id: `${UI_STRINGS.PREFIX_TURN_USER}${turn.turnId}`,
              role: UI_STRINGS.ROLE_USER,
              content: turn.prompt,
              timestamp: timeStr,
              imageAttachment: turn.imageBase64
                ? {
                    id: `${UI_STRINGS.PREFIX_TURN_IMAGE}${turn.turnId}`,
                    name: turn.imageMeta?.name || UI_STRINGS.DEFAULT_SPECIMEN_NAME,
                    url: turn.imageBase64,
                    sizeFormatted: UI_STRINGS.EMPTY_STRING,
                  }
                : undefined,
            });

            if (turn.completion) {
              messages.push({
                id: `${UI_STRINGS.PREFIX_TURN_ASSISTANT}${turn.turnId}`,
                role: UI_STRINGS.ROLE_ASSISTANT,
                content: turn.completion,
                timestamp: timeStr,
                diagnosticData: turn.diagnosticData,
                thinkingContent: turn.thinkingContent,
              });
            }
          }
          setMessagesMap((prev) => ({ ...prev, [id]: messages }));
        })
        .catch(() => {});
    }
  };

  // Delete conversation from UI state and permanently from MongoDB database
  const handleDeleteConversation = (id: string) => {
    if (id === activeConversationId && isStreaming) {
      handleStopStreaming();
    }
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);

    const updatedMessages = { ...messagesMap };
    delete updatedMessages[id];
    setMessagesMap(updatedMessages);

    // Permanently purge chat document from MongoDB database
    chatService.deleteChat(id, UI_STRINGS.DEFAULT_USER_ID).catch(() => {});

    if (activeConversationId === id) {
      if (updated.length > 0) {
        setActiveConversationId(updated[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  // Rename conversation title in UI and MongoDB database
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );

    // Persist new title into MongoDB
    chatService.renameChat(id, newTitle, UI_STRINGS.DEFAULT_USER_ID).catch(() => {});
  };

  // Request deletion confirmation dialog
  const handleRequestDelete = (id: string) => {
    setPendingDeleteId(id);
  };

  // Confirmed deletion from modal
  const handleConfirmDelete = () => {
    if (pendingDeleteId) {
      handleDeleteConversation(pendingDeleteId);
      setPendingDeleteId(null);
    }
  };

  // Cancel deletion dialog
  const handleCancelDelete = () => {
    setPendingDeleteId(null);
  };

  // Clear messages in current conversation with confirmation
  const handleClearChat = () => {
    setPendingDeleteId(activeConversationId);
  };

  // Send message and trigger assistant response
  const handleSendMessage = (text: string, image?: ImageAttachment, video?: VideoAttachment) => {
    const safeText = text.slice(0, UI_STRINGS.MAX_PROMPT_LENGTH);
    const userMessageId = `${UI_STRINGS.PREFIX_MSG_USER}${Date.now()}`;
    const timeFormatted = formatTimestamp();

    const newUserMessage: ChatMessage = {
      id: userMessageId,
      role: UI_STRINGS.ROLE_USER,
      content: safeText,
      timestamp: timeFormatted,
      imageAttachment: image,
      videoAttachment: video,
    };

    // Generate intelligent AI title for new conversation using ling-3.0-flash
    if (activeConversation && (activeConversation.title === UI_STRINGS.DEFAULT_CASE_TITLE || activeMessages.length === 0)) {
      chatService
        .generateChatTitle(activeConversationId, safeText, Boolean(image), Boolean(video))
        .then((generatedTitle) => {
          if (generatedTitle) {
            handleRenameConversation(activeConversationId, generatedTitle);
          }
        })
        .catch(() => {
          // Graceful fallback if network is unreachable
          const fallbackTitle = deriveChatTitle(safeText, Boolean(image), Boolean(video));
          handleRenameConversation(activeConversationId, fallbackTitle);
        });
    }

    const nextMessages = [...activeMessages, newUserMessage];
    setMessagesMap((prev) => ({
      ...prev,
      [activeConversationId]: nextMessages,
    }));

    // Trigger live vision-language diagnostic streaming via backend
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const targetConversationId = activeConversationId;
    setIsStreaming(true);

    const assistantMessageId = `${UI_STRINGS.PREFIX_MSG_ASSISTANT}${Date.now()}`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: UI_STRINGS.ROLE_ASSISTANT,
      content: UI_STRINGS.EMPTY_STRING,
      timestamp: formatTimestamp(),
      isStreaming: true,
      thinkingContent: UI_STRINGS.EMPTY_STRING,
      isThinking: true,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [targetConversationId]: [...nextMessages, initialAssistantMessage],
    }));

    chatService.streamChatMessage({
      sessionId: targetConversationId,
      userId: UI_STRINGS.DEFAULT_USER_ID,
      prompt: safeText,
      responseLanguage,
      imageAttachment: image,
      videoAttachment: video,
      modelId: UI_STRINGS.MODEL_ID_MIMO,
      signal: controller.signal,
      callbacks: {
        onThinkingDelta: (delta: string) => {
          setMessagesMap((prev) => {
            const currentList = prev[targetConversationId] || [];
            return {
              ...prev,
              [targetConversationId]: currentList.map((msg) =>
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
            const currentList = prev[targetConversationId] || [];
            return {
              ...prev,
              [targetConversationId]: currentList.map((msg) =>
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
          if (diagnosticData?.crop && diagnosticData?.disease) {
            const diagnosedTitle = `${diagnosticData.crop} ${diagnosticData.disease} Analysis`;
            handleRenameConversation(targetConversationId, diagnosedTitle);
          }

          setMessagesMap((prev) => {
            const currentList = prev[targetConversationId] || [];
            return {
              ...prev,
              [targetConversationId]: currentList.map((msg) =>
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
          if (abortControllerRef.current === controller) {
            abortControllerRef.current = null;
          }
          setIsStreaming(false);
          setMessagesMap((prev) => {
            const currentList = prev[targetConversationId] || [];
            return {
              ...prev,
              [targetConversationId]: currentList.map((msg) =>
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
        onAbort: () => {
          finalizeAbortedAssistantMessage(targetConversationId, assistantMessageId, controller);
        },
        onComplete: () => {
          if (abortControllerRef.current === controller) {
            abortControllerRef.current = null;
          }
          setIsStreaming(false);
          setMessagesMap((prev) => {
            const currentList = prev[targetConversationId] || [];
            return {
              ...prev,
              [targetConversationId]: currentList.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, isStreaming: false, isThinking: false }
                  : msg
              ),
            };
          });

          // Refresh user conversations from MongoDB to sync titles and previews
          chatService
            .fetchUserConversations(UI_STRINGS.DEFAULT_USER_ID)
            .then((res: { conversations?: UserConversationSummary[] }) => {
              if (res?.conversations && res.conversations.length > 0) {
                const mapped: ConversationMeta[] = res.conversations.map((c) => ({
                  id: c.sessionId,
                  title: c.title,
                  updatedAt: formatTimestamp(c.updatedAt),
                  previewSnippet: c.previewSnippet,
                  timeBucket: UI_STRINGS.TIME_BUCKET_TODAY,
                  cropType: c.cropType,
                }));
                setConversations(mapped);
              }
            })
            .catch(() => {});
        },
      },
    });
  };

  // Translate a specific assistant message and append the translated response to the chat
  const handleTranslateMessage = (message: ChatMessage, targetLanguage: string) => {
    if (isStreaming || !message.content.trim()) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const targetConversationId = activeConversationId;
    setIsStreaming(true);

    const assistantMessageId = `${UI_STRINGS.PREFIX_MSG_ASSISTANT}${Date.now()}`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: UI_STRINGS.ROLE_ASSISTANT,
      content: UI_STRINGS.EMPTY_STRING,
      timestamp: formatTimestamp(),
      isStreaming: true,
      thinkingContent: UI_STRINGS.EMPTY_STRING,
      isThinking: false,
      translationTarget: targetLanguage,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [targetConversationId]: [...(prev[targetConversationId] || []), initialAssistantMessage],
    }));

    chatService.streamTranslation({
      sessionId: targetConversationId,
      userId: UI_STRINGS.DEFAULT_USER_ID,
      content: message.content,
      targetLanguage,
      signal: controller.signal,
      callbacks: {
        onTextDelta: (delta: string) => {
          setMessagesMap((prev) => {
            const currentList = prev[targetConversationId] || [];
            return {
              ...prev,
              [targetConversationId]: currentList.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: msg.content + delta,
                    }
                  : msg
              ),
            };
          });
        },
        onDiagnosticData: (diagnosticData: DiagnosticData, markdownReport: string) => {
          setMessagesMap((prev) => {
            const currentList = prev[targetConversationId] || [];
            return {
              ...prev,
              [targetConversationId]: currentList.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: markdownReport || msg.content,
                      diagnosticData,
                    }
                  : msg
              ),
            };
          });
        },
        onError: (errorMessage: string) => {
          if (abortControllerRef.current === controller) {
            abortControllerRef.current = null;
          }
          setIsStreaming(false);
          setMessagesMap((prev) => {
            const currentList = prev[targetConversationId] || [];
            return {
              ...prev,
              [targetConversationId]: currentList.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: msg.content
                        ? `${msg.content}\n\n[${UI_STRINGS.DIAGNOSTIC_ALERT_TITLE}: ${errorMessage}]`
                        : `[${UI_STRINGS.DIAGNOSTIC_SERVICE_NOTICE_TITLE}: ${errorMessage}]`,
                      isStreaming: false,
                    }
                  : msg
              ),
            };
          });
        },
        onAbort: () => {
          finalizeAbortedAssistantMessage(targetConversationId, assistantMessageId, controller);
        },
        onComplete: () => {
          if (abortControllerRef.current === controller) {
            abortControllerRef.current = null;
          }
          setIsStreaming(false);
          setMessagesMap((prev) => {
            const currentList = prev[targetConversationId] || [];
            return {
              ...prev,
              [targetConversationId]: currentList.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      isStreaming: false,
                    }
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
      {/* Left Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        user={userProfile}
        responseLanguage={responseLanguage}
        onSelectLanguage={handleSelectLanguage}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleRequestDelete}
        onRenameConversation={handleRenameConversation}
      />

      {/* Main Center Chat View */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative z-10 bg-transparent">
        {/* Top Header */}
        <ChatHeader
          title={activeConversation?.title || UI_STRINGS.APP_TITLE}
          isSidebarOpen={isSidebarOpen}
          hasActiveSession={activeMessages.length > 0}
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
          onTranslate={handleTranslateMessage}
          onRegenerateLast={() => {
            if (activeMessages.length > 0) {
              const lastUserMsg = [...activeMessages].reverse().find((m) => m.role === UI_STRINGS.ROLE_USER);
              if (lastUserMsg) {
                handleSendMessage(lastUserMsg.content, lastUserMsg.imageAttachment);
              }
            }
          }}
        />

        {/* Center Floating Input Deck */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isStreaming}
          isStreaming={isStreaming}
          onStopStreaming={handleStopStreaming}
        />
      </main>

      {/* Delete Conversation Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(pendingDeleteId)}
        conversationTitle={conversations.find((c) => c.id === pendingDeleteId)?.title}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};
