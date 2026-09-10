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
    setMessagesMap((prev) => ({ ...prev, [activeConversationId]: [] }));
  };

  // Send message and trigger assistant response
  const handleSendMessage = (text: string, image?: ImageAttachment) => {
    const userMessageId = `msg-u-${Date.now()}`;
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: text,
      timestamp: timeFormatted,
      imageAttachment: image,
    };

    // Update conversation title if it's currently generic
    if (activeConversation && (activeConversation.title === UI_STRINGS.DEFAULT_CASE_TITLE || activeMessages.length === 0)) {
      const derivedTitle = text.slice(0, 34) || (image ? 'Leaf Pathology Diagnostic Scan' : 'Crop Symptom Analysis');
      handleRenameConversation(activeConversationId, derivedTitle);
    }

    const nextMessages = [...activeMessages, newUserMessage];
    setMessagesMap((prev) => ({
      ...prev,
      [activeConversationId]: nextMessages,
    }));

    // Trigger simulated assistant response with streaming simulation
    setIsStreaming(true);

    setTimeout(() => {
      const assistantMessageId = `msg-a-${Date.now()}`;
      let responseText = '';
      let diagnosticData: DiagnosticData | undefined = undefined;

      if (image) {
        responseText = `### Diagnostic Report: Foliage Lesion Recognition

Vistara's **${selectedModel}** vision-language pipeline processed the uploaded specimen image (**${image.name}**).

#### Primary Findings & Pathogen Analysis
* **Identified Disease**: **Early Blight (*Alternaria solani*)**
* **Confidence Level**: **96.8%**
* **Foliar Damage Rating**: **Moderate (28% canopy leaf area affected)**
* **Characteristic Markers**: Dark brown concentric ring lesions ("target-board" appearance) with chlorotic yellow margins on mature leaves.

#### Recommended Agronomic Interventions
1. **Immediate Spray Protocol**:
   - Apply *Chlorothalonil* (75% WP) at 2.0 g/L or *Azoxystrobin* (23% SC) at 1.0 mL/L for active spore suppression.
2. **Organic / Biological Alternative**:
   - Bio-fungicide spray containing *Trichoderma viride* or copper octanoate soap at 5-day intervals.
3. **Preventive Canopy Hygiene**:
   - Prune bottom leaves within 15 cm of soil surface to avoid splash dispersal of soil-borne spores.`;

        diagnosticData = {
          crop: 'Solanaceae Crop (Foliage Specimen)',
          disease: 'Early Blight (Alternaria solani)',
          pathogenType: 'Fungal',
          confidence: 96.8,
          severity: 'Moderate',
          symptoms: [
            'Concentric circular target-board spots',
            'Chlorotic halo surrounding necrotic centers',
            'Progressive defoliation starting from basal foliage',
          ],
          organicTreatment: 'Trichoderma viride (10g/L) or Copper octanoate soap',
          chemicalTreatment: 'Chlorothalonil (2g/L) or Azoxystrobin (1mL/L)',
          preventativeAction: 'Lower canopy pruning, drip irrigation conversion, crop rotation',
        };
      } else if (text.toLowerCase().includes('rust')) {
        responseText = `### Cereal Pathology Assessment: Stripe Rust (*Puccinia striiformis*)

#### Diagnostic Characteristics
* **Pathogen**: *Puccinia striiformis f. sp. tritici*
* **Primary Target**: Wheat, Barley, and Triticale flag leaves
* **Visual Symptoms**: Bright yellow-to-orange linear pustules (uredinia) aligned strictly between leaf veins.
* **Estimated Yield Impact**: Potential 30% - 50% loss if flag leaf is infected before milky ripe stage.

#### Prescribed Field Treatment
1. **Systemic Triazole Application**: Spray *Tebuconazole* (250 EC) at 1.0 L/ha or *Propiconazole* (250 EC) at 500 mL/ha upon initial pustule detection.
2. **Monitoring Window**: Rescan foliage within 7–10 days to verify lesion arrest and lack of new spore pustules.`;

        diagnosticData = {
          crop: 'Triticum aestivum (Wheat)',
          disease: 'Stripe Rust (Puccinia striiformis)',
          pathogenType: 'Fungal',
          confidence: 98.2,
          severity: 'Severe',
          symptoms: [
            'Linear yellow-orange pustule rows between leaf veins',
            'Premature desiccation of flag leaf canopy',
            'Reduced grain test weight and shriveled kernels',
          ],
          organicTreatment: 'Preventive sulfur dust (80% WP) or biological Bacillus amyloliquefaciens',
          chemicalTreatment: 'Tebuconazole 250 EC (1.0 L/ha) or Propiconazole (500 mL/ha)',
          preventativeAction: 'Plant rust-resistant cultivars, monitor prevailing windward spore fronts',
        };
      } else {
        responseText = `### Symptom Assessment & Agronomic Inquiry

I have logged your clinical field query regarding: **"${text.slice(0, 60)}${text.length > 60 ? '...' : ''}"**.

#### Agronomic Evaluation & Next Steps
* To ensure precise pathogen differentiation between abiotic physiological stress (e.g. nitrogen/potassium chlorosis) and biotic fungal/bacterial leaf spot, **uploading a macro photo of the symptomatic leaf** is highly recommended.
* Vistara's **${selectedModel}** evaluates spatial lesion borders, color histograms, and venation patterns with zero-shot transformer vision encoders.

Would you like specific fungicide dosage charts, organic bio-stimulant protocols, or guidance on leaf sampling techniques?`;
      }

      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        diagnosticData,
      };

      setMessagesMap((prev) => ({
        ...prev,
        [activeConversationId]: [...nextMessages, assistantMessage],
      }));
      setIsStreaming(false);
    }, 1100);
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
