import React from 'react';
import { App } from './App';

export interface VistaraChatbotProps {
  initialTitle?: string;
  defaultModel?: string;
  onDiagnosticReportGenerated?: (report: unknown) => void;
}

/**
 * Vistara: Vision-language System for Transformer-based Agricultural disease Recognition and Analysis.
 * 
 * Features:
 * - Collapsible left sidebar with real-time crop session search and chronologically grouped cases
 * - Accounts section at bottom-left with agronomist profile, research tier, and settings popover
 * - Center active chat area with EB Garamond 300 typography and pathology report cards
 * - Center floating input deck with dedicated leaf/crop image upload icon and live specimen preview
 * - Atmospheric background gradient orbs (Mint, Peach, Lavender, Sky, Rose)
 * - Exclusively uses Lucide React icons with zero emojis
 * - Centralized UI strings constant file
 */
export const VistaraChatbot: React.FC<VistaraChatbotProps> = () => {
  return <App />;
};

export const ChatbotUI = VistaraChatbot;
export default VistaraChatbot;
