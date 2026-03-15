# Architecture

**Analysis Date:** 2026-03-15

## Pattern Overview

**Overall:** Expo Router-based mobile-first React Native application with server-side API proxying for secure Claude AI integration. Layered separation between client UI, state management, and backend services.

**Key Characteristics:**
- File-based routing via Expo Router with tab navigator and onboarding stack
- Streaming AI responses via Vercel AI SDK (`useChat` hook) with server-side API proxy
- State persistence using Zustand with AsyncStorage backend
- Tailwind CSS styling via NativeWind for cross-platform consistency
- Optional Supabase integration (lazy-loaded, app functional without it)

## Layers

**Presentation Layer (UI):**
- Purpose: Render screens and handle user input
- Location: `app/(tabs)/`, `app/onboarding/`
- Contains: Screen components (Home, Chat, Settings), UI components
- Depends on: State layer (Zustand stores), Vercel AI SDK (`useChat`)
- Used by: Expo Router (entry point)

**State Layer (Client):**
- Purpose: Manage client-side application state with persistence
- Location: `store/` (e.g., `store/useAppStore.ts`, `store/useChatStore.ts`)
- Contains: Zustand store definitions with AsyncStorage middleware
- Depends on: React Native AsyncStorage
- Used by: All presentation components

**API Layer (Server):**
- Purpose: Secure server-side proxy for Claude API calls
- Location: `app/api/chat+api.ts`
- Contains: Server-only route handler using `streamText` and Vercel AI SDK
- Depends on: `@ai-sdk/anthropic`, `ANTHROPIC_API_KEY` environment variable
- Used by: Client via `useChat` hook streaming

**Infrastructure Layer:**
- Purpose: Shared utilities, type definitions, configurations
- Location: `lib/` (e.g., `lib/system-prompt.ts`, `lib/supabase.ts`, `lib/types.ts`)
- Contains: System prompts, Supabase client, type definitions, helper functions
- Depends on: Supabase SDK (optional), React
- Used by: Presentation and state layers

## Data Flow

**User Onboarding Flow:**

1. User opens app → Root layout `_layout.tsx` checks `useAppStore.hasCompletedOnboarding`
2. If false, Expo Router navigates to `onboarding/index.tsx`
3. Onboarding stack: class selection → board selection → language selection
4. Each step updates `useAppStore` (state persisted to AsyncStorage)
5. Final step sets `hasCompletedOnboarding = true`, navigation guards proceed to tabs

**Chat Message Flow:**

1. User enters message in `chat.tsx` screen
2. Component calls `sendMessage({ text })` from `useChat` hook
3. Hook serializes message, sends POST to `/api/chat` endpoint
4. Server route receives request, builds system prompt via `buildSystemPrompt(profile)`
5. Server calls `streamText()` with full system prompt + messages to Claude API
6. Server response streams back to client via `toUIMessageStreamResponse()`
7. `useChat` deserializes stream, updates local `messages` array (persisted to `useChatStore`)
8. Component re-renders with streamed content

**State Management:**

- `useAppStore`: Holds onboarding selections (class, board, language), user profile
- `useChatStore`: Caches current chat session messages, session metadata
- Both stores persist to AsyncStorage on every state change via Zustand persist middleware
- Profile context flows to system prompt builder: `buildSystemPrompt(profile)` adapts instructions for student's class/board

## Key Abstractions

**System Prompt Builder:**
- Purpose: Dynamically construct Claude system prompt with grade-level and curriculum context
- Examples: `lib/system-prompt.ts`
- Pattern: `buildSystemPrompt(profile: Profile) => string` — takes user profile, returns contextualized prompt string

**Chat Store:**
- Purpose: Abstract message history persistence and session state
- Examples: `store/useChatStore.ts`
- Pattern: Zustand store with `{ messages, addMessage, clearSession }` interface

**App Store (Profile):**
- Purpose: Abstract user profile and onboarding state
- Examples: `store/useAppStore.ts`
- Pattern: Zustand store with `{ class, board, language, hasCompletedOnboarding, setProfile }` interface

**Supabase Client:**
- Purpose: Lazy-initialized database client (app works without it)
- Examples: `lib/supabase.ts`
- Pattern: Singleton instance created only if `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` env vars exist

## Entry Points

**Root Layout:**
- Location: `app/_layout.tsx`
- Triggers: App startup (Expo Router loads this first)
- Responsibilities: Set up NativeWind styling, configure onboarding guard, wrap with necessary providers

**Tab Navigator Layout:**
- Location: `app/(tabs)/_layout.tsx`
- Triggers: After onboarding completion, root layout navigates here
- Responsibilities: Define tab structure (Home, Chat, Settings), configure tab icons/labels

**Home Screen:**
- Location: `app/(tabs)/index.tsx`
- Triggers: Initial tab view, user taps "Home" tab
- Responsibilities: Display student profile, quick stats, subject shortcuts, session history

**Chat Screen:**
- Location: `app/(tabs)/chat.tsx`
- Triggers: User taps "Ask GURUji" tab
- Responsibilities: Render chat message list, input field, handle message sending via `useChat`

**API Route (Chat Handler):**
- Location: `app/api/chat+api.ts`
- Triggers: POST request from client's `useChat` hook
- Responsibilities: Validate request, build system prompt, stream Claude API response back to client

## Error Handling

**Strategy:** Layer-specific error handling with user-facing fallbacks

**Patterns:**

- **API Errors**: Server route catches errors from Claude API, returns error response; client `useChat` hook updates status to "error"
- **Validation Errors**: Onboarding screens validate selections before persisting to store; chat input validates non-empty before sending
- **State Errors**: Zustand stores handle invalid state gracefully; missing profile defaults to NULL state (onboarding guard prevents access)
- **Storage Errors**: AsyncStorage errors in Zustand persist middleware are logged; state reverts to in-memory version
- **Network Errors**: Client detects connection failures in `useChat` status; displays offline banner or retry prompt

## Cross-Cutting Concerns

**Logging:** Console-based logging (no external service). API route logs requests, errors, token usage. Client logs `useChat` status transitions for debugging.

**Validation:** Onboarding screens validate class/board/language selections against predefined lists. Chat messages validated for non-empty content. API route validates ANTHROPIC_API_KEY presence before calling Claude.

**Authentication:** No user authentication currently. App identifies users by device-local state (AsyncStorage). Future: Supabase auth integration for cross-device sync.

**System Prompt Construction:** Happens server-side in API route. `buildSystemPrompt(profile)` reads profile (class, board, language) and appends grade-level calibration rules from `lib/system-prompt.ts`.

---

*Architecture analysis: 2026-03-15*
