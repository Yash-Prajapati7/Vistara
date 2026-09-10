# Vistara Frontend Development Guidelines & Agent Rules

This document establishes the architecture, design guidelines, coding standards, and operational rules for the frontend of **Vistara** (*VIsion-language System for Transformer-based Agricultural disease Recognition and Analysis*).

All coding agents working on this codebase must strictly adhere to these rules.

---

## 1. Domain & Product Context

- **System Identity**: **Vistara** is a Vision-Language System for Transformer-based Agricultural disease Recognition and Analysis.
- **Primary Persona**: Farmers, agronomists, crop researchers, and agricultural extension officers.
- **Core Workflow**:
  1. User/Farmer uploads a field photo of symptomatic crop foliage (leaf, stem, lesion, or fruit).
  2. The AI vision-language model evaluates foliar symptoms, identifies causal pathogens, and calculates a confidence score and severity index.
  3. The system generates an immediate pathology report with actionable agronomic countermeasures (targeted chemical fungicides/pesticides with dilution dosage, organic/bio-control alternatives, and cultural preventive actions).
- **Scope Restriction**: Keep the interface clean and tailored strictly to crop disease recognition and diagnosis. Do not re-introduce audio waveform components unless explicitly requested.

---

## 2. Directory Structure & Workspace Rules

- **Frontend Isolation**: All frontend source code, dependencies, build configs, and static assets live exclusively under [`frontend/`](file:///c:/Users/pyash/Music/Projects/Final%20Year%20Project/frontend).
- **Reserved Backend**: The repository root is reserved for `frontend/` and future `backend/` microservices. Never write frontend source files or `node_modules` directly into the repository root.
- **CLI Commands**: Always execute frontend commands within `frontend/`:
  ```bash
  cd frontend
  npm run dev      # Local Vite development server
  npm run build    # TypeScript check + production Vite build
  ```

---

## 3. Styling Standards & Tailwind CSS

- **Tailwind CSS v3**: All component styling must use **Tailwind CSS utility classes**. Do NOT use inline CSS style objects or separate plain CSS stylesheets.
- **Configuration**: All design tokens are registered in [`frontend/tailwind.config.js`](file:///c:/Users/pyash/Music/Projects/Final%20Year%20Project/frontend/tailwind.config.js).
- **Color Palette (ElevenLabs Editorial Aesthetic)**:
  - Base Canvas: `bg-canvas` (`#f5f5f5`), `bg-canvas-soft` (`#fafafa`)
  - Ink & Text: `text-ink` (`#0c0a09`), `text-body` (`#4e4e4e`), `text-body-strong` (`#292524`), `text-muted` (`#777169`), `text-muted-soft` (`#a8a29e`)
  - Primary Action / CTAs: `bg-primary` (`#292524`) with hover `bg-primary-active` (`#0c0a09`) and `text-on-primary` (`#ffffff`). Always near-black ink pills — never saturated neon buttons.
  - Surface Cards: `bg-surface-card` (`#ffffff`), `bg-surface-strong` (`#f0efed`)
  - Hairlines / Borders: `border-hairline` (`#e7e5e4`), `border-hairline-soft` (`#f0efed`), `border-hairline-strong` (`#d6d3d1`)
  - Semantic Status: `text-semantic-success` (`#16a34a`), `text-semantic-error` (`#dc2626`)
- **Atmospheric Gradient Stops**:
  - Mint (`#a7e5d3`), Peach (`#f4c5a8`), Lavender (`#c8b8e0`), Sky (`#a8c8e8`), and Rose (`#e8b8c4`).
  - **Rule**: These are used solely as soft radial background blurs (`AtmosphericOrbs`), never as button fills, borders, or text colors.
- **Geometry & Elevation**:
  - Buttons, badges, and search bars use `rounded-pill` (`9999px`).
  - Cards use `rounded-2xl` (16px/24px).
  - Elevation uses single-tier subtle drops: `shadow-subtle`, `shadow-soft` (`0 4px 16px rgba(0,0,0,0.04)`), `shadow-popover`.
- **Layout Rhythm & Alignment**:
  - The top navigation bar (`ChatHeader`) is strictly `h-16` (64px).
  - The sidebar header container must match `h-16` with vertical centering (`h-16 flex items-center justify-between px-4 border-b border-hairline flex-shrink-0`) to ensure clean horizontal border alignment across the screen.

---

## 4. Typography Rules

- **Display Headings**:
  - Use `font-display` (**EB Garamond** 300 serif, substitute for Waldenburg Light).
  - Weight must stay at **300 (Light)** with negative letter-spacing.
  - **CRITICAL**: Never bold display headlines. Bolding breaks the editorial magazine aesthetic.
- **Body, Navigation, Badges & Buttons**:
  - Use `font-body` (**Inter**).
  - Body text runs at 400 with slight tracking (`tracking-[0.14px]` to `tracking-[0.16px]`).
  - Buttons and titles run at weight 500/600.

---

## 5. Iconography: Lucide React Only (No Emojis)

- **Icons**: Exclusively import icons from `lucide-react` (e.g., `Sprout`, `Leaf`, `Activity`, `ShieldAlert`, `Search`, `Image`, `ArrowUp`, `Check`, `Copy`, `RotateCcw`, `ThumbsUp`, `ThumbsDown`, `Plus`, `Trash2`, `Edit3`, `SlidersHorizontal`, etc.).
- **STRICTLY NO EMOJIS**: Emojis are completely banned across the UI, mock datasets, buttons, badges, and code comments.

---

## 6. Centralized String Constants Policy

- **No Raw Strings in Components**: Do not hardcode recurring plain strings directly in JSX or handlers.
- **Single Source of Truth**: All recurring user roles, action names, placeholders, tooltips, aria-labels, status tags, time bucket keys, and report labels must be maintained in [`frontend/src/constants/uiStrings.ts`](file:///c:/Users/pyash/Music/Projects/Final%20Year%20Project/frontend/src/constants/uiStrings.ts).
- **Usage Example**:
  ```tsx
  // Good:
  <span>{isUser ? UI_STRINGS.USER_ROLE_LABEL : UI_STRINGS.BRAND_NAME}</span>
  <input placeholder={UI_STRINGS.INPUT_PLACEHOLDER} aria-label={UI_STRINGS.INPUT_PLACEHOLDER} />
  
  // Bad:
  <span>{isUser ? 'Agronomist' : 'Vistara'}</span>
  <input placeholder="Describe crop symptoms..." />
  ```

---

## 7. Component Architecture Guidelines

- **Sidebar (`frontend/src/components/Sidebar/`)**:
  - `Sidebar.tsx`: Handles collapsible drawer states, branding, `+ New Analysis` button, search, history, and bottom-left account section.
  - `SearchBar.tsx`: Real-time conversation/case filtering with `Ctrl + K` badge.
  - `ChatHistory.tsx`: Grouped by time buckets (`today`, `yesterday`, `previous_week`) with inline rename and delete controls.
  - `AccountSection.tsx`: Positioned at the bottom-left with agronomist initials avatar, research tier badge, and popover settings menu.
- **Chat (`frontend/src/components/Chat/`)**:
  - `ChatHeader.tsx`: Shows case title, model selector pill dropdown (`Vistara AgriVision 2.0`), share, and clear buttons.
  - `MessageList.tsx`: Auto-scrolling viewport with streaming response indicator.
  - `MessageItem.tsx`: Renders user messages (with clickable leaf image thumbnail and modal lightbox) and assistant pathology assessment cards (target crop, pathogen, confidence pill, severity, chemical countermeasure, organic alternative, preventive action).
  - `EmptyState.tsx`: Editorial greeting with 4 actionable suggestion prompt cards.
- **Input Deck (`frontend/src/components/InputDeck/`)**:
  - `ChatInput.tsx`: Floating center card (`max-w-[760px]`) with dedicated `Image` upload icon button, hidden file input, drag-and-drop overlay, auto-resizing textarea, mic dictation button, and ink send pill.
  - `ImagePreview.tsx`: Live thumbnail chip for staged crop photos with dismiss button.

---

## 8. Verification & Pre-commit Checklist

Before committing or completing any frontend task:
1. Ensure no raw plain strings were introduced in JSX (reference `UI_STRINGS`).
2. Verify that `lucide-react` is used and zero emojis are present.
3. Confirm Tailwind CSS classes are valid (avoid non-existent scale values like `pt-4.5`).
4. Run strict TypeScript check and production bundle:
   ```bash
   cd frontend && npm run build
   ```
   Must exit with code 0 and zero compilation warnings.
