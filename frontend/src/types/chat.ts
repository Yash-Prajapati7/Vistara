export type MessageRole = 'user' | 'assistant';

export interface ImageAttachment {
  id: string;
  name: string;
  url: string; // Object URL or base64
  sizeFormatted: string;
}

export interface VideoAttachment {
  id: string;
  name: string;
  url: string; // Object URL or base64
  sizeFormatted: string;
  mimeType?: string;
}

export type SeverityLevel = string;
export type PathogenCategory = string;

export interface DiagnosticData {
  crop: string;
  disease: string;
  pathogenType: PathogenCategory;
  confidence: number; // e.g. 96.8
  severity: SeverityLevel;
  symptoms: string[];
  organicTreatment: string;
  chemicalTreatment: string;
  preventativeAction: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  native: string;
  category: 'indian' | 'international';
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  imageAttachment?: ImageAttachment;
  videoAttachment?: VideoAttachment;
  diagnosticData?: DiagnosticData;
  isStreaming?: boolean;
  thinkingContent?: string;
  isThinking?: boolean;
  translationTarget?: string;
}

export type TimeBucket = 'today' | 'yesterday' | 'previous_week';

export interface ConversationMeta {
  id: string;
  title: string;
  updatedAt: string;
  previewSnippet: string;
  timeBucket: TimeBucket;
  cropType?: string;
}

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  avatarUrl?: string;
  initials: string;
  tier: 'RESEARCH PRO' | 'FIELD ADVISOR' | 'STANDARD';
  scansRemaining: string;
}

export interface SuggestionPrompt {
  id: string;
  title: string;
  description: string;
  promptText: string;
  tag: string;
  cropTarget: string;
}
