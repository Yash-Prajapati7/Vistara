import React, { useState } from 'react';
import {
  Sprout,
  User,
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Brain,
  ChevronDown,
  ChevronRight,
  Video as VideoIcon,
} from 'lucide-react';
import { ChatMessage } from '../../types/chat';
import { UI_STRINGS } from '../../constants/uiStrings';

interface MessageItemProps {
  message: ChatMessage;
  onRegenerate?: () => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onRegenerate }) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<typeof UI_STRINGS.FEEDBACK_UP | typeof UI_STRINGS.FEEDBACK_DOWN | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [userToggledThinking, setUserToggledThinking] = useState<boolean | null>(null);

  const isUser = message.role === UI_STRINGS.ROLE_USER;
  const hasThinking = Boolean(message.thinkingContent || message.isThinking);
  const isThinkingActive = Boolean(message.isThinking);
  const isThinkingExpanded = userToggledThinking !== null ? userToggledThinking : isThinkingActive;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Render markdown-like sections (headers, bullet points, bold tags)
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, lineIdx) => {
      // Header 3 (### )
      if (line.startsWith('### ')) {
        return (
          <h3
            key={lineIdx}
            className="font-display text-[22px] font-normal tracking-tight mt-3.5 mb-2 text-ink dark:text-on-dark"
          >
            {line.replace('### ', '')}
          </h3>
        );
      }

      // Header 4 (#### )
      if (line.startsWith('#### ')) {
        return (
          <h4
            key={lineIdx}
            className="font-body text-[15px] font-semibold tracking-wide mt-3 mb-1.5 text-ink dark:text-on-dark"
          >
            {line.replace('#### ', '')}
          </h4>
        );
      }

      // Bullet points (* or -)
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const bulletText = line.trim().substring(2);
        return (
          <li
            key={lineIdx}
            className="ml-5 mb-1 leading-relaxed text-[15px] text-body-strong dark:text-on-dark/90 list-disc"
          >
            {parseBold(bulletText)}
          </li>
        );
      }

      // Numbered lists (1. 2. etc)
      if (/^\d+\.\s/.test(line.trim())) {
        return (
          <div
            key={lineIdx}
            className="ml-3.5 mb-1.5 leading-relaxed text-[15px] text-body-strong dark:text-on-dark/90"
          >
            {parseBold(line)}
          </div>
        );
      }

      // Empty line spacing
      if (!line.trim()) {
        return <div key={lineIdx} className="h-2" />;
      }

      // Standard paragraph
      return (
        <p
          key={lineIdx}
          className="leading-relaxed text-[15px] mb-1.5 text-body-strong dark:text-on-dark/90 tracking-[0.14px]"
        >
          {parseBold(line)}
        </p>
      );
    });
  };

  // Helper for bold **text**
  const parseBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-ink dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div
      className={`flex flex-col w-full mb-7 animate-fade-in ${
        isUser ? 'items-end' : 'items-start'
      }`}
    >
      <div
        className={`flex gap-3 max-w-[86%] items-start ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {/* Role Avatar */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-subtle ${
            isUser
              ? 'bg-surface-strong dark:bg-white/10 text-ink dark:text-on-dark'
              : 'bg-ink dark:bg-white text-on-primary dark:text-ink'
          }`}
        >
          {isUser ? (
            <User size={16} strokeWidth={1.8} />
          ) : (
            <Sprout size={16} strokeWidth={2.2} />
          )}
        </div>

        {/* Message Content Area */}
        <div className="flex flex-col gap-2 min-w-[240px]">
          {/* Header with name and timestamp */}
          <div
            className={`flex items-center gap-2 text-xs text-muted dark:text-muted-soft ${
              isUser ? 'justify-end' : 'justify-start'
            }`}
          >
            <span className="font-medium text-ink dark:text-on-dark">
              {isUser ? UI_STRINGS.USER_ROLE_LABEL : UI_STRINGS.BRAND_NAME}
            </span>
            <span>{message.timestamp}</span>
          </div>

          {/* Attached Crop Foliage Image Preview (User message) */}
          {message.imageAttachment && (
            <div
              className="relative inline-block rounded-xl overflow-hidden border border-hairline dark:border-white/10 shadow-subtle bg-surface-card dark:bg-surface-dark-elevated max-w-[320px] cursor-pointer group"
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={message.imageAttachment.url}
                alt={message.imageAttachment.name}
                className="w-full max-h-[220px] object-cover block"
              />
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-white/95 dark:bg-surface-dark-elevated text-[11.5px] text-ink dark:text-on-dark">
                <span className="truncate max-w-[200px]">
                  {message.imageAttachment.name}
                </span>
                <ExternalLink size={12} className="text-muted dark:text-muted-soft" />
              </div>
            </div>
          )}

          {/* Attached Crop Field Video Player (User message) */}
          {message.videoAttachment && (
            <div className="relative inline-block rounded-xl overflow-hidden border border-hairline dark:border-white/10 shadow-subtle bg-surface-card dark:bg-surface-dark-elevated max-w-[380px]">
              <video
                controls
                playsInline
                src={message.videoAttachment.url}
                className="w-full max-h-[240px] bg-black/90 block object-contain"
              />
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-white/95 dark:bg-surface-dark-elevated text-[11.5px] text-ink dark:text-on-dark">
                <div className="flex items-center gap-1.5 truncate max-w-[260px]">
                  <VideoIcon size={13} className="text-muted dark:text-muted-soft flex-shrink-0" />
                  <span className="truncate">{message.videoAttachment.name}</span>
                </div>
                {message.videoAttachment.sizeFormatted && (
                  <span className="text-[10px] text-muted dark:text-muted-soft flex-shrink-0">
                    {message.videoAttachment.sizeFormatted}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Text Bubble */}
          <div
            className={`bg-surface-card dark:bg-surface-dark-elevated text-ink dark:text-on-dark p-4 sm:p-5 border border-hairline dark:border-white/10 shadow-subtle ${
              isUser
                ? 'rounded-2xl rounded-tr-sm'
                : 'rounded-2xl rounded-tl-sm'
            }`}
          >
            {/* Model Thinking & Diagnostic Reasoning Showcase */}
            {!isUser && hasThinking && (
              <div className="mb-4 border border-hairline dark:border-white/10 rounded-xl overflow-hidden bg-canvas-soft/70 dark:bg-surface-dark/60 transition-all">
                <button
                  type="button"
                  onClick={() => setUserToggledThinking(!isThinkingExpanded)}
                  aria-label={isThinkingExpanded ? UI_STRINGS.THINKING_HIDE_LABEL : UI_STRINGS.THINKING_SHOW_LABEL}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-muted dark:text-muted-soft hover:text-ink dark:hover:text-on-dark transition-colors cursor-pointer bg-surface-card/60 dark:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-2">
                    <Brain
                      size={14}
                      className={
                        isThinkingActive
                          ? 'text-primary dark:text-gradient-peach animate-pulse'
                          : 'text-muted dark:text-muted-soft'
                      }
                    />
                    <span className="font-medium">
                      {isThinkingActive
                        ? UI_STRINGS.THINKING_IN_PROGRESS
                        : UI_STRINGS.THINKING_HEADER}
                    </span>
                    <span
                      className={`badge-pill text-[10px] py-0 px-1.5 ${
                        isThinkingActive
                          ? 'bg-primary/10 text-primary dark:text-gradient-peach border-transparent'
                          : 'bg-surface-card dark:bg-white/5 text-muted dark:text-muted-soft border-hairline dark:border-white/10'
                      }`}
                    >
                      {isThinkingActive
                        ? UI_STRINGS.THINKING_BADGE_STREAMING
                        : UI_STRINGS.THINKING_BADGE_COMPLETE}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isThinkingExpanded ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </div>
                </button>

                {/* Expandable Reasoning Scratchpad */}
                {isThinkingExpanded && (
                  <div className="p-3 border-t border-hairline-soft dark:border-white/10 max-h-60 overflow-y-auto font-mono text-[11.5px] leading-relaxed text-body-strong dark:text-on-dark/80 whitespace-pre-wrap bg-canvas dark:bg-black/20">
                    {message.thinkingContent || (
                      <div className="flex items-center gap-2 text-muted dark:text-muted-soft italic">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                        <span>{UI_STRINGS.THINKING_IN_PROGRESS}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Formatted Text Content */}
            {message.content ? (
              renderFormattedContent(message.content)
            ) : (
              !isUser && message.isStreaming && !isThinkingActive && (
                <div className="flex items-center gap-2 text-xs text-muted dark:text-muted-soft py-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                  <span>{UI_STRINGS.GENERATING_RESPONSE}</span>
                </div>
              )
            )}

            {/* Diagnostic Pathology Metadata Card if available */}
            {message.diagnosticData && (
              <div className="mt-4 p-3.5 sm:p-4 bg-canvas-soft dark:bg-surface-dark border border-hairline dark:border-white/10 rounded-xl flex flex-col gap-2.5">
                <div className="flex items-center justify-between border-b border-hairline-soft dark:border-white/10 pb-2">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-semantic-success" />
                    <span className="text-xs font-semibold tracking-wider uppercase text-ink dark:text-on-dark">
                      {UI_STRINGS.DIAGNOSIS_SUMMARY}
                    </span>
                  </div>
                  <span className="badge-pill text-[11px] bg-surface-card dark:bg-surface-dark-elevated dark:text-on-dark dark:border-white/10">
                    {message.diagnosticData.confidence}% {UI_STRINGS.CONFIDENCE_LABEL}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12.5px]">
                  <div>
                    <span className="text-muted dark:text-muted-soft">{UI_STRINGS.CROP_LABEL}:</span>{' '}
                    <strong className="text-ink dark:text-on-dark">{message.diagnosticData.crop}</strong>
                  </div>
                  <div>
                    <span className="text-muted dark:text-muted-soft">{UI_STRINGS.SEVERITY_LABEL}:</span>{' '}
                    <strong className="text-ink dark:text-on-dark">{message.diagnosticData.severity}</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-muted dark:text-muted-soft">{UI_STRINGS.PATHOGEN_LABEL}:</span>{' '}
                    <strong className="text-ink dark:text-on-dark">{message.diagnosticData.disease}</strong> ({message.diagnosticData.pathogenType})
                  </div>
                </div>

                {message.diagnosticData.chemicalTreatment && (
                  <div className="text-[12.5px] mt-1 pt-2 border-t border-hairline-soft dark:border-white/10">
                    <div className="font-semibold text-ink dark:text-on-dark mb-0.5 flex items-center gap-1">
                      <AlertCircle size={13} className="text-primary dark:text-gradient-peach" />
                      {UI_STRINGS.CHEMICAL_TREATMENT_LABEL}:
                    </div>
                    <div className="text-body dark:text-muted-soft leading-normal">
                      {message.diagnosticData.chemicalTreatment}
                    </div>
                  </div>
                )}

                {message.diagnosticData.organicTreatment && (
                  <div className="text-[12.5px] pt-1">
                    <div className="font-semibold text-ink dark:text-on-dark mb-0.5 flex items-center gap-1">
                      <ShieldCheck size={13} className="text-semantic-success" />
                      {UI_STRINGS.ORGANIC_TREATMENT_LABEL}:
                    </div>
                    <div className="text-body dark:text-muted-soft leading-normal">
                      {message.diagnosticData.organicTreatment}
                    </div>
                  </div>
                )}

                {message.diagnosticData.preventativeAction && (
                  <div className="text-[12.5px] pt-1 text-muted dark:text-muted-soft leading-normal">
                    <strong className="text-ink dark:text-on-dark font-medium">{UI_STRINGS.PREVENTION_LABEL}:</strong>{' '}
                    {message.diagnosticData.preventativeAction}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Toolbar for Assistant Message */}
          {!isUser && (
            <div className="flex items-center gap-2 mt-0.5 pl-1">
              <button
                type="button"
                onClick={handleCopy}
                title={copied ? UI_STRINGS.COPIED : UI_STRINGS.COPY}
                aria-label={UI_STRINGS.COPY}
                className={`flex items-center gap-1 text-xs cursor-pointer py-1 px-1.5 rounded transition-colors ${
                  copied ? 'text-semantic-success' : 'text-muted dark:text-muted-soft hover:text-ink dark:hover:text-on-dark'
                }`}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? UI_STRINGS.COPIED : UI_STRINGS.COPY}</span>
              </button>

              {onRegenerate && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  title={UI_STRINGS.REGENERATE}
                  aria-label={UI_STRINGS.REGENERATE}
                  className="flex items-center gap-1 text-xs text-muted dark:text-muted-soft hover:text-ink dark:hover:text-on-dark cursor-pointer py-1 px-1.5 rounded transition-colors"
                >
                  <RotateCcw size={13} />
                  <span>{UI_STRINGS.REGENERATE}</span>
                </button>
              )}

              <div className="h-3 w-[1px] bg-hairline dark:bg-white/10 mx-0.5" />

              <button
                type="button"
                onClick={() =>
                  setFeedback(feedback === UI_STRINGS.FEEDBACK_UP ? null : UI_STRINGS.FEEDBACK_UP)
                }
                title={UI_STRINGS.THUMBS_UP}
                aria-label={UI_STRINGS.THUMBS_UP}
                className={`p-1 cursor-pointer transition-colors ${
                  feedback === UI_STRINGS.FEEDBACK_UP
                    ? 'text-ink dark:text-white'
                    : 'text-muted dark:text-muted-soft hover:text-ink dark:hover:text-on-dark'
                }`}
              >
                <ThumbsUp
                  size={13}
                  fill={
                    feedback === UI_STRINGS.FEEDBACK_UP
                      ? UI_STRINGS.ICON_FILL_CURRENT
                      : UI_STRINGS.ICON_FILL_NONE
                  }
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  setFeedback(feedback === UI_STRINGS.FEEDBACK_DOWN ? null : UI_STRINGS.FEEDBACK_DOWN)
                }
                title={UI_STRINGS.THUMBS_DOWN}
                aria-label={UI_STRINGS.THUMBS_DOWN}
                className={`p-1 cursor-pointer transition-colors ${
                  feedback === UI_STRINGS.FEEDBACK_DOWN
                    ? 'text-semantic-error'
                    : 'text-muted dark:text-muted-soft hover:text-ink dark:hover:text-on-dark'
                }`}
              >
                <ThumbsDown
                  size={13}
                  fill={
                    feedback === UI_STRINGS.FEEDBACK_DOWN
                      ? UI_STRINGS.ICON_FILL_CURRENT
                      : UI_STRINGS.ICON_FILL_NONE
                  }
                />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal for viewing high-res leaf specimen */}
      {lightboxOpen && message.imageAttachment && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 bg-ink/75 backdrop-blur-md flex items-center justify-center p-6 z-50 cursor-zoom-out"
        >
          <img
            src={message.imageAttachment.url}
            alt={message.imageAttachment.name}
            className="max-w-[90vw] max-h-[85vh] rounded-2xl shadow-card-elevated object-contain"
          />
        </div>
      )}
    </div>
  );
};
